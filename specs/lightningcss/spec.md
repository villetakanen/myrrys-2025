# Spec: CSS Browser Compatibility (Lightning CSS)

## Blueprint (Design)

### Context

> **Goal:** Ensure CSS is correctly transpiled and auto-prefixed for the project's supported browsers.
> **Why:** Currently, `lightningcss.targets` is empty in `astro.config.mjs`, meaning modern CSS features (like Nesting, which is enabled) aren't being polyfilled or prefixed for older browsers.
> **Architectural Impact:** Centralizes browser support policy and ensures CSS build artifacts are compatible with the target user base.

### Architecture

We will implement a standard `browserslist` configuration and bridge it to Lightning CSS within the Astro build pipeline.

**Approach:**
1. **Source of Truth**: Create a `.browserslistrc` file in the root directory.
2. **Translation**: Use the `browserslist-to-targets` utility to convert the browserslist query into the `Targets` object format required by Lightning CSS.
3. **Integration**: Update `astro.config.mjs` to dynamically load the targets during the Vitest/Astro build.

```javascript
// Prototypical bridge in astro.config.mjs
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

const targets = browserslistToTargets(browserslist('defaults'));

export default defineConfig({
  vite: {
    css: {
      lightningcss: {
        targets,
        // ...
      }
    }
  }
});
```

### Anti-Patterns

<rules>
<rule id="no-hardcoded-targets">
NEVER hardcode numeric browser versions directly in `astro.config.mjs`. Use the `.browserslistrc` file as the single source of truth.
</rule>
<rule id="no-empty-targets">
NEVER leave `lightningcss.targets` as an empty object `{}` once a support policy is established.
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] `.browserslistrc` exists in the root directory with a valid configuration (e.g., `defaults`).
- [ ] `astro.config.mjs` dynamically populates `lightningcss.targets` using the project's browserslist.
- [ ] CSS builds successfully and contains vendor prefixes or transpiled features (e.g., flattened nesting) when checked against a specific target.
- [ ] `pnpm check` passes without regression.

### Regression Guardrails

<invariants>
<invariant id="css-transforms-enabled">
Lightning CSS must be configured with a non-empty `targets` object to ensure transforms are applied during build.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: CSS Browser Compatibility

  Scenario: Production build applies transforms
    Given a `.browserslistrc` supporting older browsers (e.g. Chrome 80)
    And a source CSS file using modern Nesting
    When I run `pnpm build`
    Then the output CSS should contain flattened rules or standard nesting syntax compatible with the target.

  Scenario: Config validation
    Given the Astro configuration
    When the build starts
    Then `lightningcss.targets` should be an object containing bitmasks for the supported browsers.
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `.browserslistrc` | Global browser support policy. |
| `astro.config.mjs` | Configures Vite to use the support policy for CSS transpilation. |
| `package.json` | Addition of `browserslist-to-targets` if not already provided by `lightningcss` main entry. |

---

## Decision Log

### Using .browserslistrc vs package.json

**Decision:** Use a standalone `.browserslistrc` file.

**Reasoning:**
1. Higher visibility as a root-level constraint.
2. Easier for external tools (stylelint, biome etc.) to detect without parsing `package.json`.

### Dependency Choice

**Decision:** Rely on `lightningcss` provided helper if available, otherwise add `browserslist-to-targets`.

**Reasoning:**
1. `lightningcss` often exports `browserslistToTargets` directly in its Node API.
2. Minimizes extra dependency noise.
