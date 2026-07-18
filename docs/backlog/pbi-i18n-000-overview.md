# i18n Implementation - PBI Overview

**Date:** 2026-01-03  
**Spec:** [specs/i18n/spec.md](../../specs/i18n/spec.md)

## Summary

Implementation of market-based internationalization system for MYRRYS, supporting Finnish and International (English) markets with independent content catalogs.

## Key Architecture Decisions

- **Market-based, not translation-based**: Different products per market
- **Separate collections**: `blog` + `blog-en`, `products` + `products-en`
- **Component reuse**: Props-based collection selection
- **No Astro i18n**: Custom implementation for market segmentation

## Product Backlog Items

| PBI | Title | Effort | Priority | Status | Dependencies |
|-----|-------|--------|----------|--------|--------------|
| [PBI-I18N-000](./pbi-i18n-000-testing-infrastructure.md) | **Testing Infrastructure Setup** | 2 SP | **Critical** | 📋 READY | - |
| [PBI-I18N-001](./pbi-i18n-001-english-collections.md) | English Content Collections | 2 SP | High | 📋 READY | **PBI-I18N-000** |
| [PBI-I18N-002](./pbi-i18n-002-blogindex-refactor.md) | Refactor BlogIndex Component | 2 SP | High | 📋 READY | **PBI-I18N-000**, 001 |
| [PBI-I18N-003](./pbi-i18n-003-ui-strings.md) | UI Strings Extraction | 1 SP | Medium | 📋 READY | **PBI-I18N-000**, 001, 002 |
| [PBI-I18N-004](./pbi-i18n-004-english-routes.md) | English Market Routes | 3 SP | High | 📋 READY | **PBI-I18N-000**, 001, 002, 003 |

**Total Effort:** 10 Story Points (~10-14 hours)

⚠️ **Critical Path**: PBI-I18N-000 must be completed first - it blocks all other PBIs.

## Implementation Sequence

### Sprint 0: Testing Infrastructure (2 SP, ~2-3 hours) **[BLOCKER]**

**PBI-I18N-000**: Testing Infrastructure Setup
- Install Vitest and Playwright
- Configure test runners
- Create example tests
- Document testing approach
- **Deliverable**: Working test infrastructure

**⚠️ This MUST be completed before starting any other i18n PBI**

### Sprint 1: Foundation (4 SP, ~4-6 hours)

1. **PBI-I18N-001**: English Content Collections
   - Creates `blog-en` and `products-en` collections
   - Adds type tests with Vitest
   - Creates `/ds/i18n` documentation page
   - **Deliverable**: Type-safe English collections

2. **PBI-I18N-002**: Refactor BlogIndex Component
   - Adds `collection` and `urlPrefix` props
   - Makes component reusable across markets
   - Adds component tests (Vitest) and E2E tests (Playwright)
   - **Deliverable**: Single component serves both markets

### Sprint 2: Integration (4 SP, ~4-6 hours)

3. **PBI-I18N-003**: UI Strings Extraction
   - Creates `src/i18n/strings.ts` module
   - Extracts hardcoded UI text
   - Type-safe localization
   - Unit and E2E tests
   - **Deliverable**: Centralized UI strings

4. **PBI-I18N-004**: English Market Routes
   - Creates `/en/*` routes
   - Full English market implementation
   - Comprehensive E2E validation
   - SEO compliance
   - **Deliverable**: Working English market

## Testing Strategy

### Unit Tests (Vitest)
- Content collection type safety
- Strings module functionality
- Component props validation

### Component Tests (Vitest + Astro Container)
- BlogIndex with different collections
- Prop combinations
- Filtering and sorting logic

### E2E Tests (Playwright)
- English routes render correctly
- Navigation works
- SEO tags correct
- Language switching (if applicable)

### Manual Testing
- Build succeeds
- Both markets functional
- No regressions in Finnish site

## Success Metrics

