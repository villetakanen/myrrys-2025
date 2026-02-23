# Spec: RSS Feed Content Pipeline

## Blueprint (Design)

### Context

> **Goal:** Ensure the Blog RSS feed accurately reflects the HTML structure intended by the Astro remark pipeline, specifically `remarkSrdLinks`.
> **Why:** The current `/blog/rss.xml` output skips the remark plugins configured in `astro.config.mjs` by parsing raw markdown directly with `markdown-it`. This leads to broken relative links for SRD content inside RSS readers.
> **Architectural Impact:** Modifies `src/pages/blog/rss.xml.ts` to use Astro's internal `experimental_AstroContainer` API, applying project-level remark and rehype plugins inherently.

### Architecture

We will replace the standalone markdown parser with Astro's built-in container API to render the content collection entry identically to the site.

**Approach:**
1. Remove `markdown-it`.
2. Import `render` from `astro:content` and `experimental_AstroContainer` from `astro/container`.
3. Use the Container API to render the `<Content />` component to a raw HTML string.

```typescript
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';

const container = await AstroContainer.create();
const { Content } = await render(post);
const htmlString = await container.renderToString(Content);
```


### Anti-Patterns

<rules>
<rule id="no-raw-markdown-render">
NEVER bypass project-level Markdown plugins (`remark`/`rehype`) when translating Markdown content to HTML for syndication or export paths (like RSS feeds).
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] `src/pages/blog/rss.xml.ts` processes content through `remarkSrdLinks`.
- [ ] No raw `markdown-it` usage for simple markdown rendering in the RSS endpoint unless it includes preprocessing hooks equivalent to the Astro pipeline.
- [ ] RSS XML builds successfully during `pnpm build`.
- [ ] Links inside the RSS feed pointing to SRD items are transformed accurately.

### Regression Guardrails

<invariants>
<invariant id="rss-valid-xml">
The RSS feed must remain valid XML and load without runtime errors.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: RSS Feed Remark Plugins

  Scenario: Processing SRD Links in RSS
    Given a Blog post containing a markdown link `[Spell](/loitsut/fireball)`
    When the RSS generator builds the feed
    Then the `content` element of the RSS item should compile the link correctly transformed by `remarkSrdLinks`.
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/pages/blog/rss.xml.ts` | The API endpoint that generates the RSS XML payload. |

---

## Decision Log

### Removing external Markdown parser

**Decision:** We will replace `markdown-it` (and avoid `unified`) by using Astro's `experimental_AstroContainer`.

**Reasoning:**
1. `experimental_AstroContainer` guarantees 1-to-1 parity with the webpage renders by inhering the configuration from `astro.config.mjs` natively.
2. Removes multiple dependencies from `package.json` (`markdown-it` and its types).
3. Utilizes Astro's internal ecosystem exactly for rendering components to string from an endpoint.
