# Styling Architecture

This document details the CSS architecture, design tokens, layout patterns, and theme system.

## Overview

The project uses a modular CSS architecture with:
- **Design Tokens**: CSS custom properties for consistent values
- **Layout Utilities**: Grid and flexbox-based layout patterns
- **Theme System**: Game-specific visual themes
- **Lightning CSS**: Native CSS nesting and modern features

## Design Tokens

Design tokens are defined in `src/styles/tokens.css` using CSS custom properties.

### Core Tokens

```css
:root {
  /* Base unit for all spacing and sizing */
  --grid: 1rem;
  
  /* Primary accent color (gold) */
  --color-primary: #eda01b;
  
  /* Surface colors */
  --surface-primary: color-mix(in hsl, white, var(--color-primary) 5.5%);
  --surface-secondary: #1a373d;
  --surface-footer: hsla(142deg, 37%, 80%, 0.22);
}

body {
  background-color: var(--surface-primary);
}
```

### Grid-Based Sizing

All spacing and sizing is calculated from the `--grid` base unit:

| Calculation | Result (at 1rem = 16px) |
|-------------|-------------------------|
| `var(--grid)` | 16px |
| `calc(0.5 * var(--grid))` | 8px |
| `calc(2 * var(--grid))` | 32px |
| `calc(3 * var(--grid))` | 48px |

**Usage Examples:**
```css
padding: var(--grid);                    /* 16px */
margin-bottom: calc(2 * var(--grid));    /* 32px */
gap: calc(0.5 * var(--grid));            /* 8px */
```

## Typography System

**File:** `src/styles/typography.css`

### Font Families

```css
body {
  --font-header: Oswald, ui-sans-serif, system-ui, sans-serif;
  
  font-family: "Open Sans", ui-sans-serif, system-ui, sans-serif;
  font-size: var(--font-size);      /* 1rem */
  line-height: var(--line-height);  /* 2rem */
}
```

| Element | Font | Size | Line Height |
|---------|------|------|-------------|
| Body | Open Sans | `1 * --grid` | `2 * --grid` |
| H1 | Oswald | `2.5 * --grid` | `3 * --grid` |
| H2 | Oswald | `1.75 * --grid` | `2 * --grid` |
| H3-H4 | Inherited | `1.25 * --grid` | `2 * --grid` |

### Heading Styles

```css
h1, h2 {
  font-family: var(--font-header);
  font-weight: 400;
}

h1 {
  font-size: calc(2.5 * var(--grid));
  line-height: calc(3 * var(--grid));
  text-transform: uppercase;
  margin-bottom: calc(2 * var(--grid));
}

h2 {
  font-size: calc(1.75 * var(--grid));
  line-height: calc(2 * var(--grid));
  font-weight: 200;
  text-transform: uppercase;
}

h3, h4 {
  font-weight: 700;
  line-height: calc(2 * var(--grid));
}
```

### Utility Classes

```css
.text-small {
  font-size: calc(0.875 * var(--grid));
  line-height: calc(1.5 * var(--grid));
}

.text-center {
  text-align: center;
}
```

## Layout System

### Content Grid

**File:** `src/styles/content-grid.css`

A CSS Grid-based layout with named areas for content width control.

```css
.content-grid {
  --padding-inline: var(--grid);
  --content-max-width: 780px;
  --breakout-width: calc(8 * var(--grid));
  --breakout-max-width: calc(var(--breakout-width) + var(--content-max-width));

  display: grid;
  grid-template-columns:
    [full-width-start] minmax(var(--padding-inline), 1fr)
    [breakout-start] minmax(0, var(--breakout-size))
    [content-start] min(100% - (var(--padding-inline) * 2), var(--content-max-width))
    [content-end]
    minmax(0, var(--breakout-size)) [breakout-end]
    minmax(var(--padding-inline), 1fr) [full-width-end];
}
```

**Grid Areas:**

```
|  margin  | breakout |    content    | breakout |  margin  |
|----------|----------|---------------|----------|----------|
|  full-width-start                       full-width-end    |
|          |  breakout-start   breakout-end        |        |
|          |          | content-start |          |          |
|          |          | content-end   |          |          |
```

**Usage:**

```html
<main class="content-grid">
  <!-- Default: content width -->
  <section>Normal content</section>
  
  <!-- Breakout: wider than content -->
  <section class="breakout">Wide content</section>
  
  <!-- Full width: edge to edge -->
  <section class="full-width">Full width</section>
</main>
```

### Two-Column Layout

**File:** `src/styles/two-col.css`

Equal two-column layout with mobile stacking.

