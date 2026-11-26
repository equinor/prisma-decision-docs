#!/usr/bin/env node
// Capture screenshots of the Prisma web app for the how-to documentation.
//
// Usage:
//   node tools/capture.mjs --project <export.json> [options]
//
// Options:
//   --project <file>    project export (JSON) imported into the local API before capturing
//                       (default: the single file in workflow/projects/)
//   --project-id <id>   use an already imported project instead of importing
//   --pages a,b,c       only capture these folders (see pages.mjs); default: all
//   --out <dir>         figures root (default: workflow/figures)
//   --theme light|dark  (default: light)
//   --viewport WxH      (default: 1440x900)
//   --keep              keep the imported project in the local database afterwards
//   --user <name>       Research-mode username (default: docs-bot)
//
// Requires the services started by tools/setup.sh.

import { chromium } from 'playwright';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './pages.mjs';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.dirname(TOOLS_DIR);
const SRC_DIR = process.env.PRISMA_SRC_DIR ?? path.dirname(DOCS_DIR);
const API_URL = process.env.PRISMA_API_URL ?? 'http://localhost:7075';
const WEB_URL = process.env.PRISMA_WEB_URL ?? 'http://127.0.0.1:5004';

const args = parseArgs(process.argv.slice(2));
const user = args.user ?? 'docs-bot';
const outDir = path.resolve(DOCS_DIR, args.out ?? 'workflow/figures');
const [width, height] = (args.viewport ?? '1440x900').split('x').map(Number);
const dark = args.theme === 'dark';
const selected = args.pages ? new Set(args.pages.split(',')) : null;

if (!args.project && !args['project-id']) {
	const dir = path.join(DOCS_DIR, 'workflow/projects');
	const files = (await readdir(dir).catch(() => [])).filter(f => f.endsWith('.json'));
	if (files.length === 1) args.project = path.join(dir, files[0]);
	else {
		console.error(
			files.length === 0
				? 'Provide --project <export.json> or --project-id <id>'
				: `Several exports in workflow/projects/, pick one with --project:\n  ${files.join('\n  ')}`,
		);
		process.exit(1);
	}
}

