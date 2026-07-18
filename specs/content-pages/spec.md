# Spec: Content-Driven Pages

## Blueprint (Design)

### Context

> **Goal:** Provide a reusable pattern for content-driven informational pages where body text lives in Markdown files with frontmatter-driven theming.
> **Why:** The footer links to `/myrrys` ("Tietoja yrityksestä") but no page exists — it's a dead link. More broadly, the site has no pattern for standalone informational pages; all current pages are pure `.astro` files with hardcoded content.
> **Architectural Impact:** New content collection (`site-pages`), new dynamic route (`src/pages/[id].astro`), and a breadcrumb label mapping update.

### Architecture

A new Astro content collection named `site-pages` sources Markdown files from `src/site-pages/`. Each file's frontmatter declares `title`, optional `description`, optional `image`, and optional `theme` (matching the existing theme enum). A single-segment dynamic route at `src/pages/[id].astro` renders these pages using the same layout pattern as blog posts.

```
src/
  site-pages/
    myrrys.md          # First content page — company info
  pages/
    [id].astro         # Dynamic route for site-pages collection
  content.config.ts    # Collection schema definition
```

**Data flow:**

1. Astro content loader globs `src/site-pages/*.md`
2. `getStaticPaths()` maps each entry to `{ params: { id }, props: { page } }`
3. Template renders `<h1>` from frontmatter `title`, content from Markdown body
4. `class:list` on `<main>` applies optional `theme` class alongside `content-grid`

### Anti-Patterns

<rules>
<rule id="no-hardcoded-content-pages">
NEVER create standalone `.astro` files with hardcoded content for informational pages. Use the `site-pages` collection and Markdown files instead. This keeps content editable without touching component code.
</rule>
<rule id="no-catch-all-route">
NEVER use catch-all `[...id]` routes for site pages. Single-segment `[id]` is sufficient (YAGNI) and avoids accidentally shadowing nested existing routes like `/letl/srd/*`.
</rule>
<rule id="no-h1-in-markdown-body">
NEVER include an H1 (`#`) in site-page Markdown body content. The `<h1>` is injected by the template from `frontmatter.title`. Body content should start at H2 (`##`).
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] `site-pages` collection defined in `src/content.config.ts` with `title`, `description`, `image`, and `theme` fields.
- [ ] Dynamic route `src/pages/[id].astro` renders collection entries with theme class support.
- [ ] `/myrrys` page renders with company info, `theme-letl` class, and correct meta tags.
- [ ] Breadcrumb JSON-LD shows "Myrrysmiehet Oy" for the `myrrys` segment.
- [ ] Footer link to `/myrrys` resolves (no dead link).
- [ ] No "undefined" string appears in class attributes when theme is omitted.
- [ ] Logic unit tested completely using `vitest` (no arbitrary DOM checks, pure script evaluation).
- [ ] Spec scenarios functionally verified through Playwright E2E tests (`tests/`).

### Regression Guardrails

<invariants>
<invariant id="single-h1">
Every rendered page must have exactly one `<h1>` element.
If violated, SEO and accessibility scores degrade; the SEO sweep tests fail.
</invariant>
<invariant id="no-undefined-class">
The `class` attribute on `<main>` must never contain the literal string "undefined".
If violated, CSS theming breaks and pages render with incorrect styling.
</invariant>
<invariant id="footer-link-resolves">
The footer link to `/myrrys` must return HTTP 200.
If violated, users encounter a dead link from every page on the site.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: Content-Driven Pages

  Scenario: Myrrys page renders with correct content
    Given the site-pages collection contains "myrrys.md"
    When a user navigates to "/myrrys"
    Then the page returns HTTP 200
    And the page has exactly one H1 with text "Myrrysmiehet Oy"
    And the main element has classes "theme-letl" and "content-grid"

  Scenario: Meta tags populated from frontmatter
    Given "myrrys.md" has title "Myrrysmiehet Oy" and a description
    When a user navigates to "/myrrys"
    Then the page title contains "Myrrysmiehet Oy"
    And the meta description is populated

  Scenario: Theme class omitted when not set
    Given a site-page with no theme in frontmatter
    When the page renders
    Then the main element class does not contain "undefined"
    And the main element has class "content-grid"

  Scenario: Footer link resolves
    Given the site footer contains a link to "/myrrys"
    When a user clicks "Tietoja yrityksestä"
    Then the browser navigates to "/myrrys"
    And the page returns HTTP 200

  Scenario: Breadcrumb shows mapped label
    Given the breadcrumb segment labels include "myrrys" → "Myrrysmiehet Oy"
    When a user navigates to "/myrrys"
    Then the JSON-LD BreadcrumbList contains "Myrrysmiehet Oy"
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/content.config.ts` | Defines `site-pages` collection schema |
| `src/site-pages/myrrys.md` | Myrrys company page content |
| `src/pages/[id].astro` | Dynamic route rendering site-pages entries |
| `src/components/base/BaseHead.astro` | Breadcrumb label mapping for `myrrys` segment |
| `src/pages/content-page-theme.test.ts` | Vitest unit tests for theme class resolution |
| `tests/content-pages.spec.ts` | Playwright E2E tests for content pages |
| `tests/seo.spec.ts` | SEO sweep updated with `/myrrys` |

---

## Decision Log

### Single-segment route over catch-all

**Decision:** Use `[id].astro` instead of `[...id].astro`.

**Reasoning:**
1. All current site pages are single-segment paths (e.g., `/myrrys`).
2. Catch-all routes risk shadowing existing nested routes like `/letl/srd/*`.
3. YAGNI — if nested content pages are needed later, the route can be upgraded.

**Trade-offs:**
- Pro: Simpler, safer, no route conflicts.
- Con: Cannot serve nested paths like `/about/team` without a separate route.

### Source directory naming

**Decision:** Use `src/site-pages/` instead of `src/pages/` for content files.

**Reasoning:**
1. `src/pages/` is reserved by Astro for file-based routing.
2. `src/site-pages/` follows the existing pattern of content directories living at the `src/` level (e.g., `src/blog/`, `src/products/`).

**Trade-offs:**
- Pro: No conflict with Astro's routing conventions.
- Con: One more top-level directory in `src/`.
