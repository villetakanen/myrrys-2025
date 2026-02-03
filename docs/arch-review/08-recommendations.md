# Improvement Recommendations

This document outlines potential improvements and recommendations for the Myrrys 2025 architecture.

## Current Strengths

Before recommendations, it's worth noting what works well:

| Aspect | Strength |
|--------|----------|
| **Performance** | Static output, minimal JS, fast loads |
| **Type Safety** | TypeScript + Zod throughout |
| **Content Management** | Structured collections with validation |
| **SEO** | Pre-rendered HTML, meta tags, sitemap |
| **Maintainability** | Clear separation of concerns |
| **Scalability** | Git-versioned content, no database |

## Recommended Improvements

### 1. Internationalization (i18n)

**Current State:** Separate routes for Finnish (`/`) and English (`/en/`) with duplicate components.

**Recommendation:** Implement Astro's i18n routing.

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "fi",
    locales: ["fi", "en"],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
```

**Benefits:**
- Single component with translations
- URL localization (`/en/blog/` → `/blog/`)
- Language detection
- Fewer duplicate components

**Implementation Steps:**
1. Configure i18n in `astro.config.mjs`
2. Create translation files (JSON or TS)
3. Refactor duplicate EN components
4. Add language switcher

---

### 2. Testing Strategy

**Current State:** No automated tests.

**Recommendation:** Add test coverage for critical paths.

**Suggested Stack:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/dom": "^9.0.0",
    "playwright": "^1.40.0"
  }
}
```

**Test Types:**

| Type | Tool | Coverage |
|------|------|----------|
| Unit tests | Vitest | Remark/Rehype plugins |
| Component tests | Vitest + Testing Library | Component rendering |
| E2E tests | Playwright | Critical user flows |
| Visual regression | Playwright | Layout consistency |

**Priority Tests:**
1. `remarkSrdLinks` plugin transformations
2. Content collection schema validation
3. Blog filtering and sorting
4. SRD link generation
5. RSS feed output

---

### 3. Component Documentation

**Current State:** No component documentation or design system.

**Recommendation:** Implement component documentation.

**Options:**

| Tool | Pros | Cons |
|------|------|------|
| **Storybook** | Industry standard, rich ecosystem | Heavy setup |
| **Histoire** | Vue/Svelte focused, lighter | Less Astro support |
| **Custom /ds route** | Already exists, simple | Manual maintenance |

**Quick Win:** Expand existing `/ds.astro` page:

```astro
<!-- src/pages/ds.astro -->
<Page title="Design System">
  <main class="content-grid">
    <section>
      <h1>Design System</h1>
      
      <h2>Colors</h2>
      <!-- Color swatches -->
      
      <h2>Typography</h2>
      <!-- Text samples -->
      
      <h2>Components</h2>
      <!-- Component examples -->
    </section>
  </main>
</Page>
```

---

### 4. Client-Side Search

**Current State:** No search functionality.

**Recommendation:** Add client-side search for content discovery.

**Options:**

| Solution | Type | Best For |
|----------|------|----------|
| **Pagefind** | Build-time index | Static sites |
| **Lunr.js** | Client-side | Small sites |
| **Algolia** | Hosted service | Large sites |
| **Typesense** | Self-hosted | Privacy-focused |

**Recommended: Pagefind**

Zero-config search for static sites:

```bash
pnpm add -D pagefind
```

```json
{
  "scripts": {
    "build": "astro build && pagefind --site dist"
  }
}
```

**Integration:**
```astro
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>

<div id="search"></div>
<script>
  new PagefindUI({ element: "#search" });
</script>
```

---

### 5. Structured Data (Schema.org)

**Current State:** No structured data markup.

**Recommendation:** Add JSON-LD schemas for rich search results.

**Priority Schemas:**

