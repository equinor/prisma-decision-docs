// @ts-check
import katex from 'katex';
import { defineHastPlugin, htmlToHast } from 'satteri';

/**
 * Sätteri hast plugin that renders math parsed by `features.math` with KaTeX.
 *
 * Sätteri emits inline math as `<code class="language-math math-inline">` and
 * display math as `<pre><code class="language-math math-display">`, the same
 * shape as remark-math, so this is the equivalent of rehype-katex.
 *
 * @param {import('katex').KatexOptions} [katexOptions]
 */
export function mathKatex(katexOptions = {}) {
	return defineHastPlugin({
		name: 'math-katex',
		element: {
			filter: ['code', 'pre'],
			visit(node, ctx) {
				if (node.tagName === 'pre') {
					const code = node.children?.find(
						(child) => child.type === 'element' && child.tagName === 'code',
					);
					if (!code || code.type !== 'element' || !hasClass(code, 'math-display')) return;
					ctx.replaceNode(node, render(ctx.textContent(code), true));
					return;
				}
				if (hasClass(node, 'math-inline')) {
					ctx.replaceNode(node, render(ctx.textContent(node), false));
				}
			},
		},
	});

	/**
	 * @param {string} tex
	 * @param {boolean} displayMode
	 */
	function render(tex, displayMode) {
		const html = katex.renderToString(tex, {
			...katexOptions,
			displayMode,
			throwOnError: false,
		});
		const root = htmlToHast(html, { fragment: true });
		return /** @type {any[]} */ ('children' in root ? root.children : []);
	}
}

/**
 * @param {{ properties?: Record<string, unknown> }} node
 * @param {string} name
 */
function hasClass(node, name) {
	const className = node.properties?.className;
	return Array.isArray(className) && className.includes(name);
}
