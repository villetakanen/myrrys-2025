# Spec: SEO & AEO

## Blueprint (Design)

### Context

> **Goal:** Establish structured data (JSON-LD) and semantic HTML practices for search engine and answer engine optimization.
> **Why:** The site lacks structured data, limiting discoverability in search results and AI answer engines. Rich snippets (Organization, Product, Article, Breadcrumbs) improve click-through rates and establish entity authority.
> **Architectural Impact:** `BaseHead.astro`, page layouts, blog post templates, and product page templates.

### Current State

- **Homepage**: Single H1 implemented (visually hidden "MYRRYS"), component headings use `<h2 class="text-h1">`.
- **Metadata**: Standard meta tags exist in `BaseHead.astro` (title, description, OG, Twitter Card). Organization + WebSite JSON-LD added via MYR-17.
- **JsonLd component**: Created and unit-tested at `src/components/base/JsonLd.astro`. Wired into `BaseHead.astro` for site-wide schemas.
- **AEO**: No Q&A schemas or entity definitions.

### Architecture

```
BaseHead.astro (existing meta tags, canonical, OG, Twitter)
    ↕ used alongside
JsonLd.astro (reusable schema renderer)
    ↕ consumed by
Page layouts and page-level components
```

**Schema injection pattern:**

Each page or layout decides which schemas to render. The `JsonLd.astro` component is a thin renderer — it accepts a schema object, ensures `@context` is present, and outputs a `<script type="application/ld+json">` tag.

```astro
---
import JsonLd from "@components/base/JsonLd.astro";
---
<JsonLd schema={{
  "@type": "Organization",
  name: "Myrrys",
  url: "https://myrrys.com",
}} />
```

**Planned schemas:**

| Schema | Where | Source Data |
|--------|-------|-------------|
| Organization | All pages (via BaseHead or layout) | Static site metadata |
| WebSite | All pages (via BaseHead or layout) | Static site metadata |
| Product | Collection-driven product pages (`/letl/[id]`) | Content collection frontmatter |
| Article | Blog post pages | Blog content collection frontmatter |
| BreadcrumbList | All sub-pages | Derived from URL path |

**JsonLd.astro component contract:**

```typescript
interface Props {
  schema: Record<string, unknown>;
}
```

- Auto-injects `"@context": "https://schema.org"` if not present in the schema object
- Preserves caller-provided `@context` if explicitly set
- Outputs valid JSON via `JSON.stringify`
- Renders as `<script type="application/ld+json">`

**Product schema field mapping (MYR-18):**

Scope: Collection-driven product pages only (`src/pages/letl/[id].astro` using `products` collection). Hardcoded product pages (`/the-quick/`, `/hood/`) are out of scope.

| Frontmatter Field | Schema.org Property | Required | Notes |
|--------------------|---------------------|----------|-------|
| `title` | `name` | Yes | |
| `description` | `description` | Yes | |
| `heroImage` | `image` | No | Resolve to absolute URL; omit if missing |
| `brand` | `brand.name` | Yes | Nested as `{ "@type": "Brand", "name": value }` |
| `isbn` | `isbn` | No | Use first value from array |
| `distributors` | `offers` | No | Parse `"name,url"` format into `Offer` objects |
| `author` | `author` | Yes | |

```typescript
// Distributor format in frontmatter: "StoreName,https://store.url/product"
// Maps to Schema.org Offer:
{
  "@type": "Offer",
  "url": "https://store.url/product",
  "seller": { "@type": "Organization", "name": "StoreName" }
}
```

**Single H1 Policy:**

- Every page must have exactly one `<h1>` tag
- Components use `<h2 class="text-h1">` for visual H1 styling with correct semantics
- When H1 disrupts visual design, use `<h1 class="visually-hidden">Page Title</h1>`

### Anti-Patterns

<rules>
<rule id="no-multiple-h1">
NEVER use more than one H1 per page.
Multiple H1s confuse search engine heading hierarchy analysis and harm accessibility.
</rule>

<rule id="no-inline-json-ld">
NEVER write raw JSON-LD script tags directly in page templates.
Always use the JsonLd.astro component to ensure consistent @context injection and valid JSON output.
</rule>

<rule id="no-empty-alt-text">
NEVER leave image alt text empty unless the image is purely decorative (use alt="" explicitly for decorative images).
Missing alt text harms accessibility and SEO image indexing.
</rule>

<rule id="no-client-side-schema">
AVOID generating JSON-LD on the client side.
Structured data must be in the static HTML for search engine crawlers. Astro's static rendering handles this naturally.
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [x] JsonLd.astro component exists with unit tests (MYR-16 — DONE)
- [x] Organization + WebSite schemas rendered on all pages (MYR-17 — DONE)
- [ ] Product schema rendered on product pages with frontmatter data (MYR-18)
- [ ] Article schema rendered on blog posts with frontmatter data (MYR-19)
- [ ] BreadcrumbList schema rendered on all sub-pages (MYR-20)
- [ ] Automated SEO verification in tests/CI (MYR-21)
- [ ] Every page has exactly one H1 element
- [ ] All JSON-LD output validates against Google Rich Results Test
- [ ] Lighthouse SEO score > 95

### Regression Guardrails

