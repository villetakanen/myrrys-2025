# PBI-I18N-003: UI Strings Extraction and Localization

**Date:** 2026-01-03  
**Status:** 📋 READY  
**Priority:** Medium  
**Effort:** 1 Story Point (1-2 hours)  
**Spec:** [specs/i18n/spec.md](../../specs/i18n/spec.md)  
**Depends On:** PBI-I18N-001, PBI-I18N-002

## Overview

Extract hardcoded UI strings into a centralized, type-safe localization module to support Finnish and English markets with minimal code duplication.

## Business Value

- **Consistency**: UI text standardized across all components
- **Maintainability**: Single source of truth for UI strings
- **Type Safety**: TypeScript prevents typos and missing translations
- **Extensibility**: Easy to add Swedish or other languages later

## Current State

UI strings are hardcoded throughout components:

```astro
<!-- src/components/home/MiscBlock.astro -->
<h2>Uusimmat artikkelit</h2>

<!-- src/components/base/SiteFooter.astro -->
<a href="/">Takaisin etusivulle</a>

<!-- src/components/en/EnSiteFooter.astro -->
<a href="/en/">Back to home</a>
```

**Issues:**
- Duplicated strings in FI/EN components
- No centralized management
- Prone to inconsistency
- Harder to add new languages

## Requirements

### Functional

1. Create centralized strings module with FI/EN translations
2. Export type-safe string access functions
3. Support locale parameter (`"fi"` | `"en"`)
4. Cover essential UI strings (not content)
5. Provide fallback to Finnish if key missing

### Non-Functional

- **Type Safety**: TypeScript autocomplete for all string keys
- **Performance**: Zero runtime overhead (compile-time only)
- **Maintainability**: Easy to add new strings
- **Testability**: Strings testable in isolation

## Implementation Tasks

### Task 1: Create Strings Module

**File:** `src/i18n/strings.ts` (new)

```typescript
export type Locale = "fi" | "en";

export interface UIStrings {
  // Navigation
  backToHome: string;
  menu: string;
  
  // Blog
  latestPosts: string;
  readMore: string;
  postedOn: string;
  
  // Products
  latestProducts: string;
  viewProduct: string;
  
  // Common
  loading: string;
  error: string;
  notFound: string;
  
  // Footer
  contact: string;
  socialMedia: string;
}

export const strings: Record<Locale, UIStrings> = {
  fi: {
    // Navigation
    backToHome: "Takaisin etusivulle",
    menu: "Valikko",
    
    // Blog
    latestPosts: "Uusimmat artikkelit",
    readMore: "Lue lisää",
    postedOn: "Julkaistu",
    
    // Products
    latestProducts: "Uusimmat tuotteet",
    viewProduct: "Katso tuote",
    
    // Common
    loading: "Ladataan...",
    error: "Virhe",
    notFound: "Ei löytynyt",
    
    // Footer
    contact: "Ota yhteyttä",
    socialMedia: "Sosiaalinen media",
  },
  en: {
    // Navigation
    backToHome: "Back to home",
    menu: "Menu",
    
    // Blog
    latestPosts: "Latest posts",
    readMore: "Read more",
    postedOn: "Posted on",
    
    // Products
    latestProducts: "Latest products",
    viewProduct: "View product",
    
    // Common
    loading: "Loading...",
    error: "Error",
    notFound: "Not found",
    
    // Footer
    contact: "Contact",
    socialMedia: "Social media",
  },
};

/**
 * Get UI strings for a locale
 */
export function getStrings(locale: Locale = "fi"): UIStrings {
  return strings[locale];
}

/**
 * Get a specific string for a locale
 */
export function t(key: keyof UIStrings, locale: Locale = "fi"): string {
  return strings[locale][key] || strings.fi[key]; // Fallback to Finnish
}
```

### Task 2: Update BaseHead Component

**File:** `src/components/base/BaseHead.astro`

Add locale prop:

```astro
---
import "src/styles/styles.css";
import { ClientRouter } from "astro:transitions";

interface Props {
  title: string;
  description?: string;
  image?: string;
  locale?: "fi" | "en";
}

const {
  title,
  description = "MYRRYS – Roolipelejä pelaajilta pelaajille...",
  image = "/branding/griffon.png",
  locale = "fi",
} = Astro.props;

const canonicalUrl = new URL(Astro.url.pathname, Astro.site);
const url = canonicalUrl.href;
const imageURL = new URL(image, Astro.site);
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="generator" content={Astro.generator} />

<!-- Language -->
<html lang={locale} />

<!-- ... rest of meta tags ... -->
```

### Task 3: Update Page Layouts

