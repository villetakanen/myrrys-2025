# PBI: Design System Developer Documentation

## Overview

Create focused MVP developer documentation for the Myrrys design system, concentrating on **containers and surfaces** - the main layout components developers need most.

This documentation should be publicly accessible but semi-hidden (excluded from search engines) to serve as a practical reference for developers building pages.

The documentation will live at `/ds` with expandable sections for future growth under `/pages/ds/**`.

## Business Value

- **Immediate Value**: Focuses on the most-used layout components (80/20 rule)
- **Developer Onboarding**: New developers can start building pages immediately
- **Consistency**: Encourages proper use of content-grid and surface patterns
- **Reduced Questions**: Self-service documentation for "how do I layout a page?"

## Current State

- Basic `/ds` page exists with minimal content (only button examples)
- **Content-grid** system (`content-grid.css`) is the primary layout container
- **Surface** component (`surface.css`) is the primary card/section component
- Design tokens in `tokens.css` support both systems
- No robots.txt exclusion for design system pages
- No documentation on how to use the main layout components

## Requirements

### MVP Scope (Containers & Surfaces)

Focus on the **core layout components** that developers use to build pages:

1. **Content Grid Container** (`.content-grid`)
   - How to create page layouts with proper constraints
   - Full-width, breakout, and content column system
   - Real-world usage examples
   
2. **Surface Component** (`.surface`)
   - How to create cards and contained sections
   - Styling properties and effects
   - Common patterns (article cards, info boxes)

3. **Essential Design Tokens**
   - `--grid` spacing unit (foundation for both systems)
   - Color tokens used by surfaces
   - How tokens work together

4. **SEO Configuration**
   - Add `/ds` to `robots.txt` with `Disallow` directive
   - Include `<meta name="robots" content="noindex, nofollow">`
   - Keep pages publicly accessible (no authentication)

### Out of Scope for MVP
- Typography details (future)
- Button documentation (exists as example)
- Utility classes (future)
- Two-col/Golden-col layouts (future)
- Flex utilities (future)

### Non-Functional Requirements

- **Accessibility**: All examples must be accessible
- **Responsive**: Examples should work on mobile and desktop
- **Performance**: Minimal impact on build time
- **Maintainability**: Easy to update as design system evolves

## Implementation Tasks (MVP)

### Task 1: Update SEO Configuration

**File**: `/public/robots.txt`

```txt
User-agent: *
Allow: /
Disallow: /ds
```

### Task 2: Update DS Page with Container & Surface Documentation

**File**: `/src/pages/ds.astro`

Expand to include:

1. **Page Setup**
   - Add `<meta name="robots" content="noindex, nofollow">` to head
   - Clear introduction explaining this is for developers
   - Note about semi-hidden status

2. **Design Tokens Section**
   - The `--grid` unit (1rem) 
   - Visual demonstration of spacing scale
   - Color tokens: `--color-primary`, `--surface-primary`, `--surface-secondary`
   - Color swatches with values

3. **Content Grid Container** (Primary Focus)
   - What it is and when to use it
   - The three column types:
     - `.content` (default, max 780px)
     - `.breakout` (wider, adds padding)
     - `.full-width` (edge-to-edge)
   - Live examples showing all three
   - Code snippets for each pattern
   - Common usage: `<section class="content-grid">` wrapper

4. **Surface Component** (Secondary Focus)
   - What it is: card/contained content component
   - Properties: background, padding, shadow, blur
   - Usage within content-grid
   - Live example
   - Code snippet

5. **Common Patterns**
   - Article layout (content-grid + sections)
   - Cards within grid
   - Full-width hero sections
   - Copy-pasteable templates

### Task 3: Create Simple Code Example Component (Optional)

**File**: `/src/components/ds/CodeBlock.astro`

Simple component to display code with proper formatting:
- Syntax highlighting (optional for MVP)
- Copy button (optional for MVP)
- Just well-formatted `<pre><code>` for MVP

## Acceptance Criteria

### SEO & Discovery
- [ ] `/ds` excluded from `robots.txt`
- [ ] DS page includes `noindex, nofollow` meta tag
- [ ] Page remains publicly accessible without authentication

### Content Quality (MVP Focus)
- [ ] **Content-grid** system fully documented with examples
- [ ] **Surface** component fully documented with examples
- [ ] Essential design tokens (--grid, colors) explained
- [ ] Each example includes HTML code snippet
- [ ] Live, visual examples for both main components
- [ ] At least 2-3 common pattern examples

### User Experience
- [ ] Code examples are copy-pasteable
- [ ] Visual hierarchy makes content scannable
- [ ] Mobile-friendly layout
- [ ] Examples clearly demonstrate container behavior

### Technical Quality
- [ ] TypeScript compilation succeeds
- [ ] Biome linting passes
- [ ] Production build succeeds
- [ ] No console errors
- [ ] Page loads quickly (static content only)

## Example Structure (MVP)

### Single Page (`/ds`)

