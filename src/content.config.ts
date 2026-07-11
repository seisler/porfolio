// Per-route terminal content: the "command" a page represents and the log
// lines it prints. Lives outside the pages/widgets/shared UI layering per
// ADR-0004 ("Content data ... sits outside this UI layering") — both the
// pages that render this content server-side and the client-side terminal
// controller (which needs every route's data up front, not just the current
// page's) read from this single collection.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commands = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/commands' }),
	schema: z.object({
		command: z.string(),
		route: z.string(),
		title: z.string(),
		lines: z.array(
			z.object({
				time: z.string(),
				text: z.string(),
				url: z.string().optional(),
			}),
		),
	}),
});

export const collections = { commands };
