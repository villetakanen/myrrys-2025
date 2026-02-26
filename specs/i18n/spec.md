# Internationalization (i18n) Spec

## Blueprint (Design)

### Context

MYRRYS operates two distinct markets with different product catalogs:

1. **Finnish Market** (`/`) — Finnish products, Finnish blog, bilingual/trilingual audience (FI/SWE/EN)
2. **International Market** (`/en/`) — English products, English blog, global audience

The Finnish audience is highly language-capable and consumes both Finnish and English products. International products are also relevant to the Finnish market. This is **not a translation scenario** but a **market segmentation scenario**.

### Architecture

**Market-Based Route Separation:**

```
/                      # Finnish Market
├── /blog              # Finnish blog
├── /products          # Finnish products (L&L, Legenda)
├── /letl              # Finnish L&L content
└── /letl/srd          # Bilingual SRD (shared)

/en/                   # International Market
├── /en/blog           # English blog
├── /en/products       # International products (The Quick, Hood)
└── /en/the-quick      # English product pages
```

**Content Collections:**

```typescript
// src/content.config.ts
export const collections = {
  blog: blogFi,              // Finnish blog posts
  "blog-en": blogEn,         // English blog posts
  products: productsFi,      // Finnish market products
  "products-en": productsEn, // International products
  lnlsrd: srdShared,         // Shared bilingual content
};
```

**Component Reuse Pattern:**

```
Shared Base Components (language-agnostic)
├── BaseHead.astro (with locale prop)
├── Page.astro (Finnish layout)
└── EnPage.astro (English layout)

Shared Feature Components (with collection prop)
├── BlogIndex.astro (accepts collection name)
├── ProductListing.astro (accepts collection name)
└── ContentWrapper.astro (theme-agnostic)

Market-Specific Components
├── TopNav.astro (Finnish navigation)
├── en/EnTopNav.astro (English navigation)
├── SiteFooter.astro (Finnish footer)
└── en/EnSiteFooter.astro (English footer)
```

### Anti-Patterns

<rules>
<rule id="no-forced-translation">
NEVER assume content should be translated between markets.
Products in one market may not exist in the other. This is market segmentation, not localization.
</rule>

<rule id="no-astro-i18n">
DO NOT use Astro's built-in i18n routing for this use case.
Astro i18n assumes identical content across locales. We have fundamentally different catalogs.
</rule>

<rule id="no-duplicate-components">
AVOID duplicating components when props can differentiate behavior.
Use collection name props (`blog` vs `blog-en`) instead of separate components.
</rule>

<rule id="shared-content-clarity">
For truly shared content (like SRD), provide clear language access without assuming translation.
The SRD is bilingual content, not translated content.
</rule>
</rules>

## Contract (Quality)

### Definition of Done

- [ ] Finnish market (`/`) serves Finnish content collections
- [ ] International market (`/en/`) serves English content collections
- [ ] Shared components accept collection names as props
- [ ] No duplicate component logic between FI/EN variants
- [ ] SEO meta tags use correct language codes (`lang="fi"` vs `lang="en"`)
- [ ] URLs are market-specific, not language-prefixed translations
- [ ] Bilingual content (SRD) is accessible from both markets

### Regression Guardrails

<invariants>
<invariant id="market-independence">
Finnish and English routes MUST serve independent product catalogs.
Violation breaks market segmentation strategy and user expectations.
</invariant>

<invariant id="no-automatic-redirects">
NEVER auto-redirect users based on browser language.
Finnish users may want English products; English users may want Finnish products.
</invariant>

<invariant id="seo-language-tags">
HTML lang attribute MUST match content language:
- `/` pages → lang="fi"
- `/en/` pages → lang="en"
Violation harms search engine indexing and accessibility.
</invariant>

<invariant id="canonical-urls">
Each market's content MUST have unique canonical URLs.
DO NOT use hreflang alternate tags (content is not equivalent).
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: Market-Based Content Separation

  Scenario: Finnish user browsing Finnish market
    Given a user visits /
    When they navigate to /blog
    Then they see Finnish blog posts from "blog" collection
    And they see Finnish products from "products" collection

  Scenario: International user browsing English market
    Given a user visits /en/
    When they navigate to /en/blog
    Then they see English blog posts from "blog-en" collection
    And they see international products from "products-en" collection

  Scenario: Finnish user accessing international products
    Given a bilingual Finnish user
    When they visit /en/the-quick
    Then they can read English product content
    And no translation is offered (content is intentionally English)

  Scenario: Shared bilingual content (SRD)
    Given the L&L SRD contains bilingual content
    When accessed from /letl/srd
    Then content is available in its original language
    And no language switching is needed (already bilingual)

  Scenario: Component reuse with different collections
    Given BlogIndex.astro component
    When used on / with collection="blog"
    Then it shows Finnish posts
    When used on /en/ with collection="blog-en"
    Then it shows English posts

  Scenario: SEO metadata per market
    Given a page at /blog/some-post
    Then <html lang="fi">
    And meta description in Finnish
    And canonical URL is https://myrrys.com/blog/some-post
    Given a page at /en/blog/some-post
    Then <html lang="en">
    And meta description in English
    And canonical URL is https://myrrys.com/en/blog/some-post
