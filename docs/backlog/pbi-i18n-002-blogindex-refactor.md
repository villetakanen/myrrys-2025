# PBI-I18N-002: Refactor BlogIndex Component for Collection Prop

**Date:** 2026-01-03  
**Status:** 📋 READY  
**Priority:** High  
**Effort:** 2 Story Points (1-2 hours)  
**Spec:** [specs/i18n/spec.md](../../specs/i18n/spec.md)  
**Depends On:** PBI-I18N-001

## Overview

Refactor `BlogIndex.astro` component to accept a `collection` prop, enabling reuse across Finnish and English markets without code duplication.

## Business Value

- **Code Reuse**: Single component serves both markets
- **Maintainability**: Changes apply to both FI/EN automatically
- **Type Safety**: TypeScript enforces valid collection names
- **Consistency**: Identical logic for filtering/sorting across markets

## Current State

**File:** `src/components/blog/BlogIndex.astro`

```astro
---
import { getCollection } from "astro:content";

interface Props {
  tag?: string;
  limit?: number;
}
const { tag, limit }: Props = Astro.props;

// Hardcoded to Finnish blog
let blogEntries = await getCollection("blog", ({ data }) => {
  if (!tag) return true;
  return data.tags?.includes(tag) ?? false;
});

blogEntries.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

if (limit) {
  blogEntries = blogEntries.slice(0, limit);
}
---
{blogEntries.map(post => (
  <article>
    {post.data.heroImage && <img src={post.data.heroImage} alt="" class="icon">}
    <a href={`/blog/${post.id}`}>
      <h3>{post.data.title}</h3>
      <p class="text-small">{post.data.description}</p>
    </a>
  </article>
))}
```

**Issues:**
- Hardcoded to `"blog"` collection
- Hardcoded link prefix `/blog/`
- Can't be used for English market
- Would require duplication for `blog-en`

## Requirements

### Functional

1. Add `collection` prop to accept `"blog"` or `"blog-en"`
2. Add `urlPrefix` prop to customize link prefix (`/blog/` vs `/en/blog/`)
3. Maintain existing `tag` and `limit` props
4. Preserve sorting and filtering logic
5. Type-safe collection parameter

### Non-Functional

- **Type Safety**: TypeScript union type for collection names
- **Backwards Compatibility**: Existing usage still works with defaults
- **Performance**: No runtime overhead
- **Testability**: Component behavior testable in isolation

## Implementation Tasks

### Task 1: Refactor BlogIndex Component

**File:** `src/components/blog/BlogIndex.astro`

```astro
---
import { getCollection } from "astro:content";

interface Props {
  collection?: "blog" | "blog-en";
  tag?: string;
  limit?: number;
  urlPrefix?: string;
}

const { 
  collection = "blog",
  tag, 
  limit,
  urlPrefix = "/blog/"
}: Props = Astro.props;

// Generic collection query
let blogEntries = await getCollection(collection, ({ data }) => {
  if (!tag) return true;
  return data.tags?.includes(tag) ?? false;
});

// Sort by date (newest first)
blogEntries.sort((a, b) => 
  b.data.pubDate.getTime() - a.data.pubDate.getTime()
);

// Apply limit
if (limit) {
  blogEntries = blogEntries.slice(0, limit);
}
---

{blogEntries.map(post => (
  <article>
    {post.data.heroImage && (
      <img src={post.data.heroImage} alt="" class="icon">
    )}
    <a href={`${urlPrefix}${post.id}`}>
      <h3>{post.data.title}</h3>
      <p class="text-small">{post.data.description}</p>
    </a>
  </article>
))}

<style>
article {
  display: flex;
  gap: var(--grid);
}
article a {
  text-decoration: none;
}
article a:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-primary);
}
img.icon {
  height: calc(var(--grid) * 4);
  aspect-ratio: 1 / 1;
  object-fit: contain;
  object-position: center;
}
</style>
```

### Task 2: Update Existing Usages

**Finnish Blog Index** - `src/pages/blog/index.astro`

