# Myrrys 2025 Architecture Review

> Comprehensive architecture documentation for the Myrrys publishing website

## Executive Summary

**Myrrys 2025** is a content-driven static website built with **Astro 5.16.0** for Myrrys, a Finnish tabletop RPG publisher. The site showcases multiple game products including Legendoja & Lohikaarmeita (L&L), The Quick, Hood, and Legenda magazine.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Architecture** | Static Site Generation (SSG) |
| **Framework** | Astro 5.16.0 |
| **Language** | TypeScript |
| **Styling** | Lightning CSS with design tokens |
| **Content** | Markdown with Zod schema validation |
| **Backend** | None (purely static) |
| **Deployment** | Static hosting compatible |

### Architecture Highlights

1. **Static-first Design**: All pages pre-rendered at build time for optimal performance
2. **Content Collections**: Three structured collections (blog, products, lnlsrd) with type-safe schemas
3. **Zero Runtime Backend**: No Firebase, Supabase, or external APIs
4. **Theme System**: CSS custom properties with game-specific theme classes
5. **Custom Markdown Plugins**: Remark/Rehype plugins for SRD link processing

## Documentation Index

| Document | Description |
|----------|-------------|
| [01-technology-stack.md](./01-technology-stack.md) | Framework, dependencies, and build configuration |
| [02-project-structure.md](./02-project-structure.md) | Directory layout and file organization |
| [03-routing.md](./03-routing.md) | File-based routing and URL handling |
| [04-content-system.md](./04-content-system.md) | Content collections, schemas, and markdown processing |
| [05-styling.md](./05-styling.md) | CSS architecture, design tokens, and themes |
| [06-components.md](./06-components.md) | Component patterns and organization |
| [07-seo-performance.md](./07-seo-performance.md) | SEO, meta tags, and performance optimization |
| [08-recommendations.md](./08-recommendations.md) | Future improvements and recommendations |

## Quick Reference

### Technology Stack

```
Astro 5.16.0          Static site generator
TypeScript            Type-safe development
Lightning CSS         CSS processing with nesting
Zod                   Schema validation for content
pnpm                  Package manager
Biome                 Linting and formatting
```

### Content Types

- **Blog Posts**: News, updates, and articles (`/src/blog/`)
- **Products**: Game books and publications (`/src/products/`)
- **SRD**: System Reference Document for L&L game (`/LnL-SRD/`)

### Game Sections

| Game | Route | Theme Class |
|------|-------|-------------|
| Legendoja & Lohikaarmeita | `/letl/` | `theme-letl` |
| Legenda Magazine | `/legenda/` | `theme-legenda` |
| The Quick | `/the-quick/` | `theme-quick` |
| Hood | `/hood/` | - |

### Key Files

```
astro.config.mjs          Astro configuration
src/content.config.ts     Content collection schemas
src/layouts/Page.astro    Main layout template
src/styles/tokens.css     Design token definitions
```

## Architecture Diagram

```
                    +------------------+
                    |   Markdown Files |
                    |  (blog, products,|
                    |     LnL-SRD)     |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Content Collections|
                    |  (Zod Validation) |
                    +--------+---------+
                             |
                             v
              +-----------------------------+
              |     Markdown Processing     |
              |  Remark -> HTML -> Rehype   |
              +-------------+---------------+
                            |
                            v
              +-----------------------------+
              |      Astro Components       |
              |  (Layouts, Pages, Components)|
              +-------------+---------------+
                            |
                            v
                    +------------------+
                    |   Static HTML    |
                    |   (dist folder)  |
                    +------------------+
```

## Strengths

- **Performance**: Static output means instant page loads
- **Type Safety**: TypeScript + Zod catches errors at build time
- **SEO**: Pre-rendered HTML is search engine friendly
- **Maintainability**: Clear separation of content and presentation
- **Scalability**: Git-versioned content with no database dependencies

## Areas for Improvement

- **Internationalization**: Currently uses separate routes for EN/FI
- **Testing**: No automated test coverage
- **Search**: No client-side search functionality
- **Component Docs**: No Storybook or component documentation

---

*Last updated: January 2026*
