# Spec: Images and Assets (MYR-23, MYR-40)

## Blueprint (Design)

### Context

> **Goal:** Standardize how images are loaded, optimized, and delivered across the Myrrys website.
> **Why:** MYR-23 highlights that using Astro's `<Image>` component with `public/` folder string paths provides a false sense of security. Astro does not optimize `public/` assets, meaning `widths`, `format`, and `quality` props do nothing. MYR-40 identifies specific blog hero images served at full resolution (up to 2480x3248) for 64x64px thumbnail display, wasting ~405 KB on the homepage alone.
> **Architectural Impact:** All UI components handling image rendering (e.g., `LetlBlock`, `LessBlock`, `BlogIndex`, `blog/[id]`, `LegendaFrontArticle`), the blog content collection schema (`heroImage` field), and blog post frontmatter.

### Architecture

Astro's asset optimization pipeline (`astro:assets`) only kicks in when assets are located within `src/` (typically `src/assets/`) and imported via ESM (`import img from '@/assets/img.webp'`), or when images are attached to Content Collections (where Astro handles the import internally via the `image()` schema type).

To resolve MYR-23, MYR-40, and future ambiguities while maximizing UX:
1. **Optimized Assets (Default):** Any image that is part of the UI, content, or layout MUST reside in `src/assets/` (or adjacent to its content). It must be imported via ESM and rendered using Astro's `<Image>` or `<Picture>` components to automatically generate responsive `srcset` payloads and optimized formats.
2. **Content Collection Images:** Frontmatter image fields (e.g., `heroImage`) MUST use Astro's `image()` schema type instead of `z.string()`. This enables Astro to resolve imports at build time and feed proper image metadata to `<Image>`.
3. **Public Assets (Exceptions):** The `public/` directory should be strictly reserved for files that *must* retain a specific URL string (e.g., `robots.txt`, `favicon.ico`, `og-image.jpg`, or PDF downloads).

#### Blog Image Pipeline (MYR-40)

The blog images have two distinct rendering contexts with very different size requirements:

```
Blog frontmatter heroImage (image() schema)
  │
  ├─► BlogIndex.astro  → .icon thumbnail  → 64×64px display
  │   Use: <Image> with widths={[64, 128]} sizes="64px"
  │
  └─► blog/[id].astro  → .poster hero     → 100% width, 16/9 aspect
      Use: <Image> with widths={[400, 800, 1200]} sizes="(max-width: 640px) 100vw, 800px"
```

The `legenda-kansi-1-preview.webp` in `LegendaFrontArticle.astro` is a separate case: it already uses `<Image>` but with a public-path string. It must be migrated to a static import from `src/assets/`.

### Anti-Patterns

<rules>
<rule id="image-component-for-public-assets">
NEVER use Astro's `<Image>` or `<Picture>` components for images located in the `public/` directory (e.g., `src="/letl/image.webp"`).
**Why:** Astro serves `public/` files statically without passing them through the image optimization pipeline. Passing `widths` or `format` props to `<Image>` with a public source string does absolutely nothing, creating bloated, misleading code.
</rule>
<rule id="static-images-in-public">
AVOID placing UI or content images in the `public/` directory.
**Why:** It prevents Astro from compiling them into responsive, optimized formats like WebP/AVIF, resulting in degraded UX and slower LCP times (sending large desktop images to mobile users).
**Instead:** Place them in `src/assets/` and use `import`.
</rule>
<rule id="string-schema-for-images">
NEVER use `z.string()` for content collection image fields.
**Why:** String paths bypass the optimization pipeline entirely. Astro's `image()` schema type auto-resolves imports at build time, enabling `<Image>` with `widths`/`sizes` for proper responsive delivery.
**Instead:** Use `image()` from Astro's content collection helpers.
</rule>
<rule id="oversized-thumbnails">
NEVER serve a full-resolution image for a thumbnail display context. When an image is displayed at ≤128px in any dimension, the `widths` array must not exceed `[64, 128]`.
**Why:** Serving a 2480x3248 source for a 64x64 display wastes bandwidth and decoding time. The Lighthouse `image-delivery-insight` audit penalises this heavily.
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

#### MYR-23 (Component Images)
- [ ] UI and content images currently in `public/` (like `basiliski.webp`) are moved into `src/assets/`.
- [ ] Components using these images (like `LetlBlock.astro` and `LessBlock.astro`) are updated to `import` the image from `src/assets/`.
- [ ] The imported object is passed to Astro's `<Image>` component, successfully triggering Astro's optimization pipeline.
- [ ] No Astro `<Image>` components receive a bare string path starting with `/` (indicating a public asset) unless specifically intended to bypass optimization (which should be rare).
- [ ] `sizes` attribute is correctly configured alongside `widths` to ensure browser calculates the correct image to load.

#### MYR-40 (Blog & Legenda Images)
- [ ] Blog content schema `heroImage` field uses Astro `image()` type instead of `z.string()`.
- [ ] Blog hero images moved from `public/` to `src/assets/blog/` and frontmatter paths updated to relative references.
- [ ] `BlogIndex.astro` uses `<Image>` with `widths={[64, 128]}` and `sizes="64px"` for `.icon` thumbnails.
- [ ] `blog/[id].astro` uses `<Image>` with appropriate `widths` and `sizes` for the `.poster` display.
- [ ] `LegendaFrontArticle.astro` migrated from public-path string to static import for `legenda-kansi-1-preview.webp`.
- [ ] Lighthouse `image-delivery-insight` audit shows significant improvement (target: eliminate ~350 KB wasted).
- [ ] No regressions: all blog posts build successfully, images render at correct dimensions.