```astro
---
import Page from "@layouts/Page.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
---

<Page title="Blogi">
  <main class="content-grid">
    <section>
      <h1>Blogi</h1>
      <!-- No props needed - defaults to Finnish -->
      <BlogIndex />
    </section>
  </main>
</Page>
```

**Finnish Homepage** - `src/components/home/MiscBlock.astro`

```astro
<section>
  <h2>Uusimmat artikkelit</h2>
  <!-- Explicitly Finnish, limited to 3 -->
  <BlogIndex collection="blog" limit={3} />
</section>
```

**L&L Section** - `src/components/letl/LetlIndex.astro`

```astro
<section>
  <h2>L&L Uutiset</h2>
  <!-- Finnish blog, L&L tagged, limit 4 -->
  <BlogIndex collection="blog" tag="L&L" limit={4} />
</section>
```

### Task 3: Create English Usage Example

**File:** `src/pages/en/blog/index.astro` (new)

```astro
---
import EnPage from "@layouts/EnPage.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
---

<EnPage title="Blog">
  <main class="content-grid">
    <section>
      <h1>Blog</h1>
      <!-- English collection with English URL prefix -->
      <BlogIndex 
        collection="blog-en" 
        urlPrefix="/en/blog/" 
      />
    </section>
  </main>
</EnPage>
```

### Task 4: Add Component Tests (Vitest)

**File:** `src/components/blog/BlogIndex.test.ts` (new)

```typescript
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect, beforeAll } from "vitest";
import BlogIndex from "./BlogIndex.astro";

describe("BlogIndex Component", () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders with default props (Finnish blog)", async () => {
    const result = await container.renderToString(BlogIndex);
    expect(result).toContain("article");
  });

  it("accepts blog-en collection", async () => {
    const result = await container.renderToString(BlogIndex, {
      props: { collection: "blog-en", urlPrefix: "/en/blog/" }
    });
    expect(result).toContain("article");
  });

  it("filters by tag", async () => {
    const result = await container.renderToString(BlogIndex, {
      props: { tag: "L&L" }
    });
    expect(result).toContain("article");
  });

  it("limits results", async () => {
    const result = await container.renderToString(BlogIndex, {
      props: { limit: 2 }
    });
    // Count article elements
    const articleCount = (result.match(/<article>/g) || []).length;
    expect(articleCount).toBeLessThanOrEqual(2);
  });

  it("uses custom URL prefix", async () => {
    const result = await container.renderToString(BlogIndex, {
      props: { collection: "blog-en", urlPrefix: "/en/blog/" }
    });
    expect(result).toContain("/en/blog/");
  });
});
```

### Task 5: Add E2E Tests (Playwright)

**File:** `tests/blog-index.spec.ts` (new)

```typescript
import { test, expect } from "@playwright/test";

test.describe("BlogIndex Component", () => {
  test("Finnish blog index renders posts", async ({ page }) => {
    await page.goto("/blog");
    
    // Should have heading
    await expect(page.locator("h1")).toContainText("Blogi");
    
    // Should have at least one article
    const articles = page.locator("article");
    await expect(articles.first()).toBeVisible();
    
    // Articles should have links with Finnish prefix
    const firstLink = articles.first().locator("a");
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/blog\//);
  });

  test("English blog index renders posts", async ({ page }) => {
    await page.goto("/en/blog");
    
    // Should have heading
    await expect(page.locator("h1")).toContainText("Blog");
    
    // Articles should have links with English prefix
    const articles = page.locator("article");
    const firstLink = articles.first().locator("a");
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/en\/blog\//);
  });

  test("Filtered by tag works", async ({ page }) => {
    await page.goto("/blog/tag/l-l");
    
    // All articles should be L&L related
    const articles = page.locator("article");
    await expect(articles.first()).toBeVisible();
  });

  test("Limited results work", async ({ page }) => {
    await page.goto("/");
    
    // Homepage shows limited posts (3)
    const section = page.locator("section").filter({ hasText: "Uusimmat" });
    const articles = section.locator("article");
    const count = await articles.count();
    expect(count).toBeLessThanOrEqual(3);
  });
});
```

### Task 6: Update Design System Documentation

**File:** `src/pages/ds/i18n.astro` (append to existing)

