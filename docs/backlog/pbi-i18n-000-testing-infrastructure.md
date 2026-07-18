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
      exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  })
);
```

**⚠️ Important:** The `exclude` array prevents Vitest from trying to run Playwright tests (in `/tests` directory), which would cause errors.

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
    
    // Check that main navigation exists (use specific role)
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
    
    // Check that logo is present (use .first() if multiple logos exist)
    const logo = page.locator('img[alt="MYRRYS"]').first();
    await expect(logo).toBeVisible();
  });

  test("blog page loads successfully", async ({ page }) => {
    await page.goto("/blog");
    
    // Check heading (use specific role with name)
    await expect(page.getByRole("heading", { name: "Blogi", level: 1 })).toBeVisible();
    
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

### Task 8: Verify Installation

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
