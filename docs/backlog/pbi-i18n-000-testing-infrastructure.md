# PBI-I18N-000: Testing Infrastructure Setup

**Date:** 2026-01-03  
**Status:** 📋 READY  
**Priority:** Critical (Blocker)  
**Effort:** 2 Story Points (2-3 hours)  
**Spec:** [specs/i18n/spec.md](../../specs/i18n/spec.md)

## Overview

Set up Vitest and Playwright testing infrastructure to enable test-driven development for i18n implementation and future features.

## Business Value

- **Quality Assurance**: Automated testing prevents regressions
- **Developer Confidence**: Tests validate changes work correctly
- **Documentation**: Tests serve as living examples
- **Velocity**: Faster iteration with automated validation

## Current State

- No testing framework installed
- No test scripts in `package.json`
- No test files or configuration
- Manual testing only

## Blocks

This PBI **blocks** the following:
- PBI-I18N-001 (needs Vitest)
- PBI-I18N-002 (needs Vitest + Playwright)
- PBI-I18N-003 (needs Vitest + Playwright)
- PBI-I18N-004 (needs Playwright)

## Requirements

### Functional

1. Install and configure Vitest for unit/component tests
2. Install and configure Playwright for E2E tests
3. Add test scripts to `package.json`
4. Create example test files to validate setup
5. Document testing approach in design system

### Non-Functional

- **Performance**: Tests should run quickly (<30s for unit, <2m for E2E)
- **Developer Experience**: Simple commands (`pnpm test`)
- **CI-Ready**: Configuration supports CI/CD pipelines
- **Maintainability**: Clear structure for organizing tests

## Implementation Tasks

### Task 1: Install Vitest

```bash
pnpm add -D vitest @vitest/ui
```

**File:** `vitest.config.ts` (new)

```typescript
import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: "node",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  })
);
```

### Task 2: Install Playwright

```bash
pnpm add -D @playwright/test
npx playwright install
```

**File:** `playwright.config.ts` (new)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },

  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
```

### Task 3: Update package.json Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "biome check --write",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Task 4: Create Test Directory Structure

```bash
mkdir -p tests
mkdir -p src/__tests__
```

**Structure:**
```
myrrys-2025/
├── tests/               # E2E tests (Playwright)
│   ├── example.spec.ts
│   └── smoke.spec.ts
├── src/
│   ├── __tests__/       # Unit tests (Vitest)
│   │   └── example.test.ts
│   └── ...
├── vitest.config.ts
└── playwright.config.ts
```

### Task 5: Create Example Unit Test

**File:** `src/__tests__/example.test.ts` (new)

```typescript
import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should pass basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle strings", () => {
    const greeting = "Hello, MYRRYS";
    expect(greeting).toContain("MYRRYS");
  });

  it("should work with arrays", () => {
    const items = ["blog", "products", "lnlsrd"];
    expect(items).toHaveLength(3);
    expect(items).toContain("blog");
  });
});
```

### Task 6: Create Example E2E Test

**File:** `tests/smoke.spec.ts` (new)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    
    // Check that page loaded
    await expect(page).toHaveTitle(/MYRRYS/);
    
    // Check that main navigation exists
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    
    // Check that logo is present
    const logo = page.locator('img[alt="MYRRYS"]');
    await expect(logo).toBeVisible();
  });

  test("blog page loads successfully", async ({ page }) => {
    await page.goto("/blog");
    
    // Check heading
    await expect(page.locator("h1")).toBeVisible();
    
    // Check that there's content
    const articles = page.locator("article");
    await expect(articles.first()).toBeVisible();
  });

  test("404 page works", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("build artifacts are valid", async ({ page }) => {
    // Check that CSS loads
    await page.goto("/");
    const styles = await page.evaluate(() => {
      const el = document.querySelector("body");
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(styles).toBeTruthy();
  });
});
```

### Task 7: Create .gitignore Entries

**File:** `.gitignore` (append)

```gitignore
# Testing
coverage/
.nyc_output/
playwright-report/
test-results/
```

### Task 8: Create Design System Documentation

**File:** `src/pages/ds/testing.astro` (new)

