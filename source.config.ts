import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      date: z.date().optional(),
      author: z.string().optional(),
      published: z.boolean().optional().default(true),
    }),
  },
});

export default defineConfig();