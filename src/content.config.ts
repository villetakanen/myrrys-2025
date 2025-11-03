import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/blog" }),
  schema: z.object({
    title: z.string(),
    heroImage: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    theme: z.enum(["theme-letl", "theme-legenda"]).optional(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/products" }),
  schema: z.object({
    title: z.string(),
    brand: z.string(),
    pubDate: z.string(),
    author: z.string(),
    description: z.string(),
    heroImage: z.string().optional(),
    isbn: z.array(z.string()).optional(),
    distributors: z.array(z.string()).optional(),
  }),
});

const lnlsrd = defineCollection({
  loader: glob({ pattern: ["**/*.md"], base: "LnL-SRD" }),
  schema: z.object({}),
});

export const collections = { blog, products, lnlsrd };
