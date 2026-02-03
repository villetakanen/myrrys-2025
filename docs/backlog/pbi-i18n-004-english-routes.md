# PBI-I18N-004: English Market Routes and Pages

**Date:** 2026-01-03  
**Status:** 📋 READY  
**Priority:** High  
**Effort:** 3 Story Points (2-4 hours)  
**Spec:** [specs/i18n/spec.md](../../specs/i18n/spec.md)  
**Depends On:** PBI-I18N-001, PBI-I18N-002, PBI-I18N-003

## Overview

Create English market routes (`/en/*`) with proper page structure, demonstrating the complete market-based i18n system in production.

## Business Value

- **Market Expansion**: Enables serving international customers
- **Content Independence**: English market with distinct product catalog
- **SEO**: Proper language tags and URLs for English content
- **Validation**: Proves the i18n architecture works end-to-end

## Current State

- English routes don't exist or are incomplete
- `EnPage.astro` layout exists but underutilized
- English collections created in PBI-I18N-001
- BlogIndex refactored in PBI-I18N-002
- UI strings available in PBI-I18N-003

**Missing:**
- `/en/` homepage
- `/en/blog/` index and dynamic routes
- `/en/products/` or product pages
- Proper SEO meta tags per market

## Requirements

### Functional

1. Create `/en/` homepage
2. Create `/en/blog/` index page
3. Create `/en/blog/[id]` dynamic route
4. Create at least one English product page route
5. Use refactored components with correct props
6. Apply English UI strings throughout

### Non-Functional

- **SEO**: Correct `lang="en"` attributes
- **Performance**: No impact on Finnish site build
- **Accessibility**: Proper heading hierarchy
- **Type Safety**: All props type-checked

## Implementation Tasks

### Task 1: Create English Homepage

**File:** `src/pages/en/index.astro` (new)

```astro
---
import EnPage from "@layouts/EnPage.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
import { getStrings } from "src/i18n/strings";

const t = getStrings("en");
---

<EnPage 
  title="MYRRYS - Games for Players"
  description="MYRRYS - Role-playing games from players to players since 2009"
>
  <main class="content-grid">
    <section>
      <h1>Welcome to MYRRYS</h1>
      <p>
        MYRRYS is a Finnish publisher of tabletop role-playing games,
        creating unique experiences for players worldwide.
      </p>
    </section>

    <section>
      <h2>{t.latestPosts}</h2>
      <BlogIndex 
        collection="blog-en" 
        urlPrefix="/en/blog/"
        limit={3}
      />
    </section>

    <section>
      <h2>Our Games</h2>
      <div class="two-col">
        <div class="surface">
          <h3><a href="/en/the-quick">The Quick</a></h3>
          <p>A story-driven RPG about character dynamics and free-form narrative.</p>
        </div>
        <div class="surface">
          <h3><a href="/hood">Hood</a></h3>
          <p>Adventure in the world of Robin Hood's legend.</p>
        </div>
      </div>
    </section>
  </main>
</EnPage>
```

### Task 2: Create English Blog Index

**File:** `src/pages/en/blog/index.astro` (new)

```astro
---
import EnPage from "@layouts/EnPage.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
---

<EnPage title="Blog - MYRRYS">
  <main class="content-grid">
    <section>
      <h1>Blog</h1>
      <p>
        News, updates, and insights from the MYRRYS team.
      </p>
    </section>

    <section>
      <BlogIndex 
        collection="blog-en" 
        urlPrefix="/en/blog/"
      />
    </section>
  </main>
</EnPage>
```

### Task 3: Create English Blog Dynamic Route

**File:** `src/pages/en/blog/[id].astro` (new)

```astro
---
import { getCollection, render } from "astro:content";
import EnPage from "@layouts/EnPage.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog-en");
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<EnPage
  title={post.data.title}
  description={post.data.description}
  image={post.data.heroImage}
>
  <main class={`content-grid ${post.data.theme || ""}`}>
    <section>
      <article>
        {post.data.heroImage && (
          <img src={post.data.heroImage} alt="" class="poster" />
        )}
        <h1>{post.data.title}</h1>
        <Content />
      </article>
    </section>
  </main>
</EnPage>

<style>
  .poster {
    aspect-ratio: 16 / 9;
    object-fit: contain;
    object-position: center;
    width: 100%;
    margin-bottom: calc(var(--grid) * 2);
  }
</style>
```

### Task 4: Create English Product Page (The Quick)

**File:** `src/pages/en/the-quick/index.astro` (new)