#### Shared
- [ ] Logic unit tested completely using `vitest` (no arbitrary DOM checks, pure script evaluation). (N/A for static asset imports).
- [ ] Spec scenarios functionally verified through Playwright E2E tests (`tests/`).

### Regression Guardrails

<invariants>
<invariant id="optimized-images-require-imports">
Astro `<Image>` implementations must receive imported asset objects (or content collection image metadata), NEVER bare URL strings from the public directory.
Violating this breaks response payloads because large source images will be sent to mobile devices instead of the expected `srcset` responsive sizes.
</invariant>
<invariant id="blog-hero-image-schema">
Blog `heroImage` must use Astro's content collection `image()` type, not `z.string()`.
Violating this bypasses the optimization pipeline and sends full-resolution images to all viewports.
</invariant>
<invariant id="thumbnail-size-budget">
Images displayed at ≤128px must not have srcset candidates wider than 256px (2x density).
Violating this wastes bandwidth and decoding time on every page load.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: Image Asset Optimization

  Scenario: Rendering an optimized component image
    Given an image `hero.webp` exists in `src/assets/`
    When a developer implements this image in a component
    Then they must import it: `import heroImg from '../../assets/hero.webp'`
    And render it via `<Image src={heroImg} alt="Description" widths={[400, 800]} sizes="(max-width: 800px) 400px, 800px" />`

  Scenario: Attempting to optimize a public asset
    Given an image `hero.webp` exists in `public/img/`
    When a developer attempts to use `<Image src="/img/hero.webp" widths={[400, 800]} />`
    Then this is a violation of the rule `image-component-for-public-assets`
    And the image must instead be moved to `src/assets/` and imported

  Scenario: Blog index thumbnails are optimized (MYR-40)
    Given the built HTML of the blog index page
    When blog post entries with hero images are rendered
    Then each thumbnail <img> has a srcset attribute
    And the smallest srcset candidate is ≤128px wide

  Scenario: Blog post poster image is optimized (MYR-40)
    Given the built HTML of a blog post with a hero image
    When the poster image is rendered
    Then the <img> has a srcset attribute with responsive widths
    And the <img> has a sizes attribute

  Scenario: Legenda cover uses static import (MYR-40)
    Given the built HTML of the homepage
    When the Legenda cover image is rendered
    Then the <img> has a srcset attribute
    And the largest srcset candidate is ≤600px wide
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/assets/...` | New destination for migrated images previously in `public/letl/` and `public/less/`. |
| `src/assets/blog/` | New destination for migrated blog hero images from `public/blog-images/`, `public/letl/`, `public/assets/letl/`. |
| `src/content.config.ts` | Change `heroImage` from `z.string().optional()` to `image().optional()`. |
| `src/blog/*.md` | Update `heroImage` frontmatter paths from absolute public URLs to relative paths (e.g., `../assets/blog/legenda-1-cover.webp`). |
| `src/components/blog/BlogIndex.astro` | Replace plain `<img>` with `<Image>` for `.icon` thumbnails using `widths={[64, 128]}` and `sizes="64px"`. |
| `src/pages/blog/[id].astro` | Replace plain `<img>` with `<Image>` for `.poster` display using appropriate `widths`/`sizes`. |
| `src/components/legenda/LegendaFrontArticle.astro` | Migrate from public-path string to static import for `legenda-kansi-1-preview.webp`. |
| `src/components/letl/LetlBlock.astro` | Update to `import` from `src/assets/` and pass to `<Image>`. Add `sizes` attribute. |
| `src/components/less/LessBlock.astro` | Apply the same migration and import pattern for its respective images. |
| `tests/image-optimization.spec.ts` | Playwright E2E tests verifying the MYR-40 Gherkin scenarios. |

---

## Decision Log

### Migrating to `src/assets/` for Optimization

**Decision:** We chose Option A from MYR-23: Migrate static UI/content images from the `public/` directory into the `src/assets/` directory.

**Reasoning:**
1. Our primary directive includes delivering the best User Experience possible. Delivering unoptimized, monolithic images to mobile users degrades performance metrics (LCP).
2. By moving the assets into the `src/` tree, Astro will automatically process them, generate hashes for cache busting, create WebP fallbacks, and output responsive `srcset` arrays.

**Trade-offs:**
- Requires moving files and refactoring the components that reference them.
- Build times may marginally increase as Astro performs the image transformations during the build process.

### Blog heroImage schema migration (MYR-40)

**Decision:** Migrate `heroImage` from `z.string()` to Astro's `image()` content collection type, and move blog images from `public/` to `src/assets/blog/`.

**Reasoning:**
1. The existing assets spec already mandates this pattern (MYR-23)
2. `z.string()` paths bypass the optimization pipeline entirely — plain `<img>` tags serve full-resolution images regardless of display size
3. Astro's `image()` type auto-resolves imports at build time, enabling `<Image>` with `widths`/`sizes` for proper responsive delivery
4. The BlogIndex icon use case (64x64 display of 2480x3248 source) is the single biggest waste identified by Lighthouse (~405 KB on homepage)

**Trade-offs:**
- Requires updating frontmatter in all blog posts that use heroImage
- Build times increase marginally as Astro processes the images
- Images can no longer be referenced by stable public URL (acceptable — they are not linked externally)
