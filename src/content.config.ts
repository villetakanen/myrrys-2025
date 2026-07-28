import { type SchemaContext, defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const blogSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    heroImage: image().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
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

const pageSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    image: image().optional(),
    theme: z.enum(["theme-letl", "theme-quick", "theme-legenda"]).optional(),
  });

const sitePages = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/site-pages" }),
  schema: pageSchema,
});

// SRD documents carry no frontmatter. LnL-SRD is a shared upstream document
// that does not accept site-specific or generated input, metadata included, so
// there is nothing here to validate — `title` and `description` are derived
// from each document's own content by src/remark/remarkSrdMetadata.ts and read
// off `remarkPluginFrontmatter` in the route. Deliberately strict-empty rather
// than passthrough: nothing should reach for `post.data`.
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
  "site-pages": sitePages,
};
