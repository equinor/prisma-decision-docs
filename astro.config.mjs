// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from 'starlight-theme-md3';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import { satteri } from '@astrojs/markdown-satteri';
import { markdownLinks } from './src/plugins/markdown-links.mjs';
import { mathKatex } from './src/plugins/math-katex.mjs';

const GITHUB_REPO = 'https://github.com/equinor/prisma-decision-docs';

// Allow overriding site/base for forks or previews:
//   SITE=https://example.com BASE=/ npm run build
const site = process.env.SITE ?? 'https://equinor.github.io';
const base = process.env.BASE ?? '/prisma-decision-docs';

// https://astro.build/config
export default defineConfig({
	site,
	base,
	trailingSlash: 'always',
	// Bind to all interfaces so port forwarding works in Codespaces / dev containers,
	// where the forwarder connects over IPv4 while `localhost` resolves to `::1`.
	server: { host: true },
	markdown: {
		processor: satteri({
			// `math` parses $...$ / $$...$$; `rawHtml` lets inline HTML tables render.
			features: { math: true, rawHtml: true },
			mdastPlugins: [markdownLinks({ base })],
			hastPlugins: [mathKatex()],
		}),
	},
	integrations: [
		starlight({
			title: 'prisma-decision',
			description: 'Domain documentation for the prisma-decision decision analysis application.',
			logo: { src: './src/assets/prisma-logo.png', alt: 'Prisma logo' },
			favicon: '/favicon.png',
			components: { ThemeProvider: './src/components/ThemeProvider.astro' },
			social: [{ icon: 'github', label: 'GitHub', href: GITHUB_REPO }],
			editLink: { baseUrl: `${GITHUB_REPO}/edit/main/` },
			lastUpdated: true,
			customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
			// Each top-level section is a "topic" with its own sidebar; only the
			// current section's navigation is shown.
			plugins: [
				md3Theme(),
				starlightSidebarTopics([
					{
						label: 'Methodology',
						link: '/methodology/',
						icon: 'open-book',
						items: [
							{ label: 'Overview', slug: 'methodology' },
							{ label: 'DA/DQ', items: [{ autogenerate: { directory: 'methodology/da_dq' } }] },
							{
								label: 'Technical notes',
								items: [{ autogenerate: { directory: 'methodology/technical_notes' } }],
							},
						],
					},
					{
						label: 'Workflow',
						link: '/workflow/',
						icon: 'rocket',
						items: [{ autogenerate: { directory: 'workflow' } }],
					},
					{
						label: 'Troubleshooting',
						link: '/troubleshooting/',
						icon: 'warning',
						items: [{ autogenerate: { directory: 'troubleshooting' } }],
					},
				]),
			],
		}),
	],
});