```
# Design System – Containers & Surfaces

> Semi-hidden developer documentation. This page is public but excluded from search engines.

---

## Design Tokens

### The Grid Unit
All spacing is based on `--grid: 1rem`

[Visual boxes showing 1x, 2x, 3x, 4x grid spacing]

### Colors
- `--color-primary: #eda01b` [swatch]
- `--surface-primary: [calculated]` [swatch] 
- `--surface-secondary: #1a373d` [swatch]

---

## Content Grid Container

The main layout container for page content. Creates three responsive columns:

### Column Types

**content** (default) - Max 780px, centered
**breakout** - Wider than content, adds breathing room  
**full-width** - Edge-to-edge, spans entire viewport

[LIVE EXAMPLE: Visual grid showing all three columns]

### Usage

```html
<section class="content-grid">
  <article>
    <!-- content column (default) -->
  </article>
  
  <div class="breakout">
    <!-- breakout column -->
  </div>
  
  <div class="full-width">
    <!-- full-width column -->
  </div>
</section>
```

### Common Pattern: Article Layout

```html
<section class="content-grid">
  <article>
    <h1>Page Title</h1>
    <p>Content goes here...</p>
  </article>
  
  <article>
    <h2>Section Two</h2>
    <p>More content...</p>
  </article>
</section>
```

[LIVE EXAMPLE of article layout]

---

## Surface Component

Cards and contained content sections.

### Properties
- Background: `--surface-primary`
- Padding: `var(--grid)`
- Shadow: `0 4px 6px rgba(0,0,0,0.1)`
- Backdrop filter: `blur(10px)`

### Usage

```html
<div class="surface">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

[LIVE EXAMPLE: Surface card]

### Surface within Content Grid

```html
<section class="content-grid">
  <div class="surface">
    <!-- Contained card in content column -->
  </div>
</section>
```

[LIVE EXAMPLE: Surface in grid]

---

## Common Patterns

### Full-Width Hero + Content

```html
<section class="content-grid">
  <div class="full-width" style="background: var(--surface-secondary);">
    <!-- Hero section -->
  </div>
  
  <article>
    <!-- Main content -->
  </article>
</section>
```

### Card Grid

```html
<section class="content-grid">
  <div class="two-col">
    <div class="surface">Card 1</div>
    <div class="surface">Card 2</div>
  </div>
</section>
```
```

## Testing Checklist

- [ ] View `/ds` in browser - renders correctly
- [ ] Verify content-grid examples show column behavior clearly
- [ ] Verify surface examples display correctly
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Check browser console for errors
- [ ] Verify robots.txt excludes `/ds`
- [ ] Verify meta robots tag in page source
- [ ] Test copy-paste functionality for code examples
- [ ] Verify no impact on existing pages

## Success Metrics (MVP)

- **Focused Value**: 100% of container/surface systems documented
- **Usability**: Developers can start building pages immediately
- **Quick Reference**: Find content-grid or surface example in <30 seconds
- **SEO**: Design page not indexed by search engines

## Technical Notes

### Why Semi-Hidden?

- **Public but not promoted**: Useful for developers and community
- **No SEO pollution**: Keeps search results focused on products/content
- **Internal reference**: Easy to link in code comments and PRs
- **Transparency**: Shows design decisions without hiding them

### MVP Strategy

**Why Containers & Surfaces First?**
- Most commonly needed when building pages
- Foundation for all other components
- 80/20 rule: covers 80% of layout needs
- Quick to document, high value

**Content Grid Details:**
- Based on Kevin Powell's modern CSS Grid technique
- Three-column system: content, breakout, full-width
- Responsive without media queries for columns
- Padding handled automatically

**Future Additions (Post-MVP):**
- Typography system
- Flex utilities
- Two-col / Golden-col layouts
- Component library (beyond Surface)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Documentation becomes outdated | Medium | Add note to update docs when CSS changes |
| Adds maintenance burden | Low | Single page, minimal examples |
| Performance impact | Low | Static generation, no runtime cost |
| Scope creep | Medium | Focus strictly on MVP: containers & surfaces only |

## Future Enhancements (Post-MVP)

Phase 2:
- Typography documentation
- Button variants (expand existing)
- Utility classes (flex, spacing)
- Layout utilities (two-col, golden-col)

Phase 3:
- Interactive playground
- Component gallery
- Usage statistics
- Dark mode examples

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Documentation reviewed for accuracy
- [ ] Biome linting passes
- [ ] Production build succeeds
- [ ] No TypeScript errors
- [ ] Peer review completed
- [ ] Changes merged to main branch

## References

- Current DS page: `/src/pages/ds.astro`
- Content Grid CSS: `/src/styles/content-grid.css`
- Surface CSS: `/src/styles/surface.css`
- Design Tokens: `/src/styles/tokens.css`
- Kevin Powell's Content Grid: [YouTube](https://www.youtube.com/watch?v=c13gpBrnGEw)
- Google's robots.txt spec: [developers.google.com](https://developers.google.com/search/crawling-indexing/robots/create-robots-txt)

## Notes

**MVP Philosophy:**
- Start small, ship quickly
- Document what developers need most
- Real examples over theoretical explanation
- Easy to copy-paste and get started
- Expandable foundation for future additions

**Content Strategy:**
- Visual examples speak louder than words
- Show the HTML, show the result
- Common patterns as templates
- One page for MVP (avoid over-engineering)