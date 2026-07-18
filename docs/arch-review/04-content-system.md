# Content Management System

This document details the content collections, schemas, markdown processing pipeline, and RSS feed generation.

## Content Collections

Astro Content Collections provide a type-safe way to manage structured content. All collections are defined in `src/content.config.ts`.

### Collection Overview

| Collection | Source | Pattern | Purpose |
|------------|--------|---------|---------|
| `blog` | `src/blog/` | `*.md` | Blog posts and articles |
| `products` | `src/products/` | `*.md` | Game books and publications |
| `lnlsrd` | `LnL-SRD/` | `**/*.md` | System Reference Document |

### Configuration

**File:** `src/content.config.ts`

```typescript
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
```

## Content Schemas

### Blog Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Post title |
| `description` | `string` | Yes | Short summary |
| `pubDate` | `date` | Yes | Publication date (auto-coerced) |
| `heroImage` | `string` | No | Featured image URL |
| `tags` | `string[]` | No | Category tags |
| `theme` | `enum` | No | Visual theme (`theme-letl` or `theme-legenda`) |

**Example Frontmatter:**

```markdown
---
title: "Eevenkoto-lajit julkaistu"
description: "Uudet pelaajien lajit Eevenkoto-lisäosaan"
pubDate: 2025-03-03
tags: ["L&L", "Eevenkoto"]
theme: "theme-letl"
heroImage: "/blog-images/eevenkoto.webp"
---

Article content here...
```

### Products Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Product name |
| `brand` | `string` | Yes | Publisher brand |
| `pubDate` | `string` | Yes | Publication year |
| `author` | `string` | Yes | Creator names |
| `description` | `string` | Yes | Product description |
| `heroImage` | `string` | No | Cover image |
| `isbn` | `string[]` | No | ISBN codes |
| `distributors` | `string[]` | No | Retailer links (format: `Name,URL`) |

**Example Frontmatter:**

```markdown
---
title: "Pelaajan kirja"
brand: "L&L"
pubDate: "2022"
author: "Legendoja & lohikäärmeitä tiimi"
description: "Kovakantinen. 320 sivua."
heroImage: "/letl/pelaajan-kirja.webp"
isbn: ["ISBN 978-952-68578-5-5 (kovakantinen)"]
distributors: ["Fantasiapelit,https://www.fantasiapelit.com/..."]
---

Product description content...
```

### LnL-SRD Schema

The SRD collection uses an empty schema (`z.object({})`) as content is unstructured markdown from the Git submodule.

## Content Querying

### Fetching Collections

```typescript
import { getCollection, getEntry, render } from "astro:content";

// Get all entries
const allPosts = await getCollection("blog");

// Filter entries
const letlPosts = await getCollection("blog", ({ data }) => {
  return data.tags?.includes("L&L");
});

// Get single entry
const entry = await getEntry("lnlsrd", "sisällysluettelo");

// Render markdown to HTML
const { Content } = await render(post);
```

### Sorting and Filtering

```typescript
// Sort by date (newest first)
posts.sort((a, b) => {
  return new Date(b.data.pubDate).getTime() - 
         new Date(a.data.pubDate).getTime();
});

// Limit results
const recentPosts = posts.slice(0, 5);

// Filter by tag
const tagged = posts.filter(p => p.data.tags?.includes("L&L"));
```

## Markdown Processing Pipeline

### Pipeline Overview

```
Markdown File (.md)
        ↓
    Frontmatter Parsing (YAML)
        ↓
    Zod Schema Validation
        ↓
    Remark Plugins (Markdown AST)
        ↓
    HTML Conversion
        ↓
    Rehype Plugins (HTML AST)
        ↓
    Final HTML Output
```

### Remark Plugins

Remark plugins transform the Markdown Abstract Syntax Tree (AST) before conversion to HTML.

#### remarkSrdLinks

**File:** `src/remark/remarkSrdLinks.ts`

**Purpose:** Transforms relative links in SRD content to absolute paths.