**File:** `src/layouts/Page.astro`

```astro
---
import BaseHead from "@components/base/BaseHead.astro";
import SiteFooter from "@components/base/SiteFooter.astro";
import TopNav from "@components/base/TopNav.astro";

interface Props {
  title: string;
  description?: string;
  image?: string;
}

const { title, description, image } = Astro.props;
---

<html lang="fi">
  <head>
    <BaseHead 
      title={title} 
      description={description} 
      image={image}
      locale="fi"
    />
  </head>
  <body>
    <TopNav locale="fi" />
    <slot />
    <SiteFooter locale="fi" />
  </body>
</html>
```

**File:** `src/layouts/EnPage.astro`

```astro
---
import BaseHead from "@components/base/BaseHead.astro";
import SiteFooter from "@components/base/SiteFooter.astro";
import TopNav from "@components/base/TopNav.astro";

interface Props {
  title: string;
  description?: string;
  image?: string;
}

const { title, description, image } = Astro.props;
---

<html lang="en">
  <head>
    <BaseHead 
      title={title} 
      description={description} 
      image={image}
      locale="en"
    />
  </head>
  <body>
    <TopNav locale="en" />
    <slot />
    <SiteFooter locale="en" />
  </body>
</html>
```

### Task 4: Update Example Component (MiscBlock)

**File:** `src/components/home/MiscBlock.astro`

Before:
```astro
<h2>Uusimmat artikkelit</h2>
```

After:
```astro
---
import { getStrings } from "src/i18n/strings";

interface Props {
  locale?: "fi" | "en";
}

const { locale = "fi" } = Astro.props;
const t = getStrings(locale);
---

<h2>{t.latestPosts}</h2>
```

### Task 5: Add Unit Tests

**File:** `src/i18n/strings.test.ts` (new)

```typescript
import { describe, it, expect } from "vitest";
import { getStrings, t, type Locale } from "./strings";

describe("i18n strings module", () => {
  describe("getStrings", () => {
    it("returns Finnish strings by default", () => {
      const strings = getStrings();
      expect(strings.latestPosts).toBe("Uusimmat artikkelit");
    });

    it("returns Finnish strings when locale is 'fi'", () => {
      const strings = getStrings("fi");
      expect(strings.backToHome).toBe("Takaisin etusivulle");
    });

    it("returns English strings when locale is 'en'", () => {
      const strings = getStrings("en");
      expect(strings.latestPosts).toBe("Latest posts");
      expect(strings.backToHome).toBe("Back to home");
    });
  });

  describe("t function", () => {
    it("returns Finnish string by default", () => {
      expect(t("readMore")).toBe("Lue lisää");
    });

    it("returns Finnish string when locale is 'fi'", () => {
      expect(t("readMore", "fi")).toBe("Lue lisää");
    });

    it("returns English string when locale is 'en'", () => {
      expect(t("readMore", "en")).toBe("Read more");
    });

    it("falls back to Finnish if key missing", () => {
      // This would only happen if types are bypassed
      // but good to test the runtime behavior
      const result = t("latestPosts" as any, "en");
      expect(result).toBe("Latest posts");
    });
  });

  describe("Type safety", () => {
    it("has all required keys in both locales", () => {
      const fi = getStrings("fi");
      const en = getStrings("en");
      
      const fiKeys = Object.keys(fi).sort();
      const enKeys = Object.keys(en).sort();
      
      expect(fiKeys).toEqual(enKeys);
    });

    it("all strings are non-empty", () => {
      const locales: Locale[] = ["fi", "en"];
      
      for (const locale of locales) {
        const strings = getStrings(locale);
        for (const [key, value] of Object.entries(strings)) {
          expect(value.length, `${locale}.${key} should not be empty`).toBeGreaterThan(0);
        }
      }
    });
  });
});
```

### Task 6: Add E2E Test

**File:** `tests/i18n.spec.ts` (new)

```typescript
import { test, expect } from "@playwright/test";

test.describe("UI String Localization", () => {
  test("Finnish pages use Finnish strings", async ({ page }) => {
    await page.goto("/");
    
    // Check for Finnish UI strings
    await expect(page.getByText("Uusimmat artikkelit")).toBeVisible();
  });

  test("English pages use English strings", async ({ page }) => {
    await page.goto("/en/");
    
    // Check for English UI strings
    await expect(page.getByText("Latest posts")).toBeVisible();
  });

  test("Footer uses correct locale", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByText("Takaisin etusivulle")).toBeVisible();
    
    await page.goto("/en/");
    await expect(footer.getByText("Back to home")).toBeVisible();
  });
});
```

### Task 7: Update Design System Documentation

