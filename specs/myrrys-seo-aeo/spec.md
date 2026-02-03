# SEO & AEO Specification

## Goal Description
Establish a definitive strategy for Search Engine Optimization (SEO) and Answer Engine Optimization (AEO) for the Myrrys website. The goal is to ensure the site is correctly indexed, semantically rich for AI agents, and accessible to all users.

## User Review Required
> [!IMPORTANT]
> This spec mandates a strict "Single H1 per page" rule, which will require refactoring existing components that currently hardcode `<h1>` tags (e.g., `LetlBlock`, `LessBlock`, `LegendaFrontArticle`).

## Current State Analysis
- **Homepage**: ✅ Single H1 implemented (visually hidden "MYRRYS"), component headings use `<h2 class="text-h1">`.
- **Metadata**: Basic standard meta tags exist (`BaseHead.astro`), but lack structured data (JSON-LD).
- **AEO**: Missing specific Q&A schemas and entity definitions that help answer engines.

## Proposed Changes

### Architecture

#### Single H1 Policy
- Every page URL must have exactly **one** `<h1>` tag.
- The `<h1>` should describe the specific page content.
- On the homepage, the `<h1>` should probably be "Myrrys - Roolipelejä pelaajilta pelaajille" or similar, and component headings should be `<h2>`.

#### Structured Data (JSON-LD)
Implement `Schema.org` definitions to help search engines understand entities.
- **Organization**: Define "Myrrys" as an Organization.
- **WebSite**: Define the site entity.
- **Product**: For product pages (L&L, etc.).
- **BreadcrumbList**: For navigation structure.
- **Article**: For blog posts.

#### AEO Strategy
- **Direct Answers**: Content should be structured to directly answer "What is X?" questions.
- **FAQ Schema**: Where appropriate, use FAQPage schema.
- **Entity Linking**: Link to known entities (Wikidata, Wikipedia) where relevant in content to establish authority.

### Implementation Guidelines

#### Component Heading Levels
Components should use `<h2 class="text-h1">` for their main headings. This provides:
- **Semantic correctness**: `<h2>` is appropriate for section headings
- **Visual consistency**: `.text-h1` applies H1 styling from typography.css

#### Visually Hidden H1 Pattern
When the page H1 would disrupt the visual design (e.g., homepage with branded hero), use:
```html
<h1 class="visually-hidden">Page Title</h1>
```
The `.visually-hidden` class hides the element visually but keeps it accessible to screen readers and search engines.

#### Metadata Component
Extend `BaseHead.astro` or create `SEOHead.astro` to inject JSON-LD scripts based on page props.

### Architecture Decision Records (ADR)
- **ADR-SEO-001**: Adopting JSON-LD over Microdata for cleaner template code.
- **ADR-SEO-002**: Strict Semantic Heading Hierarchy (H1 -> H2 -> H3).

## Verification Plan

### Automated Tests
- **Lighthouse**: SEO score must be > 95.
- **HtmlValidate**: No "heading-level" errors (ensure h2 follows h1, etc.).
- **Playwright**: Test for presence of single H1 and JSON-LD script tags.

### Manual Verification
- **Google Rich Results Test**: Verify JSON-LD snippets.
- **AEO Check**: Verify that "What is Myrrys?" types of queries can be answered from the content structure.

## Anti-Patterns
- **Multiple H1s**: Never use more than one H1.
- **Empty Alt Text**: Images must have meaningful alt text or be marked decorative.
- **"Click Here" Links**: Link text must describe the destination.