```

## Implementation Files

### Core Configuration

| File | Responsibility |
|------|----------------|
| `src/content.config.ts` | Defines separate collections per market |
| `src/layouts/Page.astro` | Finnish market layout (`lang="fi"`) |
| `src/layouts/EnPage.astro` | English market layout (`lang="en"`) |

### Shared Components (Reusable)

| File | Props | Usage |
|------|-------|-------|
| `src/components/blog/BlogIndex.astro` | `collection: string, tag?: string, limit?: number` | Shows posts from specified collection |
| `src/components/base/BaseHead.astro` | `title, description, image, locale?: string` | Meta tags with language support |

### Market-Specific Components

| File | Market | Purpose |
|------|--------|---------|
| `src/components/base/TopNav.astro` | Finnish | Finnish navigation |
| `src/components/en/EnTopNav.astro` | English | English navigation |
| `src/components/base/SiteFooter.astro` | Finnish | Finnish footer |
| `src/components/en/EnSiteFooter.astro` | English | English footer |

### Routes

| Route | Market | Content |
|-------|--------|---------|
| `/` | Finnish | Homepage with Finnish products |
| `/blog/*` | Finnish | Finnish blog |
| `/letl/*` | Finnish | L&L Finnish pages |
| `/en/` | English | English homepage |
| `/en/blog/*` | English | English blog |
| `/en/the-quick/*` | English | The Quick (English product) |

## UI Strings (Minimal)

For the few UI elements needing translation:

```typescript
// src/i18n/strings.ts
export const strings = {
  fi: {
    readMore: "Lue lisää",
    latestPosts: "Uusimmat artikkelit",
    latestProducts: "Uusimmat tuotteet",
    backToHome: "Takaisin etusivulle",
  },
  en: {
    readMore: "Read more",
    latestPosts: "Latest posts",
    latestProducts: "Latest products",
    backToHome: "Back to home",
  },
};

// Usage in component
---
interface Props {
  locale?: "fi" | "en";
}
const { locale = "fi" } = Astro.props;
const t = strings[locale];
---

<a href={locale === "en" ? "/en/" : "/"}>{t.backToHome}</a>
```

## Migration Path

### Phase 1: Extract Collection Names (Current → Flexible)

**Before:**
```astro
---
// BlogIndex.astro
const posts = await getCollection("blog");
---
```

**After:**
```astro
---
interface Props {
  collection: "blog" | "blog-en";
}
const { collection } = Astro.props;
const posts = await getCollection(collection);
---
```

### Phase 2: Create English Collections

```typescript
// src/content.config.ts
const blogEn = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/blog-en" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
  }),
});

const productsEn = defineCollection({
  loader: glob({ pattern: ["*.md"], base: "src/products-en" }),
  schema: z.object({
    title: z.string(),
    brand: z.string(),
    description: z.string(),
    // ... same schema as products
  }),
});

export const collections = {
  blog,
  "blog-en": blogEn,
  products,
  "products-en": productsEn,
  lnlsrd,
};
```

### Phase 3: Refactor Duplicate Components

**Merge these pairs:**
- `TopNav.astro` + `en/EnTopNav.astro` → Add locale prop
- `SiteFooter.astro` + `en/EnSiteFooter.astro` → Add locale prop

**Keep separate:**
- `Page.astro` (lang="fi") vs `EnPage.astro` (lang="en") — different HTML lang

### Phase 4: Update Routes

```astro
// src/pages/en/blog/index.astro
---
import EnPage from "@layouts/EnPage.astro";
import BlogIndex from "@components/blog/BlogIndex.astro";
---

<EnPage title="Blog">
  <main class="content-grid">
    <section>
      <h1>Blog</h1>
      <BlogIndex collection="blog-en" />
    </section>
  </main>
</EnPage>
```

## Decision Log

### Why Not Astro i18n?

**Decision:** Use market-based routes instead of Astro's i18n routing.

**Reasoning:**
1. Different product catalogs per market (not translations)
2. Finnish audience consumes English content natively
3. Simpler mental model (market = route prefix)
4. Avoids complexity of syncing non-equivalent content

**Trade-offs:**
- ✅ Clearer market segmentation
- ✅ Independent content management
- ❌ Slightly more manual route setup
- ❌ No built-in language switching (intentional)

### Why Separate Collections?

**Decision:** Use `blog` and `blog-en` instead of shared collection with `locale` field.

**Reasoning:**
1. Content fundamentally different (not translations)
2. Simpler queries (no filtering needed)
3. Clearer separation of concerns
4. Easier content management (separate directories)

**Trade-offs:**
- ✅ Type safety per collection
- ✅ No accidental mixing
- ❌ Schema duplication (mitigated with shared schema objects)

## Future Considerations

### If Swedish Support Needed

Add third market:

```
/sv/                   # Swedish Market
├── /sv/blog           # Swedish blog
└── /sv/products       # Swedish products
```

Same pattern: separate collections, shared components with props.

### If Product Overlap Increases

If more products become truly multilingual:

1. Create `products-shared` collection
2. Add `languages: string[]` field
3. Render in both markets with appropriate language tags

### Cross-Market Navigation

**Currently:** No cross-market links (intentional).

**If needed:**
```astro
<!-- Only show if equivalent content exists -->
{hasEnglishVersion && (
  <a href={`/en${Astro.url.pathname}`}>View in English</a>
)}
```