**File:** `src/pages/ds/i18n.astro` (append)

```astro
<h2>UI Strings Module</h2>

<p>Centralized, type-safe UI string localization for Finnish and English markets.</p>

<h3>Module Location</h3>
<p><code>src/i18n/strings.ts</code></p>

<h3>Usage in Components</h3>

<pre><code>---
import { getStrings } from "src/i18n/strings";

interface Props {
  locale?: "fi" | "en";
}

const { locale = "fi" } = Astro.props;
const t = getStrings(locale);
---

&lt;h2&gt;{t.latestPosts}&lt;/h2&gt;
&lt;a href="/"&gt;{t.backToHome}&lt;/a&gt;
</code></pre>

<h3>Available Strings</h3>

<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Finnish</th>
      <th>English</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>backToHome</code></td>
      <td>Takaisin etusivulle</td>
      <td>Back to home</td>
    </tr>
    <tr>
      <td><code>latestPosts</code></td>
      <td>Uusimmat artikkelit</td>
      <td>Latest posts</td>
    </tr>
    <tr>
      <td><code>readMore</code></td>
      <td>Lue lisää</td>
      <td>Read more</td>
    </tr>
    <tr>
      <td><code>viewProduct</code></td>
      <td>Katso tuote</td>
      <td>View product</td>
    </tr>
  </tbody>
</table>

<h3>Adding New Strings</h3>

<ol>
  <li>Add key to <code>UIStrings</code> interface</li>
  <li>Add translations to both <code>fi</code> and <code>en</code> objects</li>
  <li>TypeScript will enforce completeness</li>
</ol>

<pre><code>// src/i18n/strings.ts
export interface UIStrings {
  // ... existing keys
  newKey: string;
}

export const strings: Record&lt;Locale, UIStrings&gt; = {
  fi: {
    // ... existing strings
    newKey: "Uusi teksti",
  },
  en: {
    // ... existing strings
    newKey: "New text",
  },
};
</code></pre>

<h3>Best Practices</h3>

<ul>
  <li>Always pass <code>locale</code> prop through layouts to components</li>
  <li>Use <code>getStrings(locale)</code> for multiple keys</li>
  <li>Use <code>t(key, locale)</code> for single key lookups</li>
  <li>Add new strings immediately when identified</li>
  <li>Keep strings alphabetized within categories</li>
</ul>
```

## Acceptance Criteria

### Strings Module
- [ ] `src/i18n/strings.ts` created
- [ ] `UIStrings` interface defines all keys
- [ ] Both `fi` and `en` objects have all translations
- [ ] `getStrings()` function works
- [ ] `t()` function works
- [ ] Fallback to Finnish implemented

### Type Safety
- [ ] TypeScript enforces complete translations
- [ ] Autocomplete works for string keys
- [ ] Type errors if locale invalid
- [ ] No `any` types

### Testing
- [ ] Vitest unit tests pass
- [ ] All string keys tested
- [ ] Fallback behavior tested
- [ ] E2E tests verify rendered output

### Documentation
- [ ] Module documented in `/ds/i18n`
- [ ] Usage examples provided
- [ ] Table of available strings
- [ ] Best practices listed

### Integration
- [ ] At least one component refactored (MiscBlock)
- [ ] Layouts pass locale to components
- [ ] Build succeeds
- [ ] No hardcoded strings in refactored components

## Testing Strategy

### Test Execution

```bash
# Unit tests
pnpm test src/i18n/strings.test.ts

# E2E tests
pnpm build
pnpm preview &
pnpm test:e2e tests/i18n.spec.ts
```

## Dependencies

**Depends On:**
- PBI-I18N-001 (Collections exist)
- PBI-I18N-002 (Component patterns established)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing translations | Medium | TypeScript enforces completeness |
| String key typos | Low | TypeScript autocomplete |
| Inconsistent naming | Low | Clear naming convention |
| Scope creep | Medium | Only UI strings, not content |

## Success Metrics

- ✅ Zero hardcoded UI strings in refactored components
- ✅ 100% type coverage
- ✅ All tests pass
- ✅ Easy to add new strings

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Vitest tests passing
- [ ] Playwright E2E tests passing
- [ ] Design system documentation updated
- [ ] At least one component refactored
- [ ] Code reviewed
- [ ] Merged to dev branch

## References

- Spec: [specs/i18n/spec.md](../../specs/i18n/spec.md)
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

## Notes

- Start with essential strings only
- Add more strings as components are refactored
- This is NOT for translating content (blog posts, products)
- Only for UI chrome (buttons, labels, navigation)
- Swedish can be added later with minimal changes