```astro
---
import EnPage from "@layouts/EnPage.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
---

<EnPage 
  title="The Quick - MYRRYS"
  description="A story-driven role-playing game about character dynamics"
>
  <main class="content-grid theme-quick">
    <section class="full-width" style="background: var(--surface-secondary); color: white;">
      <div class="surface">
        <h1>The Quick</h1>
        <p class="lead">
          A character and story-driven tabletop RPG built around dynamic
          relationships and free-form narrative.
        </p>
      </div>
    </section>

    <section>
      <article>
        <h2>About The Quick</h2>
        <p>
          The Quick is a story-driven role-playing game that focuses on
          the dynamics between characters and their evolving relationships.
          Built using systems inspired by Powered by the Apocalypse and
          Forged in the Dark.
        </p>

        <h3>Key Features</h3>
        <ul>
          <li>Character-driven narrative</li>
          <li>Move-based gameplay</li>
          <li>Free-form storytelling</li>
          <li>Dynamic relationships</li>
        </ul>
      </article>
    </section>

    <section>
      <h2>Latest Updates</h2>
      <BlogIndex 
        collection="blog-en"
        urlPrefix="/en/blog/"
        tag="The Quick"
        limit={4}
      />
    </section>
  </main>
</EnPage>

<style>
  .lead {
    font-size: calc(1.25 * var(--grid));
    line-height: calc(2 * var(--grid));
  }
</style>
```

### Task 5: Update English Layout with Locale Prop

**File:** `src/layouts/EnPage.astro`

Ensure locale is passed to all base components:

```astro
---
import BaseHead from "@components/base/BaseHead.astro";
import SiteFooter from "@components/base/SiteFooter.astro";
import TopNav from "@components/base/TopNav.astro";

interface Props {
  title: string;
  description?: string;
  image?: string;
}

const { title, description, image } = Astro.props;
---

<html lang="en">
  <head>
    <BaseHead 
      title={title} 
      description={description} 
      image={image}
      locale="en"
    />
  </head>
  <body>
    <TopNav locale="en" />
    <slot />
    <SiteFooter locale="en" />
  </body>
</html>
```

### Task 6: Add Playwright E2E Tests

**File:** `tests/english-routes.spec.ts` (new)

```typescript
import { test, expect } from "@playwright/test";

test.describe("English Market Routes", () => {
  test("English homepage renders correctly", async ({ page }) => {
    await page.goto("/en/");
    
    // Check language attribute
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    
    // Check heading
    await expect(page.locator("h1")).toContainText("Welcome to MYRRYS");
    
    // Check English UI strings
    await expect(page.getByText("Latest posts")).toBeVisible();
    
    // Check blog preview uses English collection
    const blogSection = page.locator("section").filter({ hasText: "Latest posts" });
    await expect(blogSection.locator("article").first()).toBeVisible();
  });

  test("English blog index works", async ({ page }) => {
    await page.goto("/en/blog");
    
    // Check heading
    await expect(page.locator("h1")).toContainText("Blog");
    
    // Check articles render
    await expect(page.locator("article").first()).toBeVisible();
    
    // Check links have correct prefix
    const firstArticle = page.locator("article").first();
    const link = firstArticle.locator("a");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/en\/blog\//);
  });

  test("English blog post renders", async ({ page }) => {
    // First get a blog post ID
    await page.goto("/en/blog");
    const firstLink = page.locator("article a").first();
    await firstLink.click();
    
    // Should navigate to post
    expect(page.url()).toMatch(/\/en\/blog\/.+/);
    
    // Should have content
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("article")).toBeVisible();
  });

  test("The Quick product page renders", async ({ page }) => {
    await page.goto("/en/the-quick");
    
    // Check heading
    await expect(page.locator("h1")).toContainText("The Quick");
    
    // Check description
    await expect(page.getByText("character and story-driven")).toBeVisible();
    
    // Check blog section
    await expect(page.getByText("Latest Updates")).toBeVisible();
  });

  test("English pages use correct meta tags", async ({ page }) => {
    await page.goto("/en/");
    
    // Check HTML lang
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    
    // Check title
    await expect(page).toHaveTitle(/MYRRYS/);
  });

  test("Navigation between English pages works", async ({ page }) => {
    await page.goto("/en/");
    
    // Click blog link (if exists in nav)
    await page.getByRole("link", { name: /blog/i }).first().click();
    
    // Should be on blog page
    expect(page.url()).toContain("/en/blog");
  });
});
```

### Task 7: Add sitemap validation test

**File:** `tests/seo.spec.ts` (new)

```typescript
import { test, expect } from "@playwright/test";

test.describe("SEO and Sitemap", () => {
  test("Sitemap includes English routes", async ({ page }) => {
    const response = await page.goto("/sitemap-0.xml");
    expect(response?.status()).toBe(200);
    
    const content = await page.content();
    
    // Should include English homepage
    expect(content).toContain("/en/");
    
    // Should include English blog
    expect(content).toContain("/en/blog");
  });

  test("Finnish and English pages have correct canonical URLs", async ({ page }) => {
    // Finnish homepage
    await page.goto("/");
    let canonical = page.locator('link[rel="canonical"]');
    let href = await canonical.getAttribute("href");
    expect(href).toBe("https://myrrys.com/");
    
    // English homepage
    await page.goto("/en/");
    canonical = page.locator('link[rel="canonical"]');
    href = await canonical.getAttribute("href");
    expect(href).toBe("https://myrrys.com/en/");
  });

  test("No hreflang tags (content not equivalent)", async ({ page }) => {
    await page.goto("/");
    
    // Should NOT have hreflang alternates
    const hreflang = page.locator('link[rel="alternate"][hreflang]');
    await expect(hreflang).toHaveCount(0);
  });
});
```

