import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const blogSchema = z.object({
  title: z.string(),
  heroImage: z.string().optional(),
  description: z.string(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).optional(),
  theme: z.enum(["theme-letl", "theme-legenda"]).optional(),
});

const productSchema = z.object({
  title: z.string(),
  brand: z.string(),
  pubDate: z.string(),
  author: z.string(),
  description: z.string(),
  heroImage: z.string().optional(),
  isbn: z.array(z.string()).optional(),
  distributors: z.array(z.string()).optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/blog" }),
  schema: blogSchema,
});

const products = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/products" }),
  schema: productSchema,
});

const blogEn = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/blog-en" }),
  schema: blogSchema,
});

const productsEn = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/products-en" }),
  schema: productSchema,
});

const lnlsrd = defineCollection({
  loader: glob({ pattern: ["**/*.md"], base: "LnL-SRD" }),
  schema: z.object({}),
});

export const collections = {
  blog,
  products,
  lnlsrd,
  "blog-en": blogEn,
  "products-en": productsEn,
};