| Metric | Target | Validation |
|--------|--------|------------|
| **Type Safety** | 100% | TypeScript compilation |
| **Test Coverage** | All critical paths | Vitest + Playwright |
| **Code Reuse** | Single BlogIndex | No EN duplicate |
| **SEO Compliance** | All meta tags | E2E tests |
| **Build Time** | No regression | Monitor metrics |

## Design System Documentation

PBIs 001-004 add documentation to `/ds/i18n`:

1. **PBI-001**: `/ds/i18n` - Content collections overview
2. **PBI-002**: `/ds/i18n` - Component usage examples
3. **PBI-003**: `/ds/i18n` - UI strings module
4. **PBI-004**: `/ds/i18n` - Complete page examples + checklist

**Final Output**: Comprehensive i18n developer guide

**Note**: PBI-000 (testing infrastructure) does not add `/ds/` documentation. Testing is documented through example test files and configuration.

## Technical Dependencies

### New Dependencies (PBI-I18N-000)

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Updated Scripts (PBI-I18N-000)

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Files Created/Modified

### Infrastructure (PBI-000)

**Config:**
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration

**Tests:**
- `src/__tests__/example.test.ts` - Example unit test
- `tests/smoke.spec.ts` - Example E2E test

### Content (PBI-001-004)

**Content:**
- `src/blog-en/` - English blog posts
- `src/products-en/` - International products

**Code:**
- `src/i18n/strings.ts` - UI strings module
- `src/pages/en/index.astro` - English homepage
- `src/pages/en/blog/index.astro` - English blog index
- `src/pages/en/blog/[id].astro` - English blog posts
- `src/pages/en/the-quick/index.astro` - Product page

**Tests:**
- `src/content.config.test.ts` - Collection tests
- `src/i18n/strings.test.ts` - Strings tests
- `src/components/blog/BlogIndex.test.ts` - Component tests
- `tests/blog-index.spec.ts` - BlogIndex E2E
- `tests/english-routes.spec.ts` - Routes E2E
- `tests/i18n.spec.ts` - i18n E2E
- `tests/seo.spec.ts` - SEO validation

**Documentation:**
- `src/pages/ds/i18n.astro` - i18n design system docs

### Modified Files

**Core:**
- `src/content.config.ts` - Add English collections
- `src/components/blog/BlogIndex.astro` - Add collection prop
- `src/layouts/EnPage.astro` - Add locale prop passing
- `src/components/base/BaseHead.astro` - Add locale prop

**Package:**
- `package.json` - Add test dependencies and scripts
- `.gitignore` - Add test artifacts

## Dependency Graph

```
PBI-I18N-000 (Testing Infrastructure) **[BLOCKER]**
    ↓
    ├── PBI-I18N-001 (English Collections)
    │       ↓
    ├── PBI-I18N-002 (BlogIndex Refactor)
    │       ↓
    ├── PBI-I18N-003 (UI Strings)
    │       ↓
    └── PBI-I18N-004 (English Routes)
```

## Risks & Mitigation

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Testing setup fails | **Critical** | PBI-I18N-000 validates setup | Dev |
| Breaking Finnish site | High | Backwards compatibility, E2E tests | Dev |
| Type errors | Medium | Strict TypeScript, tests | Dev |
| SEO misconfiguration | Medium | E2E SEO tests | Dev |
| Test flakiness | Low | Playwright best practices | Dev |
| Scope creep | Medium | Focus on spec only | PM |

## Definition of Done (Epic)

- [ ] **PBI-I18N-000 completed (REQUIRED FIRST)**
- [ ] All 5 PBIs completed
- [ ] All tests passing (unit + E2E)
- [ ] Both markets functional
- [ ] Design system docs complete
- [ ] No regressions in Finnish site
- [ ] Code reviewed
- [ ] Merged to dev branch
- [ ] Deployed to staging
- [ ] Stakeholder approval

## References