```css
.two-col {
  display: flex;
  flex-direction: column;
  gap: var(--grid);
}

@media screen and (min-width: 640px) {
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

### Golden Ratio Layout

**File:** `src/styles/golden-col.css`

Two-column layout with 1.618:1 (golden ratio) proportions.

```css
.golden-col {
  display: flex;
  flex-direction: column;
  gap: var(--grid);
}

@media screen and (min-width: 640px) {
  .golden-col {
    display: grid;
    grid-template-columns: 1.618fr 1fr;
  }
}
```

**Use Cases:**
- SRD pages with sidebar table of contents
- Product pages with main content and metadata

### Flexbox Utilities

**File:** `src/styles/flex.css`

```css
.flex {
  display: flex;
  gap: var(--grid);
}

.flex-col {
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}
```

## Responsive Design

### Breakpoints

Mobile-first approach with two breakpoints:

| Breakpoint | Width | Target |
|------------|-------|--------|
| Default | 0px+ | Mobile |
| Tablet | 640px+ | Tablets |
| Desktop | 1024px+ | Desktop |

### Media Queries

```css
/* Mobile first (default) */
.element {
  display: flex;
  flex-direction: column;
}

/* Tablet and up */
@media screen and (min-width: 640px) {
  .element {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop */
@media screen and (min-width: 1024px) {
  .element {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

## Theme System

Themes override design tokens via CSS classes applied to containers.

### Available Themes

| Theme Class | Game | Primary Colors |
|-------------|------|----------------|
| `theme-letl` | Legendoja & Lohikaarmeita | Gold/amber gradient |
| `theme-legenda` | Legenda Magazine | Custom styling |
| `theme-quick` | The Quick | Custom styling |

### Theme Implementation

**File:** `src/styles/themes/letl.css`

```css
.theme-letl {
  --background-container: linear-gradient(
    140deg,
    hsl(38deg 63% 80%),
    hsl(246deg 29% 87%)
  );
  
  --surface-primary: linear-gradient(
    140deg,
    color-mix(in hsl, white, var(--color-primary) 10%),
    color-mix(in hsl, white, var(--surface-secondary) 10%)
  );
}

.theme-letl blockquote {
  border-left: solid calc(0.5 * var(--grid)) var(--color-primary);
  background: color-mix(in hsl, transparent, var(--color-primary) 22%);
}
```

### Usage

```astro
<!-- In page component -->
<main class="content-grid theme-letl">
  <section>
    Content styled with L&L theme
  </section>
</main>

<!-- Dynamic theme from frontmatter -->
<main class={`content-grid ${post.data.theme || ""}`}>
```

## Component Styles

### Surface Styles

**File:** `src/styles/surface.css`

Container styling for cards and sections.

### Button Styles

**File:** `src/styles/buttons.css`

```css
.button {
  /* Button styling */
}

a.button {
  text-shadow: none;
}
```

## Stylesheet Organization

### Import Order

**File:** `src/styles/styles.css`

```css
/* Order matters for cascade */
@import "./reset.css";
@import "./tokens.css";
@import "./fonts.css";
@import "./typography.css";
@import "./flex.css";
@import "./content-grid.css";
@import "./two-col.css";
@import "./golden-col.css";
@import "./surface.css";
@import "./buttons.css";
@import "./themes/letl.css";
@import "./themes/legenda.css";
@import "./themes/quick.css";
```

### File Purposes

| File | Purpose |
|------|---------|
| `reset.css` | Browser normalization |
| `tokens.css` | Design token definitions |
| `fonts.css` | Font-face declarations |
| `typography.css` | Text and heading styles |
| `flex.css` | Flexbox utilities |
| `content-grid.css` | Main layout grid |
| `two-col.css` | Two-column layout |
| `golden-col.css` | Golden ratio layout |
| `surface.css` | Container styles |
| `buttons.css` | Button styles |
| `themes/*.css` | Game-specific themes |

## Modern CSS Features

### CSS Nesting

Enabled via Lightning CSS in `astro.config.mjs`:

```javascript
vite: {
  css: {
    transformer: "lightningcss",
    lightningcss: {
      include: Features.Nesting,
    },
  },
},
```

**Usage:**
```css
.card {
  padding: var(--grid);
  
  & h2 {
    margin-bottom: calc(0.5 * var(--grid));
  }
  
  &:hover {
    background: var(--surface-secondary);
  }
}
```

### Color Functions

Using modern `color-mix()` for dynamic colors:

```css
--surface-primary: color-mix(in hsl, white, var(--color-primary) 5.5%);

background: color-mix(in hsl, transparent, var(--color-primary) 22%);
```

### Container Queries

The content grid sets up container contexts:

```css
.content-grid > :not(.breakout, .full-width) {
  container-type: inline-size;
  container-name: content;
}
```

---

[Back to Index](./README.md) | [Previous: Content System](./04-content-system.md) | [Next: Components](./06-components.md)
