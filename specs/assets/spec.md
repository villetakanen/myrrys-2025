# Spec: Images and Assets (MYR-23)

## Blueprint (Design)

### Context

> **Goal:** Standardize how images are loaded, optimized, and delivered across the Myrrys website.
> **Why:** MYR-23 highlights that using Astro's `<Image>` component with `public/` folder string paths provides a false sense of security. Astro does not optimize `public/` assets, meaning `widths`, `format`, and `quality` props do nothing. We want to maximize UX by leveraging Astro's responsive `srcset` generation. 
> **Architectural Impact:** All UI components handling image rendering (e.g., `LetlBlock`, `LessBlock`).

### Architecture

Astro's asset optimization pipeline (`astro:assets`) only kicks in when assets are located within `src/` (typically `src/assets/`) and imported via ESM (`import img from '@/assets/img.webp'`), or when images are attached to Content Collections (where Astro handles the import internally).

To resolve MYR-23 and future ambiguities while maximizing UX:
1. **Optimized Assets (Default):** Any image that is part of the UI, content, or layout MUST reside in `src/assets/` (or adjacent to its content). It must be imported via ESM and rendered using Astro's `<Image>` or `<Picture>` components to automatically generate responsive `srcset` payloads and optimized formats.
2. **Public Assets (Exceptions):** The `public/` directory should be strictly reserved for files that *must* retain a specific URL string (e.g., `robots.txt`, `favicon.ico`, `og-image.jpg`, or PDF downloads). 

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
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] UI and content images currently in `public/` (like `basiliski.webp`) are moved into `src/assets/`.
- [ ] Components using these images (like `LetlBlock.astro` and `LessBlock.astro`) are updated to `import` the image from `src/assets/`.
- [ ] The imported object is passed to Astro's `<Image>` component, successfully triggering Astro's optimization pipeline.
- [ ] No Astro `<Image>` components receive a bare string path starting with `/` (indicating a public asset) unless specifically intended to bypass optimization (which should be rare).
- [ ] `sizes` attribute is correctly configured alongside `widths` to ensure browser calculates the correct image to load.
- [ ] Logic unit tested completely using `vitest` (no arbitrary DOM checks, pure script evaluation). (N/A for static asset imports).
- [ ] Spec scenarios functionally verified through Playwright E2E tests (`tests/`).

### Regression Guardrails

<invariants>
<invariant id="optimized-images-require-imports">
Astro `<Image>` implementations must receive imported asset objects (or content collection image metadata), NEVER bare URL strings from the public directory.
Violating this breaks response payloads because large source images will be sent to mobile devices instead of the expected `srcset` responsive sizes.
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
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/assets/...` | New destination for migrated images previously in `public/letl/` and `public/less/`. |
| `src/components/letl/LetlBlock.astro` | Update to `import basiliski from '../../assets/letl/basiliski.webp'` and pass the object to `<Image>`. Add `sizes` attribute. |
| `src/components/less/LessBlock.astro` | Apply the same migration and import pattern for its respective images. |

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