```typescript
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkSrdLinks: Plugin<[]> = () => {
  return (tree, file) => {
    // Extract folder from file path
    let folder = "";
    const filePath = file.path || (file.history && file.history[0]) || "";

    if (filePath) {
      const normalizedPath = filePath.replace(/\\/g, "/");
      const match = normalizedPath.match(/LnL-SRD\/([^\/]+)\//);
      if (match && match[1]) {
        folder = match[1].toLowerCase();
      }
    }

    // Process all link nodes
    visit(tree as Root, "link", (node) => {
      if (!node.url) return;
      const url = node.url;

      // Skip external, anchor, PDF, and absolute links
      if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("#") ||
        url.endsWith(".pdf") ||
        url.startsWith("/")
      ) {
        return;
      }

      // Rewrite relative link to absolute path
      const lowercaseUrl = url.toLowerCase();

      if (folder && !lowercaseUrl.includes("/")) {
        // Same-folder link
        node.url = `/letl/srd/${folder}/${lowercaseUrl}`;
      } else {
        // Cross-folder or root link
        node.url = `/letl/srd/${lowercaseUrl}`;
      }
    });
  };
};
```

**Transformation Examples:**

| Original | Context | Result |
|----------|---------|--------|
| `Antimaaginen_alue` | `loitsut/` folder | `/letl/srd/loitsut/antimaaginen_alue` |
| `../Varusteet/Aseet` | any folder | `/letl/srd/varusteet/aseet` |
| `https://example.com` | any | unchanged |
| `#anchor` | any | unchanged |

**Configuration in Astro:**

```javascript
// astro.config.mjs
import { remarkSrdLinks } from "./src/remark/remarkSrdLinks";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkSrdLinks],
  },
});
```

### Rehype Plugins

Rehype plugins transform the HTML AST after markdown conversion.

**Available Plugins:**
- `rehypeSrdLinks.ts` - Additional SRD link processing
- `rehypeSrdLinksWithContext.ts` - Context-aware link transformation

## RSS Feed Generation

### Configuration

**File:** `src/pages/blog/rss.xml.ts`

```typescript
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const parser = new MarkdownIt();

export async function GET({ site }: APIContext) {
  if (!site) {
    throw new Error("Missing site metadata");
  }
  
  const blog = await getCollection("blog");
  
  // Sort by date (newest first)
  blog.sort((a, b) => {
    return new Date(b.data.pubDate).getTime() - 
           new Date(a.data.pubDate).getTime();
  });

  return rss({
    title: "MYRRYS Blogi",
    description: "MYRRYS Blogi: Legendoja & lohikäärmeitä...",
    site,
    stylesheet: "/rss/styles.xsl",
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      content: sanitizeHtml(
        parser.render(`# ${post.data.title}\n\n${post.body}`),
      ),
      link: `/blog/${post.id}/`,
    })),
  });
}
```

### RSS Features

| Feature | Implementation |
|---------|----------------|
| **Title** | "MYRRYS Blogi" |
| **Sorting** | Newest first by `pubDate` |
| **Content** | Full HTML (sanitized) |
| **Styling** | XSL stylesheet for browser rendering |
| **Link format** | `/blog/{post-id}/` |

### Security

HTML content is sanitized using `sanitize-html` to prevent XSS:

```typescript
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();
const rawHtml = parser.render(post.body);
const safeHtml = sanitizeHtml(rawHtml);
```

## Content Workflow

### Adding Blog Posts

1. Create markdown file in `src/blog/`:
   ```
   src/blog/2025-01-03-new-post.md
   ```

2. Add required frontmatter:
   ```yaml
   ---
   title: "Post Title"
   description: "Summary text"
   pubDate: 2025-01-03
   ---
   ```

3. Build triggers route generation at `/blog/2025-01-03-new-post`

### Adding Products

1. Create markdown file in `src/products/`:
   ```
   src/products/new-product.md
   ```

2. Add required frontmatter with all product fields

3. Build generates route at `/letl/new-product`

### Updating SRD

1. Update content in `LnL-SRD/` submodule
2. Commit submodule changes
3. Rebuild site - links auto-transform via remark plugin

## Type Safety

Content collections provide full TypeScript support:

```typescript
// Type-safe access to frontmatter
const post = await getEntry("blog", "some-post");
post.data.title;      // string
post.data.pubDate;    // Date
post.data.tags;       // string[] | undefined

// Type errors caught at build time
post.data.nonexistent; // TypeScript error
```

---

[Back to Index](./README.md) | [Previous: Routing](./03-routing.md) | [Next: Styling](./05-styling.md)
