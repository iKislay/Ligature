// source.config.ts
import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.date().optional(),
      author: z.string().optional(),
      published: z.boolean().optional().default(true)
    })
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