const api = async (method, route, body) => {
	const res = await fetch(`${API_URL}${route}`, {
		method,
		headers: { 'Content-Type': 'application/json', 'X-Username': user },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${await res.text()}`);
	return res.status === 204 ? null : res.json();
};

let projectId = args['project-id'];
let imported = false;
if (!projectId) {
	const data = JSON.parse(await readFile(args.project, 'utf8'));
	const [project] = await api('POST', '/projects/import', [data]);
	projectId = project.id;
	imported = true;
	console.log(`Imported "${project.name ?? args.project}" as ${projectId}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
await context.addInitScript(
	([u, d]) => {
		localStorage.setItem('username', u);
		localStorage.setItem('useDarkMode', JSON.stringify(d));
	},
	[user, dark],
);
const page = await context.newPage();
page.on('pageerror', e => console.warn(`  page error: ${e.message}`));

// Track in-flight API calls so we can wait for the data (not for Vite's dev
// server, whose module loading keeps "networkidle" from ever settling).
const pending = new Set();
const isApi = r => r.url().startsWith(API_URL);
page.on('request', r => isApi(r) && pending.add(r));
page.on('requestfinished', r => pending.delete(r));
page.on('requestfailed', r => pending.delete(r));
const waitForApiIdle = async (timeout = 45_000) => {
	const start = Date.now();
	let quietSince = null;
	while (Date.now() - start < timeout) {
		if (pending.size === 0) {
			quietSince ??= Date.now();
			if (Date.now() - quietSince >= 750) return;
		} else quietSince = null;
		await page.waitForTimeout(100);
	}
	console.warn(`  still waiting on ${pending.size} API call(s) after ${timeout / 1000}s, capturing anyway`);
};

// Canvas pages (React Flow) fit the view on mount, before their data has
// arrived; press the toolbar's "Fit view" once the content is there.
const fitCanvas = async () => {
	const fit = page.getByRole('button', { name: 'Fit view' });
	if ((await fit.count()) === 0) return;
	await fit.first().click();
	await page.mouse.move(0, 0);
	await page.waitForTimeout(400);
};

const captured = [];
try {
	for (const def of pages) {
		if (selected && !selected.has(def.folder)) continue;
		const folder = path.join(outDir, def.figureFolder ?? def.folder);
		await mkdir(folder, { recursive: true });
		// shot(name)                 full viewport
		// shot(name, locator, {pad}) the element plus `pad` px of context around it
		const shot = async (name, locator, { pad = 12, image } = {}) => {
			const file = path.join(folder, `${name}.png`);
			const descriptionFile = path.join(DOCS_DIR, 'workflow/figures', def.figureFolder ?? def.folder, `${name}.md`);
			const description = await readFile(descriptionFile, 'utf8');
			if (!description.trim()) throw new Error(`Empty figure description: ${descriptionFile}`);
			if (image) {
				if (locator) throw new Error(`${def.folder}/${name}: provide either an image or a locator, not both`);
				await writeFile(file, image);
			} else if (locator) {
				await locator.scrollIntoViewIfNeeded();
				const box = await locator.boundingBox();
				if (!box) throw new Error(`${def.folder}/${name}: element not visible`);
				const x = Math.max(0, box.x - pad);
				const y = Math.max(0, box.y - pad);
				const clip = {
					x,
					y,
					width: Math.min(width, box.x + box.width + pad) - x,
					height: Math.min(height, box.y + box.height + pad) - y,
				};
				if (clip.width <= 0 || clip.height <= 0) {
					throw new Error(`${def.folder}/${name}: element is outside the viewport`);
				}
				await page.screenshot({ path: file, animations: 'disabled', clip });
			} else {
				await page.screenshot({ path: file, animations: 'disabled' });
			}
			const outputDescription = path.join(folder, `${name}.md`);
			if (outputDescription !== descriptionFile) await writeFile(outputDescription, description);
			captured.push(path.relative(DOCS_DIR, file));
		};
		const url = def.route === null ? `${WEB_URL}/` : `${WEB_URL}/project/${projectId}/${def.route}`;
		process.stdout.write(`${def.title.padEnd(22)} ${url}\n`);
		await page.goto(url, { waitUntil: 'load' });
		await waitForApiIdle();
		await fitCanvas();
		await page.waitForTimeout(def.settle ?? 1000);
		await shot(`page - ${def.title}`);
		if (def.steps) {
			await def.steps({
				page,
				shot,
				projectId,
				projectFile: args.project ? path.resolve(args.project) : undefined,
				api,
				waitForApiIdle,
				fitCanvas,
			});
		}
	}
} finally {
	await browser.close();
	if (imported && !args.keep) {
		await api('DELETE', `/projects/${projectId}`);
		console.log('Removed imported project from local database');
	}
}

await writeVersions();
console.log(`\n${captured.length} figure(s) written under ${path.relative(DOCS_DIR, outDir)}/`);

// ----------------------------------------------------------------- helpers

function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (!a.startsWith('--')) continue;
		const key = a.slice(2);
		const next = argv[i + 1];
		if (next === undefined || next.startsWith('--')) out[key] = true;
		else out[key] = argv[++i];
	}
	return out;
}

function gitInfo(repo) {
	const dir = path.join(SRC_DIR, repo);
	const run = cmd => execSync(`git -C "${dir}" ${cmd}`, { encoding: 'utf8' }).trim();
	return { commit: run('rev-parse --short=10 HEAD'), date: run('log -1 --format=%cs') };
}

// Records which app versions the figures were captured from; setup.sh compares
// against it to tell whether a re-capture is needed.
async function writeVersions() {
	const file = path.join(outDir, 'versions.json');
	const versions = {
		captured_at: new Date().toISOString().slice(0, 10),
		project_file: args.project ? path.basename(args.project) : undefined,
		theme: dark ? 'dark' : 'light',
		viewport: `${width}x${height}`,
		web: gitInfo('prisma-decision-web'),
		api: gitInfo('prisma-decision-api'),
	};
	await writeFile(file, JSON.stringify(versions, null, 2) + '\n');
}
