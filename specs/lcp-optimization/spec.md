# Spec: LCP Resource Priority Optimization

## Blueprint (Design)

### Context

> **Goal:** Reduce Largest Contentful Paint (LCP) on the Finnish homepage by signalling browser resource priority for the LCP-critical rendering chain.
> **Why:** Lighthouse audit (2026-02-23) scores LCP at 3.8 s (score 0.54). The `lcp-discovery-insight` audit fails because `fetchpriority="high"` is not applied to the LCP resource chain.
> **Architectural Impact:** `BaseHead.astro` (resource hints in `<head>`) and `TopNav.astro` (header markup containing the LCP element).

### Architecture

The LCP element is `<header id="site-header">` — a text+image composite whose rendering is gated by the following critical chain:

```
Document (TTFB ~448 ms)
  → CSS (inline import, parsed ~1026 ms)
    → Background image (CSS url(), already preloaded)
    → Fonts (5 woff2 files, longest chain ~1422 ms)
  → Header text renders (element render delay ~485 ms)
```

**Current state of `BaseHead.astro`:**
- Background image `<link rel="preload">` exists for both mobile (`max-width: 640px`) and desktop (`min-width: 641px`) — but lacks `fetchpriority="high"`.
- No font preload hints exist; fonts are discovered only after CSS is parsed.

**Current state of `TopNav.astro`:**
- Logo `<img>` has no `fetchpriority` attribute.

**Changes required:**
1. Add `fetchpriority="high"` to the existing background image `<link rel="preload">` tags in `BaseHead.astro`.
2. Add `fetchpriority="high"` to the logo `<img>` in `TopNav.astro`.
3. Add `<link rel="preload" as="font">` for the most critical font (Oswald 400 — used for headings in the header region) to shorten the font discovery chain.

### Anti-Patterns

<rules>
<rule id="no-blanket-high-priority">
NEVER apply fetchpriority="high" to more than one image per viewport breakpoint. Over-hinting dilutes the signal and can degrade performance.
</rule>
<rule id="no-preload-all-fonts">
NEVER preload all 5 font files. Preloading too many fonts contends for bandwidth with other critical resources. Preload at most 1–2 fonts that gate the LCP text rendering.
</rule>
<rule id="no-lazy-load-lcp">
NEVER add loading="lazy" to any resource within the LCP element.
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] `fetchpriority="high"` is present on both background image `<link rel="preload">` tags in `BaseHead.astro`
- [ ] `fetchpriority="high"` is present on the logo `<img>` in `TopNav.astro`
- [ ] At least 1 critical font has a `<link rel="preload" as="font">` with `crossorigin` attribute in `BaseHead.astro`
- [ ] `EnTopNav.astro` is NOT changed (English layout has a different, smaller header that is not the LCP bottleneck)
- [ ] Lighthouse `lcp-discovery-insight` audit `priorityHinted` check passes
- [ ] LCP metric improves (target: below 2.5 s)
- [ ] No regressions: CLS remains 0, TBT remains 0 ms
- [ ] Spec scenarios functionally verified through Playwright E2E tests (`tests/`)

### Regression Guardrails

<invariants>
<invariant id="cls-zero">
CLS must remain 0 after changes to resource loading priority.
Adding fetchpriority or preload hints must not cause layout shift.
</invariant>
<invariant id="en-layout-unchanged">
The English layout (EnPage.astro / EnTopNav.astro) must not be affected.
Changes are scoped to the Finnish homepage LCP chain.
</invariant>
<invariant id="preload-media-queries-preserved">
The mobile/desktop media query split on the background image preload links must be preserved. Both breakpoints must retain their respective image URLs.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: LCP Resource Priority Optimization

  Scenario: Background image preloads have fetchpriority="high"
    Given the built HTML of the Finnish homepage
    When the <head> section is inspected
    Then there is a <link rel="preload" as="image"> for the mobile
         background with fetchpriority="high" and media="(max-width: 640px)"
    And there is a <link rel="preload" as="image"> for the desktop
         background with fetchpriority="high" and media="(min-width: 641px)"

  Scenario: Logo image has fetchpriority="high"
    Given the built HTML of the Finnish homepage
    When the <header id="site-header"> is inspected
    Then the logo <img> element has fetchpriority="high"

  Scenario: Critical font is preloaded
    Given the built HTML of the Finnish homepage
    When the <head> section is inspected
    Then there is a <link rel="preload" as="font" type="font/woff2">
         with a crossorigin attribute for a critical header font

  Scenario: English layout is unaffected
    Given the built HTML of an English page (e.g. /en/)
    When the <header id="site-header"> is inspected
    Then the logo <img> does NOT have fetchpriority="high"
    And no additional font preload links are present compared to before
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/components/base/BaseHead.astro` | Add `fetchpriority="high"` to existing background image preload `<link>` tags; add font preload `<link>` |
| `src/components/base/TopNav.astro` | Add `fetchpriority="high"` to logo `<img>` |
| `tests/lcp-optimization.spec.ts` | Playwright E2E tests verifying the Gherkin scenarios |

---

## Decision Log

### Scope: Finnish homepage only

**Decision:** Apply fetchpriority and font preload changes only to the Finnish layout (`Page.astro` → `TopNav.astro`), not the English layout.

**Reasoning:**
1. Lighthouse audit was run against `https://myrrys.com` (Finnish homepage)
2. `EnTopNav.astro` has a minimal 64px header with no background image — it is not the LCP bottleneck
3. Avoids unintended side effects on a layout with different characteristics

**Trade-offs:**
- English pages won't benefit from font preloading (acceptable — they have a much simpler above-the-fold)

### Font preload: Oswald 400 only

**Decision:** Preload only `oswald-v53-latin-regular.woff2` (12 KB).

**Reasoning:**
1. Oswald is the heading font used in the header nav region
2. It is the first font needed for LCP text rendering
3. Preloading all 5 fonts (79 KB) would contend for bandwidth and is an anti-pattern

**Trade-offs:**
- Open Sans variants won't be preloaded (acceptable — body text is not part of the LCP element)
- If Oswald 200 (light weight) is used in the header instead, the preloaded variant must be adjusted — verify during implementation
