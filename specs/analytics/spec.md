# Spec: Analytics Tracking

## Blueprint (Design)

### Context

> **Goal:** Ensure all page views, including SPA navigations via Astro's `<ClientRouter />`, are accurately tracked without duplicate events or missing data.
> **Why:** We need privacy-first analytics to understand traffic without compromising user privacy.
> **Architectural Impact:** Relies on a single, global analytics script in `BaseHead.astro`.

### Architecture

The application uses SimpleAnalytics for privacy-first tracking.
Astro's `<ClientRouter />` replaces the default browser navigation with client-side routing, utilizing the browser's History API (`pushState` and `replaceState`).

**Approach:**
1. SimpleAnalytics natively supports History API changes (SPA navigation) out-of-the-box.
2. We include the base SimpleAnalytics script in `BaseHead.astro`.
3. No custom event listeners (like `astro:page-load`) are required for basic page view tracking, as SimpleAnalytics automatically detects the route changes triggered by `<ClientRouter />`.

```html
<!-- The only required implementation: -->
<script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
```

### Anti-Patterns

<rules>
<rule id="no-custom-spa-listeners">
NEVER add custom event listeners (e.g., `astro:page-load`) to manually trigger SimpleAnalytics page views for standard navigations. The out-of-the-box script already handles the History API, and adding custom listeners will result in duplicate page views.
</rule>
<rule id="no-blocking-analytics">
NEVER use synchronous analytics scripts. Always use `async` or `defer` to prevent render blocking.
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] `BaseHead.astro` includes the standard SimpleAnalytics script.
- [ ] No manual/custom SPA tracking listeners are present for basic pageviews.
- [ ] No Constitution-derived constraints from `CLAUDE.md` are violated.

### Regression Guardrails

<invariants>
<invariant id="analytics-script-present">
The SimpleAnalytics script must be present in the document `<head>` on all pages.
If violated, we lose analytics visibility.
</invariant>
<invariant id="analytics-async">
The analytics script must remain `async` to avoid performance degradation.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: Analytics Tracking

  Scenario: Initial page load
    Given the user navigates directly to the site
    Then the SimpleAnalytics script should load via `<script async ...>`
    And a single page view is recorded automatically

  Scenario: SPA Navigation
    Given the user is on the homepage
    When the user clicks a link to the Blog page
    Then Astro performs a client-side View Transition updating the History API
    And SimpleAnalytics automatically detects the `pushState` and records a new page view
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/components/base/BaseHead.astro` | Hosts the standard SimpleAnalytics script without custom lifecycle hooks. |

---

## Decision Log

### Avoiding Custom View Transition Hooks for Analytics

**Decision:** We will **not** implement custom Astro lifecycle hooks (`astro:page-load`) for basic SimpleAnalytics page view tracking.

**Reasoning:**
1. SimpleAnalytics' out-of-the-box script automatically hooks into the browser's History API (`pushState` / `replaceState`).
2. Astro's `<ClientRouter />` uses the standard History API under the hood for its SPA navigations.
3. Adding explicit calls to `sa_event` on `astro:page-load` would cause duplicated page views because the default script already registers the transition.

**Trade-offs:**
- **Pros:** Less code, adheres to vendor default integrations, avoids duplicate tracking.
- **Cons:** We are implicitly relying on the third-party script's internal History API monkey-patching rather than explicit framework hooks. However, SimpleAnalytics officially supports this model.
