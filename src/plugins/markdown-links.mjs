// @ts-check
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineMdastPlugin } from 'satteri';

const RELATIVE_MD_LINK = /^(\.{1,2}\/[^#?]*?\.(?:md|mdx))(#.*)?$/i;

/**
 * Sätteri mdast plugin that rewrites relative links to Markdown files
 * (e.g. `./influence_diagram.md` or `../methodology/limid.md#section`) into the
 * URLs Starlight generates for those pages, including the configured `base`.
 *
 * This lets the source files stay browsable on GitHub while rendering
 * correctly on the published site.
 *
 * @param {{ base?: string; contentDir?: string }} [options]
 */
export function markdownLinks(options = {}) {
	const base = normaliseBase(options.base ?? '/');
	const contentDir = options.contentDir ?? path.join('src', 'content', 'docs');
	const marker = `${path.sep}${contentDir}${path.sep}`;

	return defineMdastPlugin({
		name: 'markdown-links',
		link(node, ctx) {
			rewrite(node, ctx);
		},
		definition(node, ctx) {
			rewrite(node, ctx);
		},
	});

	/**
	 * @param {{ url: string }} node
	 * @param {{ fileURL: URL | undefined; setProperty: Function }} ctx
	 */
	function rewrite(node, ctx) {
		if (!ctx.fileURL) return;
		const filePath = fileURLToPath(ctx.fileURL);
		const markerIndex = filePath.lastIndexOf(marker);
		if (markerIndex === -1) return;

		const docsRoot = filePath.slice(0, markerIndex + marker.length);
		const rewritten = rewriteUrl(node.url, { currentDir: path.dirname(filePath), docsRoot, base });
		if (rewritten) ctx.setProperty(node, 'url', rewritten);
	}
}

/** @param {string} base */
function normaliseBase(base) {
	const trimmed = base.replace(/^\/+|\/+$/g, '');
	return trimmed ? `/${trimmed}/` : '/';
}

/**
 * @param {string} url
 * @param {{ currentDir: string; docsRoot: string; base: string }} ctx
 */
function rewriteUrl(url, { currentDir, docsRoot, base }) {
	const match = RELATIVE_MD_LINK.exec(url);
	if (!match) return null;

	const [, relativeTarget, hash = ''] = match;
	const absoluteTarget = path.resolve(currentDir, relativeTarget);
	const relativeToDocs = path.relative(docsRoot, absoluteTarget);
	if (relativeToDocs.startsWith('..')) return null;

	const segments = relativeToDocs
		.split(path.sep)
		.map((segment, index, all) =>
			index === all.length - 1 ? segment.replace(/\.mdx?$/i, '') : segment,
		)
		.map(slugify);

	if (segments.at(-1) === 'index') segments.pop();

	const pathname = segments.length ? `${segments.join('/')}/` : '';
	return `${base}${pathname}${hash}`;
}

/** Mirrors how Astro slugifies content entry path segments. */
function slugify(/** @type {string} */ segment) {
	return segment
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\p{L}\p{N}_-]+/gu, '');
}