- **Spec**: [specs/i18n/spec.md](../../specs/i18n/spec.md)
- **Arch Review**: [docs/arch-review/](../arch-review/)
- **ASDLC Pattern**: https://asdlc.io/patterns/the-spec/

## Notes

### Why This Approach?

1. **Testing First**: PBI-000 ensures quality throughout
2. **Atomic PBIs**: Each delivers value independently
3. **Test-Driven**: Tests define success criteria
4. **Documented**: Design system integration throughout
5. **Reversible**: Each PBI can be reverted if needed
6. **Spec-Driven**: Implements exactly what spec requires

### Critical: Start with PBI-I18N-000

⚠️ **DO NOT start PBI-I18N-001, 002, 003, or 004 without completing PBI-I18N-000 first.**

All subsequent PBIs depend on having Vitest and Playwright installed and configured. Starting without the testing infrastructure will result in:
- Unable to run tests included in PBIs
- Manual testing only (error-prone)
- Rework required later

### Post-Implementation

After completing these PBIs:
- Refactor other components (ProductListing, etc.) using same pattern
- Add Swedish support if needed (same approach)
- Consider additional English content
- Monitor SEO performance per market

### Maintenance

- Update UI strings as new text identified
- Keep schemas in sync across FI/EN
- Add tests when adding new routes
- Document new patterns in `/ds/i18n`

## Lessons Learned (PBI-I18N-000 Implementation)

### 1. Vitest Configuration Requires E2E Test Exclusion

**Issue:** Vitest attempted to run Playwright tests, causing "test.describe is not a function" errors.

**Solution:** Add explicit exclusion in `vitest.config.ts`:
```typescript
exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"]
```

**Impact:** Updated PBI-I18N-000 documentation to include this in the example configuration.

### 2. HTML Entity Escaping in Astro Documentation Pages

**Issue:** Code examples with `{}`, `=>`, and `<>` characters in `.astro` files caused build failures because they were interpreted as JSX syntax.

**Solution:** Escape HTML entities in code examples:
- `{` → `&#123;`
- `}` → `&#125;`  
- `>` → `&gt;`

**Impact:** 
- Added warning to PBI-I18N-000 Task 8
- Applies to all future documentation pages with code examples (PBI-I18N-001 through 004)
- Consider alternative approaches: external code files, custom Code component with auto-escaping

### 3. Playwright Strict Mode Requires Specific Selectors

**Issue:** Generic selectors like `page.locator("nav")` or `page.locator("h1")` failed when multiple matching elements existed on the page.

**Solution:** Use more specific selectors:
- **Roles**: `page.getByRole("navigation", { name: "Main navigation" })`
- **Specific text**: `page.getByRole("heading", { name: "Blogi", level: 1 })`
- **First match**: `page.locator('selector').first()` when multiple is acceptable

**Impact:** Updated smoke test examples in PBI-I18N-000 to demonstrate best practices.

### 4. Test Performance Metrics

**Actual Results:**
- Unit tests: <1s (well under 30s target) ✅
- E2E tests: ~4s for 12 tests (well under 2m target) ✅
- Build time: ~1s (no regression) ✅

**Conclusion:** Performance requirements met and exceeded.

### 5. Testing Documentation Approach

**Decision:** Testing infrastructure is documented through example test files and configuration, not `/ds/` pages.

**Rationale:** 
- `/ds/` is for design system patterns (UI components, content strategies)
- Testing is development tooling, not a design pattern
- Example tests serve as documentation-by-example
- Configuration files are self-documenting

**Impact:** Removed `/ds/testing` from PBI-000 requirements. Future `/ds/i18n` pages will focus purely on i18n design patterns.

### Key Takeaways for PBI-I18N-001 through 004

1. ✅ Testing infrastructure is ready and validated
2. ⚠️ Remember to escape HTML entities in documentation code examples (if needed)
3. ✅ Use specific Playwright selectors (roles, names) for E2E tests
4. ✅ `/ds/` pages should focus on design patterns, not development tooling
5. ✅ No blockers identified for subsequent PBIs
