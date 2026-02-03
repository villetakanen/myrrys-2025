# Component Architecture

This document details the component organization, patterns, and key components in the Myrrys 2025 project.

## Component Overview

The project contains 22 Astro components organized by functionality:

```
src/components/
├── base/           # Core layout components (5)
├── blog/           # Blog components (1)
├── en/             # English variants (2)
├── home/           # Homepage components (2)
├── legenda/        # Legenda magazine (3)
├── less/           # Less game (1)
├── letl/           # L&L game (6)
│   └── eevenkoto/  # Eevenkoto expansion (1)
└── quick/          # The Quick game (2)
```

## Base Components

Core components used across the entire site.

### BaseHead.astro

**Path:** `src/components/base/BaseHead.astro`

Renders the HTML `<head>` with meta tags, SEO, and global styles.

```astro
---
import "src/styles/styles.css";
import { ClientRouter } from "astro:transitions";

interface Props {
  title: string;
  description?: string;
  image?: string;
}

const {
  title,
  description = "MYRRYS – Roolipelejä pelaajilta pelaajille...",
  image = "/branding/griffon.png",
} = Astro.props;

const canonicalUrl = new URL(Astro.url.pathname, Astro.site);
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- LCP image preload -->
<link rel="preload" as="image" href="/branding/letl-gm-screen-splash-mobile.webp" 
      media="(max-width: 640px)" />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalUrl} />

<!-- Open Graph / Twitter -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={image} />

<!-- Analytics -->
<script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>

<ClientRouter />
```

**Features:**
- Global CSS import
- SEO meta tags (title, description, canonical)
- Open Graph and Twitter cards
- LCP image preloading
- Page transitions via ClientRouter
- Privacy-first analytics

### TopNav.astro

**Path:** `src/components/base/TopNav.astro`

Site header with logo and navigation menu.

```astro
---
import TopNavMenu from "./TopNavMenu.astro";
---

<header id="site-header">
  <nav aria-label="Main navigation">
    <a href="/">
      <img src="/branding/myrrys-logo-letl-inverted.svg" alt="MYRRYS" id="logo"/>
    </a>
    <TopNavMenu />
  </nav>
</header>
```

**Features:**
- Responsive hero background image
- Logo with link to homepage
- Mobile/desktop background variants
- Integrated menu component

### TopNavMenu.astro

**Path:** `src/components/base/TopNavMenu.astro`

CSS-only hamburger menu for mobile navigation.

**Features:**
- Pure CSS toggle (no JavaScript)
- Hidden checkbox pattern for state
- Animated hamburger icon
- Responsive visibility

### SiteFooter.astro

**Path:** `src/components/base/SiteFooter.astro`

Site footer with contact information and social links.

### NavLink.astro

**Path:** `src/components/base/NavLink.astro`

Reusable navigation link with icon support.

## Layout Components

### Page.astro

**Path:** `src/layouts/Page.astro`

Main layout template for Finnish pages.

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
    <BaseHead title={title} description={description} image={image} />
  </head>
  <body>
    <TopNav />
    <slot />
    <SiteFooter />
  </body>
</html>
```

**Composition Pattern:**
```
Page.astro
├── BaseHead (head content)
├── TopNav (header)
├── <slot /> (page content)
└── SiteFooter (footer)
```

### EnPage.astro

**Path:** `src/layouts/EnPage.astro`

English language layout variant with `lang="en"`.

## Feature Components

### Blog Components

#### BlogIndex.astro

**Path:** `src/components/blog/BlogIndex.astro`

Displays filtered, sorted list of blog posts.

```astro
---
import { getCollection } from "astro:content";

interface Props {
  tag?: string;
  limit?: number;
}

const { tag, limit }: Props = Astro.props;

let blogEntries = await getCollection("blog", ({ data }) => {
  if (!tag) return true;
  return data.tags?.includes(tag) ?? false;
});

blogEntries.sort((a, b) => 
  b.data.pubDate.getTime() - a.data.pubDate.getTime()
);

if (limit) {
  blogEntries = blogEntries.slice(0, limit);
}
---

{blogEntries.map(post => (
  <article>
    {post.data.heroImage && <img src={post.data.heroImage} alt="" class="icon">}
    <a href={`/blog/${post.id}`}>
      <h3>{post.data.title}</h3>
      <p class="text-small">{post.data.description}</p>
    </a>
  </article>
))}
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `tag` | `string?` | Filter by tag |
| `limit` | `number?` | Maximum posts to show |

