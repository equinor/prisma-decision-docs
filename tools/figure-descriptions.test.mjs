import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../workflow/figures/', import.meta.url));

test('every figure has a reusable Markdown description and a matching image link', async () => {
	let figures = 0;
	for (const entry of await readdir(root, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const folder = path.join(root, entry.name);
		const files = await readdir(folder);
		for (const file of files.filter(file => file.endsWith('.png'))) {
			const sidecar = file.replace(/\.png$/, '.md');
			assert.ok(files.includes(sidecar), `Missing description: ${entry.name}/${sidecar}`);
			const content = await readFile(path.join(folder, sidecar), 'utf8');
			assert.match(content, /^## .+\n\n(?:[^#!\s][^\n]*(?:\n[^#!\s][^\n]*)*\n\n)+!\[[^\]]+\]\(<\.\/.+\.png>\)\n(?:\n(?:> .+\n)+)?$/);
			assert.ok(content.includes(`](<./${file}>)\n`), `Wrong image link: ${entry.name}/${sidecar}`);
			figures++;
		}
		for (const file of files.filter(file => file.endsWith('.md'))) {
			assert.ok(files.includes(file.replace(/\.md$/, '.png')), `Orphan description: ${entry.name}/${file}`);
		}
	}
	assert.ok(figures > 0, 'No figures checked');
});