```astro
<!-- Organization -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MYRRYS",
  "url": "https://myrrys.com",
  "logo": "https://myrrys.com/branding/myrrys-logo.svg"
}
</script>

<!-- Product (for game books) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Pelaajan kirja",
  "description": "...",
  "isbn": "978-952-68578-5-5"
}
</script>

<!-- BlogPosting -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{title}",
  "datePublished": "{pubDate}"
}
</script>
```

---

### 6. Image Optimization Pipeline

**Current State:** Images in public folder, some WebP.

**Recommendation:** Standardize image processing.

**Improvements:**
1. Use Astro's `<Image>` component consistently
2. Convert all images to WebP/AVIF
3. Define standard aspect ratios
4. Add placeholder/blur-up loading

```astro
import { Image } from "astro:assets";

<Image
  src={import("../assets/hero.jpg")}
  widths={[400, 800, 1200]}
  sizes="(max-width: 640px) 100vw, 50vw"
  format="webp"
  quality={80}
  alt="Description"
/>
```

---

### 7. Error Handling

**Current State:** Basic 404 page.

**Recommendation:** Improve error handling.

**Additions:**
1. Custom 500 error page (for hosting that supports it)
2. Not-found handling for dynamic routes
3. Graceful degradation for missing content

```astro
// In dynamic routes
const entry = await getEntry("collection", id);
if (!entry) {
  return Astro.redirect("/404");
}
```

---

### 8. Content Validation

**Current State:** Zod schemas validate structure.

**Recommendation:** Add content quality checks.

**Script Ideas:**
```typescript
// scripts/validate-content.ts
import { getCollection } from "astro:content";

const posts = await getCollection("blog");

for (const post of posts) {
  // Check description length
  if (post.data.description.length > 160) {
    console.warn(`${post.id}: Description too long for SEO`);
  }
  
  // Check for hero image
  if (!post.data.heroImage) {
    console.warn(`${post.id}: Missing hero image`);
  }
  
  // Check for tags
  if (!post.data.tags?.length) {
    console.warn(`${post.id}: No tags defined`);
  }
}
```

---

### 9. Performance Monitoring

**Current State:** Simple Analytics for basic metrics.

**Recommendation:** Add Core Web Vitals monitoring.

**Options:**
- Simple Analytics (already in use) - basic metrics
- Web Vitals library - detailed CWV
- SpeedCurve - synthetic monitoring

```astro
<script type="module">
import {onCLS, onFID, onLCP} from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
</script>
```

---

### 10. Accessibility Improvements

**Current State:** Semantic HTML, some ARIA.

**Recommendation:** Formal accessibility audit.

**Checklist:**
- [ ] Keyboard navigation for all interactive elements
- [ ] Skip to content link
- [ ] Focus indicators
- [ ] Color contrast (WCAG AA)
- [ ] Screen reader testing
- [ ] Alt text audit

**Tools:**
- axe DevTools
- WAVE
- Lighthouse accessibility audit

---

## Priority Matrix

| Improvement | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Client-side search | High | Low | **High** |
| Structured data | High | Low | **High** |
| Testing | High | Medium | **High** |
| i18n | Medium | High | Medium |
| Component docs | Medium | Medium | Medium |
| Image pipeline | Medium | Medium | Medium |
| Error handling | Low | Low | Low |
| Content validation | Low | Low | Low |

## Quick Wins

Immediately actionable improvements:

1. **Add Pagefind search** - 30 minutes
2. **Add Organization schema** - 15 minutes
3. **Expand /ds design system page** - 1 hour
4. **Create content validation script** - 1 hour
5. **Add skip-to-content link** - 15 minutes

## Long-Term Roadmap

1. **Phase 1**: Search + Structured Data
2. **Phase 2**: Testing infrastructure
3. **Phase 3**: i18n refactor
4. **Phase 4**: Component documentation
5. **Phase 5**: Performance monitoring

---

[Back to Index](./README.md) | [Previous: SEO & Performance](./07-seo-performance.md)