```astro
---
import Page from "@layouts/Page.astro";
---

<Page title="Testing - Design System">
  <main class="content-grid">
    <section>
      <h1>Testing Infrastructure</h1>
      
      <p>MYRRYS uses Vitest for unit/component tests and Playwright for E2E tests.</p>

      <h2>Unit Tests (Vitest)</h2>
      
      <p>Fast, isolated tests for functions, utilities, and components.</p>

      <h3>Running Unit Tests</h3>
      <pre><code># Run all tests
pnpm test

# Watch mode
pnpm test -- --watch

# UI mode
pnpm test:ui

# Coverage report
pnpm test:coverage</code></pre>

      <h3>Writing Unit Tests</h3>
      <pre><code>// src/__tests__/example.test.ts
import { describe, it, expect } from "vitest";

describe("My Feature", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});</code></pre>

      <h3>Testing Astro Components</h3>
      <pre><code>import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect, beforeAll } from "vitest";
import MyComponent from "../components/MyComponent.astro";

describe("MyComponent", () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders correctly", async () => {
    const result = await container.renderToString(MyComponent, {
      props: { title: "Test" }
    });
    expect(result).toContain("Test");
  });
});</code></pre>

      <h2>E2E Tests (Playwright)</h2>
      
      <p>Full browser tests for user flows and integration testing.</p>

      <h3>Running E2E Tests</h3>
      <pre><code># Build first
pnpm build

# Run all E2E tests
pnpm test:e2e

# UI mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# Specific browser
pnpm test:e2e -- --project=chromium</code></pre>

      <h3>Writing E2E Tests</h3>
      <pre><code>// tests/example.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("user can do something", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("h1")).toBeVisible();
    
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL(/\/blog/);
  });
});</code></pre>

      <h2>Test Organization</h2>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Location</th>
            <th>Tool</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Unit tests</td>
            <td><code>src/__tests__/</code></td>
            <td>Vitest</td>
          </tr>
          <tr>
            <td>Component tests</td>
            <td><code>src/components/**/*.test.ts</code></td>
            <td>Vitest</td>
          </tr>
          <tr>
            <td>E2E tests</td>
            <td><code>tests/</code></td>
            <td>Playwright</td>
          </tr>
        </tbody>
      </table>

      <h2>Best Practices</h2>

      <ul>
        <li>Write tests alongside features (TDD when possible)</li>
        <li>Keep unit tests fast (no I/O, no network)</li>
        <li>Use E2E tests for critical user flows</li>
        <li>Run tests before committing</li>
        <li>Maintain test coverage >80% for critical code</li>
      </ul>

      <h2>CI/CD Integration</h2>

      <p>Tests are designed to run in CI environments:</p>

      <pre><code># CI workflow example
- pnpm install
- pnpm check        # Biome
- pnpm test         # Vitest
- pnpm build        # Astro
- pnpm test:e2e     # Playwright</code></pre>

      <h2>Debugging</h2>

      <h3>Vitest</h3>
      <ul>
        <li>Use <code>--ui</code> flag for visual debugging</li>
        <li>Add <code>console.log</code> in tests</li>
        <li>Use VS Code Vitest extension</li>
      </ul>

      <h3>Playwright</h3>
      <ul>
        <li>Use <code>--debug</code> flag to step through tests</li>
        <li>Use <code>--ui</code> for interactive mode</li>
        <li>Check <code>playwright-report/</code> for failures</li>
        <li>Use <code>await page.pause()</code> to pause execution</li>
      </ul>
    </section>
  </main>
</Page>

<style>
pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: var(--grid);
  overflow-x: auto;
  border-radius: 4px;
  margin-bottom: var(--grid);
}

code {
  font-family: 'Courier New', monospace;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--grid) 0;
}

th, td {
  text-align: left;
  padding: calc(0.5 * var(--grid));
  border-bottom: 1px solid var(--color-primary);
}

ul {
  line-height: calc(2 * var(--grid));
}
</style>
```

### Task 9: Verify Installation

**Create verification script:** `scripts/verify-tests.sh` (new)

```bash
#!/bin/bash
set -e

echo "🧪 Verifying test infrastructure..."

# Check Vitest
echo "Checking Vitest..."
pnpm test --run src/__tests__/example.test.ts

# Build for E2E
echo "Building for E2E tests..."
pnpm build

# Check Playwright (smoke tests only)
echo "Checking Playwright..."
pnpm test:e2e tests/smoke.spec.ts

echo "✅ All test infrastructure verified!"
```

Make executable:
```bash
chmod +x scripts/verify-tests.sh
```

## Acceptance Criteria

### Installation
- [ ] Vitest installed and in `package.json`
- [ ] Playwright installed and in `package.json`
- [ ] `vitest.config.ts` created and valid
- [ ] `playwright.config.ts` created and valid
- [ ] Browser binaries installed (`npx playwright install`)

### Configuration
- [ ] Test scripts added to `package.json`
- [ ] Test directories created (`tests/`, `src/__tests__/`)
- [ ] `.gitignore` updated with test artifacts

### Example Tests
- [ ] Example unit test created and passes
- [ ] Example E2E test created and passes
- [ ] Smoke tests verify core functionality

### Documentation
- [ ] `/ds/testing` page created
- [ ] Running tests documented
- [ ] Writing tests documented
- [ ] Best practices listed

### Validation
- [ ] `pnpm test` runs successfully
- [ ] `pnpm test:e2e` runs successfully (after build)
- [ ] No errors in test output
- [ ] Tests pass on clean install

## Testing Strategy

### Manual Verification

```bash
# 1. Install dependencies
pnpm install

# 2. Run unit tests
pnpm test

# 3. Build site
pnpm build

# 4. Run E2E tests
pnpm test:e2e

# 5. Check UI modes work
pnpm test:ui
pnpm test:e2e:ui
```

### CI Readiness Test

```bash
# Simulate CI environment
rm -rf node_modules dist
pnpm install
pnpm check
pnpm test
pnpm build
pnpm test:e2e
```

## Dependencies

**New Dependencies:**

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@vitest/ui": "^1.0.0",
    "vitest": "^1.0.0"
  }
}
```

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Playwright browser install fails | High | Document manual install, provide fallback |
| Tests slow in CI | Medium | Configure parallel execution |
| Flaky E2E tests | Medium | Use Playwright best practices, retries |
| Version conflicts | Low | Use latest stable versions |

## Success Metrics

- ✅ All commands work (`test`, `test:ui`, `test:e2e`)
- ✅ Example tests pass
- ✅ Documentation complete
- ✅ Ready for i18n PBIs

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Example tests passing
- [ ] Documentation created
- [ ] Verification script passes
- [ ] Code reviewed
- [ ] Merged to dev branch

## References

- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- Astro Testing: https://docs.astro.build/en/guides/testing/

## Notes

### Why Both Vitest and Playwright?

- **Vitest**: Fast unit tests for logic, utilities, components
- **Playwright**: Real browser tests for user flows, integration

### Configuration Choices

- **Vitest**: Uses Astro's Vite config for compatibility
- **Playwright**: Separate webServer for E2E isolation
- **Coverage**: V8 provider for speed and accuracy

### Future Enhancements

- Add visual regression testing (Playwright screenshots)
- Add performance testing (Lighthouse CI)
- Add accessibility testing (axe-core)
- Add component visual testing (Storybook)
