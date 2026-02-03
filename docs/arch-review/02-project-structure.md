# Project Structure

This document details the directory layout and file organization of the Myrrys 2025 project.

## Top-Level Directory Structure

```
myrrys-2025/
├── .astro/                 # Generated Astro types and artifacts
├── .git/                   # Git repository
├── dist/                   # Build output (static HTML)
├── docs/                   # Project documentation
├── LnL-SRD/                # Git submodule: Game system reference
├── node_modules/           # Dependencies
├── public/                 # Static assets (images, feeds)
├── specs/                  # Specifications
├── src/                    # Source code
├── AGENTS.md               # AI agent instructions
├── astro.config.mjs        # Astro configuration
├── biome.json              # Linter/formatter config
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Locked dependency versions
├── pnpm-workspace.yaml     # pnpm workspace config
├── README.md               # Project readme
└── tsconfig.json           # TypeScript configuration
```

## Source Code Organization (`src/`)

```
src/
├── blog/                   # Blog post content (Markdown)
├── components/             # Astro components
│   ├── base/               # Core layout components
│   ├── blog/               # Blog-related components
│   ├── en/                 # English language components
│   ├── home/               # Homepage components
│   ├── legenda/            # Legenda magazine components
│   ├── less/               # Less game components
│   ├── letl/               # L&L game components
│   │   └── eevenkoto/      # Eevenkoto expansion components
│   └── quick/              # The Quick game components
├── layouts/                # Page layout templates
├── pages/                  # Route definitions
│   ├── blog/               # Blog routes
│   │   └── tag/            # Tag filtering routes
│   ├── en/                 # English routes
│   ├── legenda/            # Legenda routes
│   ├── legendoja-lohikaarmeita/  # Legacy routes
│   ├── letl/               # L&L routes
│   │   ├── eevenkoto/      # Expansion routes
│   │   └── srd/            # SRD routes
│   ├── letl-suuri-seikkailu/  # Adventure routes
│   └── the-quick/          # The Quick routes
├── products/               # Product content (Markdown)
├── rehype/                 # Rehype plugins (HTML AST)
├── remark/                 # Remark plugins (Markdown AST)
├── scripts/                # Utility scripts
├── styles/                 # CSS stylesheets
│   └── themes/             # Game-specific themes
└── content.config.ts       # Content collection schemas
```

## Content Directories

### Blog Content (`src/blog/`)

Markdown files for blog posts with frontmatter metadata.

```
src/blog/
├── 2025-08-01-example.md
├── 2025-03-03-eevenkoto.md
└── ...
```

### Product Content (`src/products/`)

Markdown files for product pages (game books, publications).

```
src/products/
├── pelaajan-kirja.md
├── pelinjohtajan-kirja.md
└── ...
```

### SRD Content (`LnL-SRD/`)

Git submodule containing the System Reference Document for Legendoja & Lohikaarmeita.

```
LnL-SRD/
├── Sisällysluettelo.md     # Table of contents
├── Hahmonluonti/           # Character creation
├── Loitsut/                # Spells
├── Olotilat/               # Conditions/states
└── Varusteet/              # Equipment
    ├── Aseet/              # Weapons
    ├── Palvelut/           # Services
    └── Pikkutavara/        # Small items
```

## Component Organization

### Base Components (`src/components/base/`)

Core layout and navigation components used across the site.

| Component | Purpose |
|-----------|---------|
| `BaseHead.astro` | HTML head with meta tags, SEO |
| `TopNav.astro` | Main navigation header |
| `TopNavMenu.astro` | Mobile hamburger menu |
| `NavLink.astro` | Footer navigation links |
| `SiteFooter.astro` | Site footer |

### Feature Components

Components organized by section/game:

| Directory | Purpose |
|-----------|---------|
| `home/` | Homepage sections |
| `blog/` | Blog listing and display |
| `letl/` | Legendoja & Lohikaarmeita |
| `letl/eevenkoto/` | Eevenkoto expansion |
| `legenda/` | Legenda magazine |
| `quick/` | The Quick game |
| `less/` | Less game section |
| `en/` | English language variants |

## Layout Structure

### Page Layouts (`src/layouts/`)

| Layout | Purpose |
|--------|---------|
| `Page.astro` | Finnish language pages |
| `EnPage.astro` | English language pages |

**Layout Composition:**
```
Page.astro
├── BaseHead (meta, SEO, styles)
├── TopNav (navigation)
├── <slot /> (page content)
└── SiteFooter (footer)
```

## Styles Organization (`src/styles/`)

### Core Stylesheets

| File | Purpose |
|------|---------|
| `styles.css` | Import orchestrator |
| `reset.css` | Browser reset |
| `tokens.css` | Design tokens (colors, spacing) |
| `fonts.css` | Font declarations |
| `typography.css` | Text styles |

### Layout Stylesheets

| File | Purpose |
|------|---------|
| `content-grid.css` | Main content grid system |
| `flex.css` | Flexbox utilities |
| `two-col.css` | Two-column responsive layout |
| `golden-col.css` | Golden ratio (1.618:1) layout |

### Component Stylesheets

| File | Purpose |
|------|---------|
| `buttons.css` | Button styles |
| `surface.css` | Surface/container styles |

### Theme Stylesheets (`src/styles/themes/`)

| File | Purpose |
|------|---------|
| `letl.css` | L&L theme (gold/amber) |
| `legenda.css` | Legenda theme |
| `quick.css` | The Quick theme |

## Plugin Directories

### Remark Plugins (`src/remark/`)

Markdown AST processing plugins.

| File | Purpose |
|------|---------|
| `remarkSrdLinks.ts` | Transform relative SRD links to absolute |
| `remarkUrlLowercase.ts` | URL normalization |

### Rehype Plugins (`src/rehype/`)

HTML AST processing plugins.

| File | Purpose |
|------|---------|
| `rehypeSrdLinks.ts` | Post-markdown SRD link processing |
| `rehypeSrdLinksWithContext.ts` | Context-aware link handling |

## Public Assets (`public/`)

Static files served as-is without processing.

```
public/
├── blog-images/            # Blog featured images
├── branding/               # Logo and branding assets
│   ├── letl-gm-screen-splash.webp
│   └── myrrys-logo.svg
├── rss/                    # RSS feed styling
├── the-quick/              # The Quick game assets
└── favicon.svg             # Site favicon
```

## Configuration Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro framework configuration |
| `tsconfig.json` | TypeScript configuration |
| `biome.json` | Linting and formatting |
| `package.json` | Dependencies and scripts |
| `pnpm-workspace.yaml` | pnpm workspace |
| `.gitmodules` | Git submodule configuration |

## Git Submodule

The `LnL-SRD/` directory is a Git submodule, allowing independent versioning of game rules content.

```
.gitmodules:
[submodule "LnL-SRD"]
    path = LnL-SRD
    url = [repository-url]
```

This enables:
- Separate version control for rules content
- Independent updates without site rebuilds
- Shared content across multiple projects

---

[Back to Index](./README.md) | [Previous: Technology Stack](./01-technology-stack.md) | [Next: Routing](./03-routing.md)
