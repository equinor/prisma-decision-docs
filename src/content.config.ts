import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		// Same as Starlight's docsLoader, but additionally ignores README.md files,
		// which document a folder on GitHub without becoming pages of the site.
		loader: glob({
			base: './src/content/docs',
			pattern: ['**/[^_]*.{md,mdx}', '!**/README.md'],
		}),
		schema: docsSchema(),
	}),
};