**Usage Examples:**
```astro
<!-- All posts -->
<BlogIndex />

<!-- Latest 3 posts -->
<BlogIndex limit={3} />

<!-- L&L tagged posts, limit 4 -->
<BlogIndex tag="L&L" limit={4} />
```

### Home Components

#### MiscBlock.astro

**Path:** `src/components/home/MiscBlock.astro`

Homepage section with blog and product listings.

#### ProductListing.astro

**Path:** `src/components/home/ProductListing.astro`

Static product promotion section.

### L&L Components

#### LetlBlock.astro

**Path:** `src/components/letl/LetlBlock.astro`

L&L promotional section for homepage.

#### LetlContent.astro

**Path:** `src/components/letl/LetlContent.astro`

Theme wrapper applying L&L styling.

```astro
<div class="theme-letl">
  <slot />
</div>
```

#### LetlIndex.astro

**Path:** `src/components/letl/LetlIndex.astro`

L&L section with filtered blog and products.

#### LetlIntroArticle.astro

**Path:** `src/components/letl/LetlIntroArticle.astro`

Introduction text for L&L pages.

#### LetlCompatibleSection.astro

**Path:** `src/components/letl/LetlCompatibleSection.astro`

Compatible products section.

#### EkIndex.astro

**Path:** `src/components/letl/eevenkoto/EkIndex.astro`

Eevenkoto expansion content.

### Legenda Components

#### LegendaFrontSection.astro

**Path:** `src/components/legenda/LegendaFrontSection.astro`

Legenda magazine homepage section.

#### LegendaFrontArticle.astro

**Path:** `src/components/legenda/LegendaFrontArticle.astro`

Featured Legenda content.

#### Legenda24Section.astro

**Path:** `src/components/legenda/Legenda24Section.astro`

2024 issue content.

### The Quick Components

#### QuickContent.astro

**Path:** `src/components/quick/QuickContent.astro`

The Quick game content wrapper.

#### QuickInfo.astro

**Path:** `src/components/quick/QuickInfo.astro`

The Quick game information.

### Less Components

#### LessBlock.astro

**Path:** `src/components/less/LessBlock.astro`

Less game section for homepage.

## Component Patterns

### Props Interface Pattern

All components define TypeScript interfaces for props:

```astro
---
interface Props {
  title: string;
  description?: string;
  image?: string;
}

const { title, description, image } = Astro.props;
---
```

### Slot Composition

Components use slots for content injection:

```astro
<!-- Parent -->
<LetlContent>
  <p>Content here</p>
</LetlContent>

<!-- LetlContent.astro -->
<div class="theme-letl">
  <slot />
</div>
```

### Theme Wrapper Pattern

Theme components wrap content with styling classes:

```astro
<!-- Applies theme-letl class and styling -->
<main class={`content-grid ${post.data.theme || ""}`}>
  <slot />
</main>
```

### Content Fetching Pattern

Components fetch and filter content collections:

```astro
---
import { getCollection } from "astro:content";

const posts = await getCollection("blog", ({ data }) => {
  return data.tags?.includes("L&L") ?? false;
});

posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
---
```

### Scoped Styles

Component styles are scoped by default:

```astro
<article class="card">
  <!-- content -->
</article>

<style>
/* Only applies to this component */
.card {
  padding: var(--grid);
}
</style>
```

## Component Hierarchy

```
Page.astro (Layout)
├── BaseHead.astro
├── TopNav.astro
│   └── TopNavMenu.astro
├── [Page Content]
│   ├── LetlBlock.astro
│   │   └── LetlContent.astro
│   │       └── BlogIndex.astro
│   ├── LegendaFrontSection.astro
│   │   └── LegendaFrontArticle.astro
│   ├── LessBlock.astro
│   └── MiscBlock.astro
│       ├── BlogIndex.astro
│       └── ProductListing.astro
└── SiteFooter.astro
    └── NavLink.astro
```

## English Variants

For internationalization, English-specific components exist:

| Finnish | English |
|---------|---------|
| `TopNav.astro` | `en/EnTopNav.astro` |
| `SiteFooter.astro` | `en/EnSiteFooter.astro` |
| `Page.astro` | `EnPage.astro` |

---

[Back to Index](./README.md) | [Previous: Styling](./05-styling.md) | [Next: SEO & Performance](./07-seo-performance.md)
