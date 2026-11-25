import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { guides } from './guides.mjs';
import { pages } from './pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('all captured pages have current merged guides', () => {
	assert.deepEqual(new Set(guides.map(guide => guide.page)), new Set(pages.map(page => page.folder)));
	assert.equal(new Set(guides.map(guide => guide.file ?? `${guide.page}.md`)).size, guides.length);
	execFileSync(process.execPath, ['tools/merge-guides.mjs', '--check'], { cwd: root, stdio: 'pipe' });
});

test('merged guides and the process index have working local links', async () => {
	const files = ['README.md', ...guides.map(guide => guide.file ?? `${guide.page}.md`)];
	for (const file of files) {
		const fullPath = path.join(root, 'workflow', file);
		const content = await readFile(fullPath, 'utf8');
		const links = new Set();
		let images = 0;
		for (const match of content.matchAll(/(!?)\[[^\]]*\]\((?:<([^>]+)>|([^)\s]+))\)/g)) {
			const target = match[2] ?? match[3];
			links.add(target);
			if (/^(?:https?:|#)/.test(target)) continue;
			await access(path.resolve(path.dirname(fullPath), target));
			if (match[1]) images++;
		}
		if (file === 'README.md') {
			for (const guide of guides) {
				assert.ok(links.has(`./${guide.file ?? `${guide.page}.md`}`), `Guide missing from process index: ${guide.page}`);
			}
			continue;
		}
		const guide = guides.find(guide => (guide.file ?? `${guide.page}.md`) === file);
		assert.equal(images, guide.sections.reduce((sum, section) => sum + section.figures.length, 0), file);
	}
});
