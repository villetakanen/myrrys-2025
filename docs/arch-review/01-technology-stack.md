# Technology Stack

This document details the technology stack, dependencies, and build configuration for Myrrys 2025.

## Core Framework

### Astro 5.16.0

The site is built with [Astro](https://astro.build/), a modern static site generator optimized for content-driven websites.

**Key Features Used:**
- Static Site Generation (SSG) - all pages pre-rendered at build time
- File-based routing
- Content Collections with type-safe schemas
- Zero-JS by default architecture
- Built-in image optimization

**Configuration:** `astro.config.mjs`

```javascript
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";
import { remarkSrdLinks } from "./src/remark/remarkSrdLinks";

export default defineConfig({
  site: "https://myrrys.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: {},
        include: Features.Nesting,
      },
    },
  },
  trailingSlash: "ignore",
  markdown: {
    remarkPlugins: [remarkSrdLinks],
  },
  redirects: {
    "/letl/srd": "/letl/srd/readme",
    "/LnL-SRD/[...id]": "/letl/srd/[...id]",
    "/legendoja-ja-lohikaarmeita": "/letl",
    // ... more redirects
  },
});
```

## Language & Type System

### TypeScript

TypeScript is used throughout the project for type safety.

**Configuration:** `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["./src/components/*"],
      "@layouts/*": ["./src/layouts/*"],
      "@rehype/*": ["./src/rehype/*"]
    },
    "strictNullChecks": true,
    "allowJs": true
  }
}
```

**Path Aliases:**
- `@components/*` - Component imports
- `@layouts/*` - Layout imports
- `@rehype/*` - Rehype plugin imports

### Zod

Zod is used for content collection schema validation (bundled with Astro).

```typescript
// Example from content.config.ts
schema: z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).optional(),
})
```

## Styling

### Lightning CSS

[Lightning CSS](https://lightningcss.dev/) is used for CSS processing instead of PostCSS.

**Features Enabled:**
- CSS Nesting (native CSS nesting syntax)
- Auto-prefixing
- Minification

**Configuration:**
```javascript
vite: {
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: {},
      include: Features.Nesting,
    },
  },
},
```

## Content Processing

### Markdown Processing Pipeline

| Library | Version | Purpose |
|---------|---------|---------|
| `unified` | 11.0.5 | Plugin ecosystem framework |
| `markdown-it` | 14.1.0 | Markdown parsing for RSS |
| `unist-util-visit` | 5.0.0 | AST traversal utilities |
| `@types/mdast` | 4.0.4 | Markdown AST types |
| `@types/unist` | 3.0.3 | Universal Syntax Tree types |

### Custom Plugins

**Remark Plugins** (Markdown AST):
- `remarkSrdLinks` - Transforms relative SRD links to absolute paths

**Rehype Plugins** (HTML AST):
- `rehypeSrdLinks` - Post-markdown link processing
- `rehypeSrdLinksWithContext` - Context-aware link handling

## Build & Development

### Package Manager: pnpm

Scripts defined in `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "biome check --write"
  }
}
```

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build static site to `dist/` |
| `pnpm preview` | Preview built site locally |
| `pnpm check` | Run Biome linter/formatter |

### Linting & Formatting: Biome

[Biome](https://biomejs.dev/) handles both linting and formatting.

**Configuration:** `biome.json`

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space"
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```

**Ignored Paths:**
- `.astro/` - Generated types
- `dist/` - Build output

## Integrations

### @astrojs/sitemap (3.6.0)

Automatically generates `sitemap.xml` for SEO.

### @astrojs/rss (4.0.14)

Generates RSS feeds for the blog section.

### sanitize-html (2.14.0)

Sanitizes HTML content for safe RSS feed generation.

## Dependencies Summary

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `astro` | ^5.16.0 | Core framework |
| `@astrojs/rss` | ^4.0.14 | RSS feed generation |
| `@astrojs/sitemap` | ^3.6.0 | Sitemap generation |
| `lightningcss` | ^1.29.1 | CSS processing |
| `unified` | ^11.0.5 | AST processing framework |
| `unist-util-visit` | ^5.0.0 | AST traversal |
| `markdown-it` | ^14.1.0 | Markdown parsing |
| `sanitize-html` | ^2.14.0 | HTML sanitization |
| `@types/mdast` | ^4.0.4 | Markdown AST types |
| `@types/unist` | ^3.0.3 | Unist types |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@biomejs/biome` | 1.9.4 | Linting and formatting |
| `@types/markdown-it` | ^14.1.2 | TypeScript types |
| `@types/sanitize-html` | ^2.13.0 | TypeScript types |

## Build Output

The build process generates:

```
dist/
├── index.html
├── 404.html
├── sitemap.xml
├── blog/
│   ├── index.html
│   ├── rss.xml
│   └── [post-slug]/index.html
├── letl/
│   ├── index.html
│   ├── srd/
│   │   └── [...nested]/index.html
│   └── [product-slug]/index.html
└── _astro/
    └── [hashed-assets]
```

All output is static HTML/CSS/JS suitable for any static hosting provider.

---

[Back to Index](./README.md) | [Next: Project Structure](./02-project-structure.md)
