# PBI-I18N-001: English Content Collections

**Date:** 2026-01-03  
**Status:** 📋 READY  
**Priority:** High  
**Effort:** 2 Story Points (1-2 hours)  
**Spec:** [specs/i18n/spec.md](../../specs/i18n/spec.md)

## Overview

Create separate English content collections (`blog-en`, `products-en`) to support market-based content separation as defined in the i18n spec.

## Business Value

- **Market Segmentation**: Enables distinct product catalogs for Finnish vs International markets
- **Content Independence**: English content managed separately without forcing translation
- **Type Safety**: Zod schemas validate English content independently
- **Flexibility**: Allows different content strategies per market

## Current State

- Single `blog` collection for Finnish content
- Single `products` collection for Finnish products
- No English-specific content collections
- English routes (`/en/*`) currently don't exist or use Finnish content

## Requirements

### Functional

1. Create `blog-en` collection for English blog posts
2. Create `products-en` collection for international products
3. Define Zod schemas matching existing collections
4. Create content directories for English content
5. Maintain type safety and validation

### Non-Functional

- **Type Safety**: Full TypeScript support for new collections
- **Performance**: No impact on build times
- **Maintainability**: Clear separation between FI/EN content
- **Backwards Compatibility**: Existing Finnish collections unchanged

## Implementation Tasks

### Task 1: Create English Content Directories

Create directory structure:

```bash
mkdir -p src/blog-en
mkdir -p src/products-en
```

**Files to create:**
- `src/blog-en/.gitkeep` (or first blog post)
- `src/products-en/.gitkeep` (or first product)

### Task 2: Update Content Configuration

**File:** `src/content.config.ts`

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Shared schema objects for DRY
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

// Finnish collections
const blog = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/blog" }),
  schema: blogSchema,
});

const products = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/products" }),
  schema: productSchema,
});

// English collections
const blogEn = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/blog-en" }),
  schema: blogSchema,
});

const productsEn = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/products-en" }),
  schema: productSchema,
});

// Shared bilingual content
const lnlsrd = defineCollection({
  loader: glob({ pattern: ["**/*.md"], base: "LnL-SRD" }),
  schema: z.object({}),
});

export const collections = {
  blog,
  "blog-en": blogEn,
  products,
  "products-en": productsEn,
  lnlsrd,
};
```

### Task 3: Create Sample English Content

**File:** `src/blog-en/2026-01-sample-post.md`

```markdown
---
title: "Sample English Post"
description: "A sample blog post for the international market"
pubDate: 2026-01-03
tags: ["News"]
---

This is a sample English blog post for testing the English content collection.
```

**File:** `src/products-en/the-quick.md`

```markdown
---
title: "The Quick"
brand: "MYRRYS"
pubDate: "2024"
author: "MYRRYS Team"
description: "A story-driven role-playing game built around character dynamics and free-form narrative."
heroImage: "/the-quick/hero.webp"
---

The Quick is a character and story-driven tabletop RPG...
```

### Task 4: Add TypeScript Type Tests

**File:** `src/content.config.test.ts` (new)

```typescript
import { getCollection } from "astro:content";
import { describe, it, expectTypeOf } from "vitest";

describe("Content Collections Type Safety", () => {
  it("blog-en collection returns correct types", async () => {
    const posts = await getCollection("blog-en");
    
    expectTypeOf(posts[0].data.title).toBeString();
    expectTypeOf(posts[0].data.description).toBeString();
    expectTypeOf(posts[0].data.pubDate).toBeDate();
    expectTypeOf(posts[0].data.tags).toEqualTypeOf<string[] | undefined>();
  });

  it("products-en collection returns correct types", async () => {
    const products = await getCollection("products-en");
    
    expectTypeOf(products[0].data.title).toBeString();
    expectTypeOf(products[0].data.brand).toBeString();
    expectTypeOf(products[0].data.author).toBeString();
    expectTypeOf(products[0].data.isbn).toEqualTypeOf<string[] | undefined>();
  });
});
```

### Task 5: Add Design System Documentation

**File:** `src/pages/ds/i18n.astro` (new)

```astro
---
import Page from "@layouts/Page.astro";
---

<Page title="i18n System - Design System">
  <main class="content-grid">
    <section>
      <h1>Internationalization (i18n) System</h1>
      
      <p>MYRRYS uses market-based content separation, not translation-based i18n.</p>

      <h2>Content Collections</h2>
      
      <h3>Finnish Market</h3>
      <ul>
        <li><code>blog</code> - Finnish blog posts</li>
        <li><code>products</code> - Finnish market products</li>
      </ul>

      <h3>International Market</h3>
      <ul>
        <li><code>blog-en</code> - English blog posts</li>
        <li><code>products-en</code> - International products</li>
      </ul>

      <h3>Shared Content</h3>
      <ul>
        <li><code>lnlsrd</code> - Bilingual SRD content</li>
      </ul>

      <h2>Usage Examples</h2>

      <h3>Querying Finnish Blog</h3>
      <pre><code>import { getCollection } from "astro:content";