<invariants>
<invariant id="valid-json-ld">
All `<script type="application/ld+json">` tags MUST contain valid JSON with `@context` present.
Invalid JSON-LD is silently ignored by search engines, negating all structured data benefits.
</invariant>

<invariant id="single-h1">
Every rendered page MUST have exactly one `<h1>` element.
Multiple H1s or missing H1 degrades search engine heading analysis and accessibility.
</invariant>

<invariant id="static-schema-output">
JSON-LD MUST be present in the static HTML output (not injected client-side).
Search engine crawlers do not reliably execute JavaScript; Astro static rendering guarantees this.
</invariant>

<invariant id="schema-org-context">
The `@context` field in JSON-LD MUST be `"https://schema.org"` unless explicitly overridden.
Incorrect context prevents search engines from interpreting the structured data.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: JsonLd Component

  Scenario: Render schema with auto-injected context
    Given a page uses JsonLd with schema { "@type": "Organization", "name": "Myrrys" }
    When the page is built
    Then the HTML contains <script type="application/ld+json">
    And the JSON includes "@context": "https://schema.org"
    And the JSON includes "@type": "Organization"

  Scenario: Preserve explicit context
    Given a page uses JsonLd with schema { "@context": "https://custom.org", "@type": "Thing" }
    When the page is built
    Then the JSON includes "@context": "https://custom.org"

Feature: Organization and WebSite Schema (MYR-17)

  Scenario: Homepage includes Organization schema
    Given a user visits /
    When the page is rendered
    Then the HTML contains JSON-LD with "@type": "Organization"
    And "name" is "Myrrys"
    And "url" is "https://myrrys.com"

  Scenario: All pages include WebSite schema
    Given a user visits any page
    When the page is rendered
    Then the HTML contains JSON-LD with "@type": "WebSite"

Feature: Product Schema (MYR-18)

  Scenario: Product page includes Product schema with core fields
    Given a user visits /letl/letl-pelaajan-kirja
    When the page is rendered
    Then the HTML contains JSON-LD with "@type": "Product"
    And "name" matches the product title from frontmatter
    And "description" matches the product description
    And "brand" contains "@type": "Brand" with "name" from frontmatter
    And "image" is the absolute URL of heroImage

  Scenario: Product with ISBN includes isbn field
    Given a product has isbn data in frontmatter
    When the page is rendered
    Then the JSON-LD "isbn" contains the first ISBN value

  Scenario: Product with distributors includes Offers
    Given a product has distributors in frontmatter
    When the page is rendered
    Then the JSON-LD contains "offers" array
    And each offer has "@type": "Offer" with "url" and "seller"

  Scenario: Product without heroImage omits image field
    Given a product has no heroImage in frontmatter
    When the page is rendered
    Then the Product JSON-LD does not contain "image" field

Feature: Article Schema (MYR-19)

  Scenario: Blog post includes Article schema
    Given a user visits /blog/some-post
    When the page is rendered
    Then the HTML contains JSON-LD with "@type": "Article"
    And "headline" matches the post title
    And "datePublished" matches the post pubDate

Feature: BreadcrumbList Schema (MYR-20)

  Scenario: Sub-page includes breadcrumb schema
    Given a user visits /letl/srd/loitsut
    When the page is rendered
    Then the HTML contains JSON-LD with "@type": "BreadcrumbList"
    And the itemListElement contains path segments as ordered items

  Scenario: Homepage has no breadcrumb
    Given a user visits /
    When the page is rendered
    Then no BreadcrumbList JSON-LD is present

Feature: Single H1 Policy

  Scenario: Every page has exactly one H1
    Given any page on the site
    When the page is rendered
    Then the HTML contains exactly one <h1> element
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/components/base/JsonLd.astro` | Reusable JSON-LD renderer component |
| `src/components/base/JsonLd.test.ts` | Unit tests for JsonLd schema processing |
| `src/components/base/BaseHead.astro` | Primary meta tags, OG, Twitter Card (JSON-LD added here or in layouts) |
| `src/layouts/Page.astro` | Finnish layout — Organization/WebSite/Breadcrumb schemas injected here |
| `src/layouts/EnPage.astro` | English layout — same schemas with lang="en" context |
| `src/pages/letl/[id].astro` | Product pages — Product JSON-LD from collection frontmatter |

---

## Decision Log

### ADR-SEO-001: JSON-LD over Microdata

**Decision:** Use JSON-LD for all structured data instead of Microdata or RDFa.

**Reasoning:**
1. JSON-LD is Google's recommended format
2. Decoupled from HTML markup — cleaner templates
3. Easier to generate from frontmatter data in Astro
4. Single component handles all schema types

**Trade-offs:**
- Duplicates some data already in HTML (title, description)
- Requires a dedicated component (created as JsonLd.astro)

### ADR-SEO-002: Strict Heading Hierarchy

**Decision:** Enforce single H1 per page with `<h2 class="text-h1">` pattern for components.

**Reasoning:**
1. Search engines use heading hierarchy for content understanding
2. Screen readers use headings for navigation
3. Visual styling decoupled from semantic meaning via utility classes

**Trade-offs:**
- Requires refactoring components that hardcode `<h1>` (LetlBlock, LessBlock, LegendaFrontArticle)
- Slightly more verbose markup (`class="text-h1"` on H2s)
