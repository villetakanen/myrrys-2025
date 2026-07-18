# Routing Architecture

This document details the file-based routing system, dynamic routes, and URL handling in Myrrys 2025.

## File-Based Routing

Astro uses file-based routing where the file structure in `src/pages/` directly maps to URL paths.

```
src/pages/index.astro       → /
src/pages/404.astro         → /404
src/pages/ds.astro          → /ds
src/pages/blog/index.astro  → /blog
src/pages/letl/index.astro  → /letl
```

## Route Overview

### Static Routes

| File | URL | Description |
|------|-----|-------------|
| `src/pages/index.astro` | `/` | Homepage |
| `src/pages/404.astro` | `/404` | Error page |
| `src/pages/ds.astro` | `/ds` | Design system |
| `src/pages/blog/index.astro` | `/blog` | Blog listing |
| `src/pages/letl/index.astro` | `/letl` | L&L main page |
| `src/pages/letl/yleiskuvaus.astro` | `/letl/yleiskuvaus` | L&L overview |
| `src/pages/letl/eevenkoto/index.astro` | `/letl/eevenkoto` | Eevenkoto expansion |
| `src/pages/legenda/index.astro` | `/legenda` | Legenda magazine |
| `src/pages/the-quick/index.astro` | `/the-quick` | The Quick game |
| `src/pages/hood/index.astro` | `/hood` | Hood game |
| `src/pages/letl-suuri-seikkailu/index.astro` | `/letl-suuri-seikkailu` | L&L adventure |
| `src/pages/legendoja-lohikaarmeita/index.astro` | `/legendoja-lohikaarmeita` | Legacy route |
| `src/pages/en/index.astro` | `/en` | English landing |

### Dynamic Routes

Dynamic routes use bracket notation `[param]` to generate pages from content collections.

#### Blog Posts: `[id].astro`

**File:** `src/pages/blog/[id].astro`

**URL Pattern:** `/blog/{post-slug}`

```astro
---
import { getCollection, render } from "astro:content";
import Page from "@layouts/Page.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
```

**How it works:**
1. `getStaticPaths()` fetches all blog entries at build time
2. Each entry generates a route with `id` as the URL parameter
3. The `post` object is passed as props to the page
4. `render()` converts markdown to HTML component

#### Blog Tags: `tag/[id].astro`

**File:** `src/pages/blog/tag/[id].astro`

**URL Pattern:** `/blog/tag/{tag-name}`

Generates pages for each unique tag, filtering posts by that tag.

#### Product Pages: `letl/[id].astro`

**File:** `src/pages/letl/[id].astro`

**URL Pattern:** `/letl/{product-slug}`

Generates individual product pages from the products collection.

### Catch-All Routes

#### SRD Pages: `srd/[...id].astro`

**File:** `src/pages/letl/srd/[...id].astro`

**URL Pattern:** `/letl/srd/{path/to/document}`

The `[...id]` syntax captures all path segments, enabling nested routes.

```astro
---
import { getCollection, render, getEntry } from "astro:content";
import Page from "@layouts/Page.astro";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

export async function getStaticPaths() {
  const posts = await getCollection("lnlsrd");
  return posts.map((post) => ({
    params: { id: post.id.toLowerCase() },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);

// Load table of contents
const TocEntry = await getEntry("lnlsrd", "sisällysluettelo");
---
```

**Example URLs:**
- `/letl/srd/readme`
- `/letl/srd/loitsut`
- `/letl/srd/varusteet/aseet`
- `/letl/srd/hahmonluonti/lajit`

**Features:**
- URL normalization to lowercase
- Table of contents sidebar on every page
- Link transformation for internal references

## API Routes

### RSS Feed: `rss.xml.ts`

**File:** `src/pages/blog/rss.xml.ts`

**URL:** `/blog/rss.xml`

TypeScript file (`.ts`) generates non-HTML output.

```typescript
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("blog");
  return rss({
    title: "Myrrys",
    description: "...",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

## URL Redirects

Configured in `astro.config.mjs` to handle legacy URLs and normalization.

```javascript
redirects: {
  // SRD root redirects to readme
  "/letl/srd": "/letl/srd/readme",
  "/letl/srd/": "/letl/srd/readme",
  
  // Legacy LnL-SRD paths
  "/LnL-SRD/[...id]": "/letl/srd/[...id]",
  "/lnl-srd/[...id]": "/letl/srd/[...id]",
  
  // Legacy Finnish URL
  "/legendoja-ja-lohikaarmeita": "/letl",
  "/legendoja-ja-lohikaarmeita/srd": "/letl/srd",
}
```

**Redirect Types:**
- **Static redirects**: Direct URL mapping
- **Dynamic redirects**: `[...id]` captures path segments

## Trailing Slash Behavior

```javascript
trailingSlash: "ignore"
```

Both `/blog` and `/blog/` resolve to the same content.

## URL Normalization

### Case Insensitivity

SRD URLs are normalized to lowercase:

```astro
export async function getStaticPaths() {
  const posts = await getCollection("lnlsrd");
  return posts.map((post) => ({
    params: { id: post.id.toLowerCase() },  // Lowercase normalization
    props: { post },
  }));
}
```

### Link Processing

Internal links in SRD content are transformed:

```javascript
// Transform relative links to absolute paths
content.replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
  return `[${p1}](/letl/srd/${p2.toLowerCase()})`;
});
```

## Route Diagram

```
/                           → index.astro (Homepage)
├── /blog                   → blog/index.astro
│   ├── /blog/[id]          → blog/[id].astro (Dynamic)
│   ├── /blog/tag/[id]      → blog/tag/[id].astro (Dynamic)
│   └── /blog/rss.xml       → blog/rss.xml.ts (API)
├── /letl                   → letl/index.astro
│   ├── /letl/[id]          → letl/[id].astro (Products)
│   ├── /letl/yleiskuvaus   → letl/yleiskuvaus.astro
│   ├── /letl/eevenkoto     → letl/eevenkoto/index.astro
│   └── /letl/srd/[...id]   → letl/srd/[...id].astro (Catch-all)
├── /legenda                → legenda/index.astro
├── /the-quick              → the-quick/index.astro
├── /hood                   → hood/index.astro
├── /en                     → en/index.astro
├── /ds                     → ds.astro
└── /404                    → 404.astro
```

## Static Generation

All routes use Static Site Generation (SSG):

1. **Build time**: `getStaticPaths()` runs for dynamic routes
2. **Content fetching**: Collections are queried once
3. **HTML generation**: Each route becomes a static HTML file
4. **No runtime**: Pages served directly from CDN

**Build output:**
```
dist/
├── index.html
├── 404.html
├── blog/
│   ├── index.html
│   ├── rss.xml
│   ├── 2025-08-01-post/index.html
│   └── tag/
│       └── l-l/index.html
└── letl/
    ├── index.html
    ├── product-slug/index.html
    └── srd/
        ├── readme/index.html
        └── loitsut/index.html
```

---

[Back to Index](./README.md) | [Previous: Project Structure](./02-project-structure.md) | [Next: Content System](./04-content-system.md)
