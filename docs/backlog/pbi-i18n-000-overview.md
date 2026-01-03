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

Each PBI adds documentation to `/ds/`:

0. **PBI-000**: `/ds/testing` - Testing infrastructure guide
1. **PBI-001**: `/ds/i18n` - Content collections overview
2. **PBI-002**: `/ds/i18n` - Component usage examples
3. **PBI-003**: `/ds/i18n` - UI strings module
4. **PBI-004**: `/ds/i18n` - Complete page examples + checklist

**Final Output**: Comprehensive i18n developer guide

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

**Documentation:**
- `src/pages/ds/testing.astro` - Testing guide

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
