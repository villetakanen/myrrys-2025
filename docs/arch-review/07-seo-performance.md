# SEO & Performance

This document details the SEO implementation, meta tags, performance optimizations, and analytics in the Myrrys 2025 project.

## Static Site Generation Benefits

As a static site, Myrrys 2025 has inherent performance and SEO advantages:

| Benefit | Description |
|---------|-------------|
| **Instant Rendering** | No server-side processing; HTML served directly |
| **CDN-Friendly** | Static files cache perfectly at edge locations |
| **Search Indexable** | Full HTML content available to crawlers |
| **No JavaScript Required** | Content renders without JS execution |
| **Predictable Performance** | No database queries or API latency |

## Meta Tags Implementation

### BaseHead Component

**File:** `src/components/base/BaseHead.astro`

All meta tags are centralized in the BaseHead component.

### Essential Meta Tags

```astro
---
const {
  title,
  description = "MYRRYS – Roolipelejä pelaajilta pelaajille vuodesta 2009...",
  image = "/branding/griffon.png",
} = Astro.props;

const canonicalUrl = new URL(Astro.url.pathname, Astro.site);
const imageURL = new URL(image, Astro.site);
---

<!-- Character encoding and viewport -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- Generator tag -->
<meta name="generator" content={Astro.generator} />

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />
```

### Canonical URLs

```astro
<link rel="canonical" href={canonicalUrl} />
```

Prevents duplicate content issues and consolidates page authority.

### Open Graph (Facebook)

```astro
<meta property="og:type" content="website" />
<meta property="og:url" content={url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={imageURL} />
```

### Twitter Cards

```astro
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={url} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={imageURL} />
```

### Sitemap Link

```astro
<link rel="sitemap" href="/sitemap-index.xml" />
```

## Sitemap Generation

Automatic sitemap generation via `@astrojs/sitemap`.

**Configuration:**

```javascript
// astro.config.mjs
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://myrrys.com",
  integrations: [sitemap()],
});
```

**Output:**
- `/sitemap-index.xml` - Index file
- `/sitemap-0.xml` - URL listing

## RSS Feed

**File:** `src/pages/blog/rss.xml.ts`

Full RSS feed for blog content.

```typescript
return rss({
  title: "MYRRYS Blogi",
  description: "MYRRYS Blogi: Legendoja & lohikäärmeitä...",
  site,
  stylesheet: "/rss/styles.xsl",
  items: blog.map((post) => ({
    title: post.data.title,
    pubDate: post.data.pubDate,
    description: post.data.description,
    content: sanitizeHtml(parser.render(post.body)),
    link: `/blog/${post.id}/`,
  })),
});
```

**Features:**
- XSL stylesheet for browser rendering
- Full HTML content (sanitized)
- Proper date formatting
- Sorted by publication date

## Performance Optimizations

### LCP Image Preloading

Largest Contentful Paint optimization via preload hints.

```astro
<!-- Mobile preload -->
<link
  rel="preload"
  as="image"
  href="/branding/letl-gm-screen-splash-mobile.webp"
  media="(max-width: 640px)"
/>

<!-- Desktop preload -->
<link
  rel="preload"
  as="image"
  href="/branding/letl-gm-screen-splash.webp"
  media="(min-width: 641px)"
/>
```

**Benefits:**
- Faster LCP timing
- Device-specific image loading
- Reduced layout shift

### Responsive Images

Header background uses responsive images:

```css
#site-header {
  background-image: url('/branding/letl-gm-screen-splash-mobile.webp');
}

@media screen and (min-width: 641px) {
  #site-header {
    background-image: url('/branding/letl-gm-screen-splash.webp');
  }
}
```

### Image Optimization

Using Astro's built-in image optimization:

```astro
import { Image } from "astro:assets";

<Image
  src="/path/to/image.webp"
  width={1024}
  height={724}
  widths={[696, 1024]}
  format="webp"
  loading="lazy"
  alt="Description"
/>
```

**Features:**
- Automatic format conversion
- Responsive srcset generation
- Lazy loading support
- WebP optimization

### CSS Optimization

Lightning CSS provides:
- Minification
- Dead code elimination
- Auto-prefixing
- CSS nesting compilation

### Static Asset Hashing

Build output includes content hashes:

```
dist/_astro/
├── styles.a1b2c3d4.css
├── script.e5f6g7h8.js
└── image.i9j0k1l2.webp
```

**Benefits:**
- Long-term caching (immutable files)
- Cache invalidation on content change
- CDN efficiency

## Analytics

### Simple Analytics

Privacy-first analytics without cookies.

```astro
<script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
```

**Features:**
- GDPR compliant (no cookies)
- No personal data collection
- Lightweight script
- No consent banner required

## Page Transitions

Using Astro's ClientRouter for smooth transitions.

```astro
import { ClientRouter } from "astro:transitions";

<ClientRouter />
```

**Features:**
- SPA-like navigation
- Maintains scroll position
- Prefetching on hover
- No full page reload

## Performance Metrics

### Expected Core Web Vitals

| Metric | Target | Implementation |
|--------|--------|----------------|
| **LCP** | < 2.5s | Preloaded hero images |
| **FID** | < 100ms | Minimal JavaScript |
| **CLS** | < 0.1 | Fixed image dimensions |
| **TTFB** | < 600ms | Static hosting + CDN |

### Build Optimizations

| Feature | Benefit |
|---------|---------|
| Static HTML | Zero runtime processing |
| CSS minification | Smaller file sizes |
| Image optimization | Reduced bandwidth |
| Code splitting | Minimal JS bundles |

## URL Handling

### Trailing Slash

```javascript
trailingSlash: "ignore"
```

Both `/blog` and `/blog/` serve the same content.

### Redirects

Legacy URL support for SEO continuity:

```javascript
redirects: {
  "/legendoja-ja-lohikaarmeita": "/letl",
  "/LnL-SRD/[...id]": "/letl/srd/[...id]",
}
```

### URL Normalization

SRD URLs normalized to lowercase:

```javascript
params: { id: post.id.toLowerCase() }
```

## SEO Checklist

| Item | Status | Implementation |
|------|--------|----------------|
| Title tags | Done | Dynamic per page |
| Meta descriptions | Done | Default + custom |
| Canonical URLs | Done | Auto-generated |
| Open Graph | Done | Full implementation |
| Twitter Cards | Done | Large image format |
| Sitemap | Done | Auto-generated |
| RSS Feed | Done | Full content |
| Semantic HTML | Done | Proper heading hierarchy |
| Alt text | Done | On images |
| Mobile-friendly | Done | Responsive design |
| HTTPS | Done | Site URL configured |
| Page speed | Done | Static + optimized |

## Structured Data

Currently not implemented. Potential additions:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MYRRYS",
  "url": "https://myrrys.com"
}
```

**Recommended schemas:**
- `Organization` - Publisher info
- `Product` - Game books
- `BlogPosting` - Blog articles
- `BreadcrumbList` - Navigation

---

[Back to Index](./README.md) | [Previous: Components](./06-components.md) | [Next: Recommendations](./08-recommendations.md)
