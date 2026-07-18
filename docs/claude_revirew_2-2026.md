# Astro 5.x Compliance Review — Myrrys 2025

**Date:** 2026-02-20
**Reviewed by:** Claude Opus 4.6
**Astro version:** ^5.16.0
**Scope:** Project-wide review against Astro 5.x documentation and best practices

---

## Summary

The project is well-architected and correctly uses the Astro 5.x Content Layer API (`content.config.ts`, `glob` loader, `render()` from `astro:content`). No legacy v2/v4 patterns (e.g. `Astro.glob()`, `entry.render()`, `slug` instead of `id`) were found. The review uncovered **2 bugs**, **4 medium-priority issues**, and **several minor improvements**.

---

## Bugs

### B1. Class concatenation produces `"undefined content-grid"` when theme is absent

**File:** `src/pages/blog/[id].astro:39`

```astro
<main class={post.data.theme + " content-grid" || "content-grid"}>
```

When `post.data.theme` is `undefined`, JavaScript evaluates `undefined + " content-grid"` to the string `"undefined content-grid"`, which is truthy, so the `||` fallback never triggers. The rendered HTML becomes `class="undefined content-grid"`.

**Fix — use `class:list` (Astro's built-in directive):**
```astro
<main class:list={[post.data.theme, "content-grid"]}>
```

`class:list` automatically filters out falsy values, which is exactly the pattern Astro recommends for conditional classes.

---

### B2. `<Image>` component used with `public/` directory paths — optimisation props are ineffective

**Files:** `src/components/letl/LetlBlock.astro:10-19`, `src/components/less/LessBlock.astro:10-19`

```astro
<Image
  src="/letl/basiliski.webp"
  widths={[696, 1024]}
  format="webp"
  ...
/>
```

Per Astro docs: images in `public/` are "served statically without transformation". The `widths`, `format`, and `quality` props have **no effect** when `src` is a string path to a public asset. No `srcset` is generated; no format conversion occurs.

Additionally, the `sizes` attribute is **required** when `widths` is specified (per the Astro Image reference), but it's missing here.

**Fix options:**
- **(A)** Move the images to `src/assets/` and import them, allowing full optimisation.
- **(B)** Switch to plain `<img>` tags (which is what the rest of the project does for `public/` images), removing the false sense of optimisation.

---

## Medium Priority

### M1. Inconsistent import style — bare `src/` paths vs path aliases

**Files:** 10 page files use bare `src/` imports

```typescript
// These files use bare "src/" paths:
import Page from "src/layouts/Page.astro";       // pages/index.astro, 404.astro, etc.
import Page from "src/layouts/EnPage.astro";      // pages/en/index.astro

// While dynamic route pages use the configured alias:
import Page from "@layouts/Page.astro";           // pages/blog/[id].astro, letl/[id].astro
```

Bare `src/` imports work via Vite resolution but are not a documented Astro pattern. The project has `@layouts/*` configured in `tsconfig.json` — these should be used consistently.

Also in `BaseHead.astro`:
```typescript
import "src/styles/styles.css";  // should be a relative import
```

**Fix:** Replace all bare `src/` imports with either the `@layouts/` alias or relative paths.

---

### M2. View Transitions + external analytics script may not re-fire on SPA navigation

**File:** `src/components/base/BaseHead.astro:130`

```html
<script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
```

With `<ClientRouter />` enabled, client-side page navigations do **not** trigger full page loads — so scripts that rely on the page `load` event won't re-execute. Astro's docs warn: "Bundled module scripts execute only once; they won't re-run after navigation."

For analytics, this means **SPA navigations are not tracked** — only the initial page load and full-page navigations.

**Fix:** SimpleAnalytics has [SPA support](https://docs.simpleanalytics.com/spa). Verify their script handles `popstate`/`pushState` events, or add a manual `astro:page-load` listener:

```astro
<script>
  document.addEventListener('astro:page-load', () => {
    // trigger page view if needed by the analytics provider
  });
</script>
```

---

### M3. Product schema `pubDate` typed as `z.string()` while blog uses `z.coerce.date()`

**File:** `src/content.config.ts:18`

```typescript
// Blog — properly coerced to Date:
pubDate: z.coerce.date(),

// Products — raw string, no validation:
pubDate: z.string(),
```

This means product `pubDate` isn't validated as a real date and can't use `.toISOString()` or other Date methods without manual conversion. It's also an inconsistency that could cause runtime surprises if someone assumes product dates behave like blog dates.

**Fix:** Change to `z.coerce.date()` for consistency and validation (may require updating product pages that display the date as a string).

---

### M4. RSS feed content doesn't apply remark plugins

**File:** `src/pages/blog/rss.xml.ts:31`

```typescript
content: sanitizeHtml(
  parser.render(`# ${post.data.title}\n\n${post.body}`),
),
```

The RSS feed uses `markdown-it` directly on `post.body` (raw markdown), bypassing the `remarkSrdLinks` plugin registered in `astro.config.mjs`. Any SRD-related links in blog posts would render as broken relative links in the RSS feed.

**Fix:** If blog posts may contain SRD links, either:
- Use `render()` from `astro:content` and extract the HTML, or
- Apply the same link transformation logic before passing to markdown-it.

---

## Low Priority / Informational

### L1. Empty `alt` attributes on content images

**Files:** Multiple components

```astro
<!-- Decorative — empty alt is correct: -->
<img src={icon} alt="" />            <!-- NavLink.astro -->

<!-- Content images — should have descriptive alt: -->
<img src={post.data.heroImage} alt="" class="poster" />  <!-- blog/[id].astro:44 -->
<img src={post.data.heroImage} alt="" class="icon" />     <!-- BlogIndex.astro:34 -->
<img src={post.data.heroImage} alt="" class="poster" />   <!-- letl/[id].astro:59 -->
```

`alt=""` tells screen readers to skip the image entirely (decorative). Blog hero images and product images are content-relevant and should have descriptive alt text — the post title is a reasonable fallback.

**Fix:** Use `alt={post.data.title}` or add an `altText` field to the content schema.

---

### L2. `set:html` with processed markdown on SRD page

**File:** `src/pages/letl/srd/[...id].astro:53`

```astro
<div class="toc" set:html={tocContent} />
```

`tocContent` is produced by running `markdown-it` on raw markdown from the SRD submodule. While the source is controlled, `set:html` bypasses Astro's built-in content rendering pipeline. If this TOC content could instead be rendered as a collection entry via `render()`, it would benefit from the remark plugin pipeline and safer rendering.

---

### L3. Lightning CSS `targets` is empty

**File:** `astro.config.mjs:15`

```javascript
lightningcss: {
  targets: {},  // No browser targeting
  include: Features.Nesting,
},
```

An empty `targets` object means Lightning CSS won't apply any browser compatibility transforms. If the site needs to support older browsers, configure targets (e.g. via `browserslist` or Lightning CSS target syntax).

---

### L4. No `src/env.d.ts` file

While `.astro/types.d.ts` is included in `tsconfig.json` (correct for Astro 5), the `src/env.d.ts` file is the conventional place for custom type declarations and global augmentations. Not strictly required, but useful if custom types are needed in the future.

---

### L5. Redundant trailing-slash redirects

**File:** `astro.config.mjs:25-26`

```javascript
"/letl/srd": "/letl/srd/readme",
"/letl/srd/": "/letl/srd/readme",
```

With `trailingSlash: "ignore"`, both variants should be handled by a single redirect. Having both is harmless but redundant.

---

### L6. Comments in `tsconfig.json`

**File:** `tsconfig.json:12-13`

```jsonc
"strictNullChecks": true, // add if using `base` template
"allowJs": true // required, and included with all Astro templates
```

These comments are stale guidance from the Astro template — `strictNullChecks` is already included in the `strict` preset that this config extends. The `allowJs` note is also inherited. Both lines (and their comments) could be removed since they're covered by the `extends`.

---

## What's Done Well

| Area | Assessment |
|------|-----------|
| Content Layer API | Correctly uses `content.config.ts`, `glob` loader, `render()` import — fully Astro 5.x compliant |
| TypeScript | Strict mode, proper path aliases, `.astro/types.d.ts` in includes |
| View Transitions | Correct `<ClientRouter />` usage (renamed from `<ViewTransitions />` in v5) |
| Static output | No legacy `output: 'hybrid'` — uses `output: 'static'` correctly |
| No `Astro.glob()` | Zero usage of the deprecated `Astro.glob()` — all content uses `getCollection()` |
| Content rendering | Uses `render()` imported from `astro:content` (not legacy `entry.render()`) |
| Scoped CSS | Good use of `<style>` in components for scoped styles |
| SEO | Comprehensive JSON-LD (Organization, Website, BreadcrumbList, Article, Product) |
| No client JS bloat | Zero `client:` directives — fully static rendering |
| Mobile-first CSS | Consistent `min-width` media queries at 640px and 1024px breakpoints |