const posts = await getCollection("blog");
// Returns Finnish blog posts</code></pre>

      <h3>Querying English Blog</h3>
      <pre><code>import { getCollection } from "astro:content";

const posts = await getCollection("blog-en");
// Returns English blog posts</code></pre>

      <h2>Schema</h2>
      
      <p>Both Finnish and English collections use identical schemas for consistency:</p>

      <pre><code>// Blog schema (shared)
{
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: string;
  tags?: string[];
  theme?: "theme-letl" | "theme-legenda";
}

// Product schema (shared)
{
  title: string;
  brand: string;
  pubDate: string;
  author: string;
  description: string;
  heroImage?: string;
  isbn?: string[];
  distributors?: string[];
}</code></pre>

      <h2>Best Practices</h2>

      <ul>
        <li>Use separate collections, not a <code>locale</code> field</li>
        <li>Share schema objects to keep schemas DRY</li>
        <li>English content is NOT translations - it's market-specific</li>
        <li>Finnish users can access English content (bilingual audience)</li>
      </ul>

      <h2>Related Documentation</h2>
      <ul>
        <li><a href="/ds">Design System Home</a></li>
        <li><a href="../../specs/i18n/spec.md">i18n Spec (source)</a></li>
      </ul>
    </section>
  </main>
</Page>

<style>
pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: var(--grid);
  overflow-x: auto;
  border-radius: 4px;
}

code {
  font-family: 'Courier New', monospace;
}

ul {
  line-height: calc(2 * var(--grid));
}
</style>
```

## Acceptance Criteria

### Content Collections
- [ ] `blog-en` collection defined in `content.config.ts`
- [ ] `products-en` collection defined in `content.config.ts`
- [ ] Both collections use shared schema objects (DRY)
- [ ] TypeScript compilation succeeds with new collections
- [ ] Collections accessible via `getCollection("blog-en")` and `getCollection("products-en")`

### Directory Structure
- [ ] `src/blog-en/` directory exists
- [ ] `src/products-en/` directory exists
- [ ] At least one sample post in `blog-en`
- [ ] At least one sample product in `products-en`

### Type Safety
- [ ] Type tests pass for `blog-en` collection
- [ ] Type tests pass for `products-en` collection
- [ ] No TypeScript errors in IDE
- [ ] Autocomplete works for new collections

### Documentation
- [ ] `/ds/i18n` page documents collection usage
- [ ] Examples show how to query each collection
- [ ] Schema documented with types
- [ ] Best practices listed

### Build & Quality
- [ ] `pnpm build` succeeds
- [ ] `pnpm check` (Biome) passes
- [ ] No console errors or warnings
- [ ] Vitest tests pass

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

Run tests:
```bash
pnpm add -D vitest
pnpm vitest src/content.config.test.ts
```

### Manual Testing

1. **Build Test**
   ```bash
   pnpm build
   # Verify no errors
   ```

2. **Type Check**
   ```bash
   npx tsc --noEmit
   # Verify no type errors
   ```

3. **Collection Query Test**
   Create temporary test page:
   ```astro
   ---
   import { getCollection } from "astro:content";
   const blogEn = await getCollection("blog-en");
   const productsEn = await getCollection("products-en");
   console.log("blog-en:", blogEn.length);
   console.log("products-en:", productsEn.length);
   ---
   ```

4. **Design System Page**
   - Visit `/ds/i18n`
   - Verify all sections render
   - Verify code examples are readable

## Dependencies

**Install Vitest:**
```bash
pnpm add -D vitest @vitest/ui
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema drift between FI/EN | Medium | Use shared schema objects |
| Type errors in existing code | Low | New collections don't affect existing |
| Build time increase | Low | Monitor build metrics |
| Missing sample content | Low | Create minimal samples in tasks |

## Success Metrics

- ✅ Both collections queryable
- ✅ Type safety maintained
- ✅ Build succeeds
- ✅ Tests pass
- ✅ Documentation complete

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Vitest tests passing
- [ ] Design system documentation created
- [ ] Code reviewed
- [ ] Merged to dev branch

## References

- Spec: [specs/i18n/spec.md](../../specs/i18n/spec.md)
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Zod Documentation: https://zod.dev/
- Vitest: https://vitest.dev/

## Notes

- This PBI creates the foundation for market-based content separation
- Subsequent PBIs will refactor components to use these collections
- English content is NOT translations - it's market-specific products
- Finnish audience can access both Finnish and English content