### Task 8: Update Design System Documentation

**File:** `src/pages/ds/i18n.astro` (append)

```astro
<h2>Complete Implementation Example</h2>

<p>Full example of an English market page using all i18n patterns:</p>

<pre><code>---
// src/pages/en/example.astro
import EnPage from "@layouts/EnPage.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
import { getStrings } from "src/i18n/strings";

const t = getStrings("en");
---

&lt;EnPage 
  title="Example Page"
  description="Example of English market page"
&gt;
  &lt;main class="content-grid"&gt;
    &lt;section&gt;
      &lt;h1&gt;Example Page&lt;/h1&gt;
      &lt;p&gt;This page demonstrates the i18n system.&lt;/p&gt;
    &lt;/section&gt;

    &lt;section&gt;
      &lt;h2&gt;{t.latestPosts}&lt;/h2&gt;
      &lt;BlogIndex 
        collection="blog-en" 
        urlPrefix="/en/blog/"
        limit={3}
      /&gt;
    &lt;/section&gt;
  &lt;/main&gt;
&lt;/EnPage&gt;
</code></pre>

<h2>Checklist for New English Pages</h2>

<ul>
  <li>✅ Use <code>EnPage</code> layout</li>
  <li>✅ Set <code>lang="en"</code> in HTML</li>
  <li>✅ Use <code>blog-en</code> or <code>products-en</code> collections</li>
  <li>✅ Set <code>urlPrefix="/en/..."</code> on components</li>
  <li>✅ Import and use <code>getStrings("en")</code> for UI text</li>
  <li>✅ Use English content (not translations)</li>
</ul>
```

## Acceptance Criteria

### Routes Created
- [ ] `/en/` homepage exists and renders
- [ ] `/en/blog/` index exists and renders
- [ ] `/en/blog/[id]` dynamic route works
- [ ] At least one product page exists (`/en/the-quick`)
- [ ] All routes use `EnPage` layout

### Content
- [ ] English homepage shows English blog preview
- [ ] Blog index shows all English posts
- [ ] Blog posts render correctly
- [ ] Product page has proper structure
- [ ] All content in English (not Finnish)

### i18n Integration
- [ ] `lang="en"` in all English pages
- [ ] English UI strings used throughout
- [ ] Components receive correct `collection` props
- [ ] URL prefixes correct (`/en/blog/`)
- [ ] No hardcoded Finnish text

### SEO
- [ ] Canonical URLs include `/en/` prefix
- [ ] Meta descriptions in English
- [ ] No hreflang tags (content not equivalent)
- [ ] Sitemap includes English routes

### Testing
- [ ] Playwright E2E tests pass
- [ ] All English routes tested
- [ ] SEO tags validated
- [ ] Navigation tested

### Documentation
- [ ] Complete example in `/ds/i18n`
- [ ] Checklist for new pages
- [ ] Code examples provided

### Build & Quality
- [ ] `pnpm build` succeeds
- [ ] English pages in build output
- [ ] No TypeScript errors
- [ ] No console warnings

## Testing Strategy

### Test Execution

```bash
# Build
pnpm build

# Preview
pnpm preview &

# Run E2E tests
pnpm test:e2e tests/english-routes.spec.ts
pnpm test:e2e tests/seo.spec.ts
```

### Manual Testing Checklist

- [ ] Visit `/en/` - renders correctly
- [ ] Visit `/en/blog` - shows English posts
- [ ] Click a blog post - navigates and renders
- [ ] Visit `/en/the-quick` - product page works
- [ ] Check HTML source - `lang="en"` present
- [ ] Check meta tags - English descriptions
- [ ] Check sitemap - includes `/en/` routes
- [ ] Mobile view - responsive design works

## Dependencies

**Depends On:**
- PBI-I18N-001 (English collections)
- PBI-I18N-002 (Refactored components)
- PBI-I18N-003 (UI strings)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing English content | High | Create sample content in tasks |
| SEO misconfiguration | Medium | E2E tests validate meta tags |
| Broken navigation | Medium | Test all internal links |
| Inconsistent styling | Low | Use existing components |

## Success Metrics

- ✅ Complete English market functional
- ✅ All E2E tests pass
- ✅ SEO properly configured
- ✅ Zero hardcoded Finnish in EN pages

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Playwright E2E tests passing
- [ ] SEO tests passing
- [ ] Design system documentation updated
- [ ] Manual testing completed
- [ ] Code reviewed
- [ ] Merged to dev branch

## References

- Spec: [specs/i18n/spec.md](../../specs/i18n/spec.md)
- Astro Routing: https://docs.astro.build/en/core-concepts/routing/
- SEO Best Practices: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

## Notes

- This PBI proves the i18n architecture works end-to-end
- Creates foundation for expanding English content
- Validates component reuse strategy
- Sample content should be realistic, not placeholder text
- This completes the core i18n implementation
