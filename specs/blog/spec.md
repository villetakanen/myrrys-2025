# Spec: Blog

## Blueprint (Design)

### Context

> **Goal:** Render blog posts with appropriate thematic styling and correct responsive layouts.
> **Why:** Prevent invalid CSS class concatenation (e.g. `"undefined content-grid"`) dynamically generating malformed HTML when optional properties are omitted. We need a robust architecture to handle optional themes.
> **Architectural Impact:** `src/pages/blog/[id].astro` and all components handling optional class properties.

### Architecture

Blog posts are dynamically built from Markdown/MDX files. The `[id].astro` route maps each post and applies layout rules. Posts may define optional frontmatter properties such as `theme`.
To handle dynamic CSS classes effectively, especially when attributes might be `undefined` or falsy, we utilize Astro's native `class:list` directive rather than JavaScript string concatenation. This aligns cleanly with our mobile-first responsive design framework by ensuring correct semantic HTML.

### Anti-Patterns

<rules>
<rule id="manual-class-concatenation">
NEVER use string concatenation with the `class` attribute when dealing with potentially undefined frontmatter or component properties (e.g., `class={prop + " default" || "default"}`).
**Why:** If the property is `undefined`, the evaluated string evaluates to `"undefined default"`, which is truthy and generates invalid CSS classes instead of falling back.
**Instead:** Always use Astro's `class:list` directive: `class:list={[prop, "default"]}`, which filters out falsy values like `undefined`, `null`, and `false`.
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] Blog posts render correctly with default layout classes when no specific theme is provided.
- [ ] Blog posts apply thematic classes correctly when a valid theme is specified.
- [ ] No `"undefined"` strings are present in the DOM's `class` attribute on wrapper elements.
- [ ] Meets Constitution constraint: Mobile-first styling structure must not be broken by errant classes.
- [ ] Logic unit tested completely using `vitest` (no arbitrary DOM checks, pure script evaluation).
- [ ] Spec scenarios functionally verified through Playwright E2E tests (`tests/`).

### Regression Guardrails

<invariants>
<invariant id="valid-css-classes-only">
CSS classes on HTML elements must only contain valid design-system tokens or semantic class names.
If violated, the browser may apply unexpected styles or fail to apply intended responsive layouts, and "undefined" text may incorrectly appear in the DOM inspector, hiding the intended CSS declarations.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: Blog Post Theming

  Scenario: Post with defined theme
    Given a blog post with `theme: "dark-mode"` in its frontmatter
    When the post is rendered at `/blog/[id]`
    Then the `<main>` element should contain the classes `dark-mode` and `content-grid`

  Scenario: Post with missing theme
    Given a blog post with no `theme` defined in its frontmatter
    When the post is rendered at `/blog/[id]`
    Then the `<main>` element should contain the class `content-grid`
    And the `<main>` element should NOT contain the class `undefined`
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/pages/blog/[id].astro` | Renders the individual blog post layout. Must utilize `class:list` and avoid string concatenation. |

---

## Decision Log

### Adopt `class:list` Over Ternaries or Operator Concatenation

**Decision:** We mandate using Astro's `class:list` for defining complex and conditional CSS class combinations instead of manual JavaScript interpolations.

**Reasoning:**
1. It is Astro's native, built-in solution for this exact problem, producing smaller and cleaner component templates.
2. It intrinsically handles falsy values, guaranteeing that missing props don't leak `undefined` substrings into the user's DOM.

**Trade-offs:**
- Adds minimal framework-specific syntax to templates, but highly legible and reliable.