Add section:

```astro
<h2>BlogIndex Component</h2>

<p>Reusable component for displaying blog posts from any collection.</p>

<h3>Props</h3>

<table>
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>collection</code></td>
      <td><code>"blog" | "blog-en"</code></td>
      <td><code>"blog"</code></td>
      <td>Which blog collection to query</td>
    </tr>
    <tr>
      <td><code>urlPrefix</code></td>
      <td><code>string</code></td>
      <td><code>"/blog/"</code></td>
      <td>URL prefix for post links</td>
    </tr>
    <tr>
      <td><code>tag</code></td>
      <td><code>string?</code></td>
      <td><code>undefined</code></td>
      <td>Filter posts by tag</td>
    </tr>
    <tr>
      <td><code>limit</code></td>
      <td><code>number?</code></td>
      <td><code>undefined</code></td>
      <td>Maximum posts to show</td>
    </tr>
  </tbody>
</table>

<h3>Usage Examples</h3>

<h4>Finnish Blog (Default)</h4>
<pre><code>&lt;BlogIndex /&gt;</code></pre>

<h4>English Blog</h4>
<pre><code>&lt;BlogIndex 
  collection="blog-en" 
  urlPrefix="/en/blog/" 
/&gt;</code></pre>

<h4>Filtered by Tag</h4>
<pre><code>&lt;BlogIndex tag="L&L" limit={4} /&gt;</code></pre>

<h4>Homepage Preview</h4>
<pre><code>&lt;BlogIndex limit={3} /&gt;</code></pre>
```

## Acceptance Criteria

### Component Refactoring
- [ ] `collection` prop added with type `"blog" | "blog-en"`
- [ ] `urlPrefix` prop added with default `"/blog/"`
- [ ] Component works with both collections
- [ ] Existing Finnish usages still work (backwards compatible)
- [ ] TypeScript compilation succeeds

### Testing
- [ ] Vitest unit tests pass
- [ ] Tests cover all prop combinations
- [ ] Playwright E2E tests pass
- [ ] Tests verify Finnish and English rendering
- [ ] Tag filtering tested
- [ ] Limit functionality tested

### Documentation
- [ ] Component documented in `/ds/i18n`
- [ ] All props documented with types
- [ ] Usage examples provided for both markets
- [ ] Table shows prop defaults

### Quality
- [ ] `pnpm build` succeeds
- [ ] `pnpm check` (Biome) passes
- [ ] No TypeScript errors
- [ ] No console warnings

## Testing Strategy

### Setup Playwright

```bash
pnpm add -D @playwright/test
npx playwright install
```

**File:** `playwright.config.ts` (new)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "pnpm preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4321",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

**Update package.json:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Test Execution

```bash
# Unit tests
pnpm test src/components/blog/BlogIndex.test.ts

# E2E tests
pnpm build
pnpm preview &
pnpm test:e2e
```

## Dependencies

**New:**
- `@playwright/test` - E2E testing
- Astro experimental container API (for component tests)

**Depends On:**
- PBI-I18N-001 (English collections must exist)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing usages | High | Use defaults for backwards compatibility |
| Type errors in props | Medium | Strict TypeScript union types |
| E2E tests flaky | Low | Use Playwright best practices |
| URL prefix mismatch | Medium | Validate in tests |

## Success Metrics

- ✅ Single component serves both markets
- ✅ All tests pass (unit + E2E)
- ✅ Zero code duplication
- ✅ Type-safe props

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Vitest tests passing
- [ ] Playwright E2E tests passing
- [ ] Design system documentation updated
- [ ] Code reviewed
- [ ] Merged to dev branch

## References

- Spec: [specs/i18n/spec.md](../../specs/i18n/spec.md)
- Astro Component Testing: https://docs.astro.build/en/guides/testing/
- Playwright: https://playwright.dev/
- Vitest: https://vitest.dev/

## Notes

- This pattern will be replicated for other components (ProductListing, etc.)
- Backwards compatibility ensures no regression in Finnish site
- E2E tests verify real-world rendering behavior
- Component tests verify logic in isolation
