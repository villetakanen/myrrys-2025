# Lighthouse Report: myrrys.com

**Date:** 2026-02-23
**Tool:** Lighthouse 13.0.3 (headless Chrome, mobile emulation)
**URL:** https://myrrys.com

---

## Scores

| Category | Score |
|----------|-------|
| Performance | **86** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |
| Security Headers | **All pass** (CSP, HSTS, COOP, XFO, Trusted Types) |

---

## Core Web Vitals

| Metric | Value | Score | Status |
|--------|-------|-------|--------|
| First Contentful Paint (FCP) | 2.2 s | 0.79 | Needs improvement |
| Largest Contentful Paint (LCP) | 3.8 s | 0.54 | Poor |
| Total Blocking Time (TBT) | 0 ms | 1.0 | Excellent |
| Cumulative Layout Shift (CLS) | 0 | 1.0 | Excellent |
| Speed Index | 3.0 s | 0.94 | Good |
| Time to Interactive | 3.8 s | 0.89 | Good |

**Key takeaway:** TBT and CLS are perfect. LCP is the main bottleneck dragging the performance score down.

---

## Significant Findings

### 1. LCP is slow (3.8 s) — Primary performance issue

The LCP element is the `<header id="site-header">` (the top navigation/header area).

**LCP breakdown:**

| Phase | Duration |
|-------|----------|
| Time to First Byte (TTFB) | 448 ms |
| Resource load delay | 4 ms |
| Resource load duration | 576 ms |
| Element render delay | 485 ms |

**Root causes identified:**
- **No `fetchpriority="high"`** on the LCP element/resources. Lighthouse explicitly flags this.
- **TTFB of ~450 ms** — server response time is contributing nearly half a second. This is a Netlify CDN characteristic; likely acceptable but worth monitoring.
- **Element render delay of ~485 ms** — the header can't paint until CSS finishes loading and fonts begin rendering.

### 2. Render-blocking CSS stylesheets

Two CSS files block the initial render:

| Resource | Size |
|----------|------|
| `_astro/_id_.D_egQf-Q.css` | 1.2 KB |
| `_astro/index.BpYf2LrF.css` | 2.2 KB |

The CSS chain also gates **5 font downloads** (3 Open Sans variants + 2 Oswald variants, totalling ~79 KB). The critical rendering path is:

```
Document (452ms) → CSS (1026ms) → Fonts (1422ms)
```

The longest chain is 1,422 ms to the italic Open Sans font.

### 3. Oversized images displayed at small dimensions (~405 KB wasted)

Four images are served at source dimensions far exceeding their display size:

| Image | Source size | Display size | Wasted |
|-------|-----------|--------------|--------|
| `ametistiviidakko-cover.webp` | 2480x3248 | 49x64 px | 182 KB |
| `sumun_saari.webp` | 720x1019 | 45x64 px | 103 KB |
| `legenda-1-cover.webp` | 1024x1338 | 49x64 px | 81 KB |
| `legenda-kansi-1-preview.webp` | 720x942 | 284x372 px | 39 KB |

The first three are icon-sized thumbnails receiving full-resolution source images. This is the biggest actionable image issue.

### 4. Unsized SVG images (minor CLS risk)

Three `<img>` elements lack explicit `width` and `height` attributes:

- `/branding/myrrys-logo-letl-inverted.svg` — used in both the main logo and mobile nav logo
- `/twotone-language.svg` — globe icon in the nav

CLS is currently 0, so the layout is stable in practice, but explicit dimensions are still recommended as a safeguard.

### 5. Cache policy for Simple Analytics script

`scripts.simpleanalyticscdn.com/latest.js` has a 168-hour (7-day) cache TTL. This is the only third-party resource and its impact is negligible (5 KB, 2 ms main thread time).

---

## Resource Budget Snapshot

| Type | Requests | Transfer size |
|------|----------|---------------|
| Images | 12 | 571 KB |
| Fonts | 5 | 79 KB |
| Scripts | 2 | 10 KB |
| Document | 1 | 5 KB |
| Stylesheets | 2 | 3 KB |
| Third-party (total) | 2 | 5 KB |
| **Total** | **23** | **670 KB** |

The page is lightweight overall. Images account for 85% of the transfer budget.

---

## What's Working Well

- **Accessibility: 100** — no issues detected
- **SEO: 100** — title, meta description, lang attribute, robots.txt all pass
- **Best Practices: 100** — all security headers in place
- **Zero JS blocking** — TBT is 0 ms; the site ships almost no client-side JavaScript
- **Zero layout shift** — CLS is perfect
- **Only 2 third-party requests** (Simple Analytics) with minimal impact
- **Fonts are self-hosted** with proper `@font-face` declarations

---

## Recommended Actions (prioritised)

### High impact

1. **Add `fetchpriority="high"` to the LCP element** — the header or its critical resource should signal browser priority. This is the single highest-impact quick win flagged by Lighthouse.

2. **Generate thumbnail-sized image variants** for the three icon images (ametistiviidakko, sumun_saari, legenda-1-cover). They're displayed at ~64x64 but served at full resolution. Use Astro's `<Image>` component or a build-time resize step. Potential saving: ~366 KB.

3. **Inline critical CSS or use `<link rel="preload">` for the main stylesheet** to reduce render-blocking time. The two CSS files gate all font loading and element rendering.

### Medium impact

4. **Reduce font variants** or **subset fonts** — 5 font files at 79 KB total. Consider whether all variants (Oswald 200 + 400, Open Sans 400 + 400i + 700) are needed on the homepage.

5. **Add `width` and `height` to SVG `<img>` elements** (logo and globe icon) as a CLS safeguard.

### Low impact / monitoring

6. **TTFB (~450 ms)** — monitor via Netlify Analytics. If it degrades, consider edge functions or reviewing Netlify CDN cache headers.
