# SRD Link Handling Spec

## Blueprint (Design)

### Context

The Systems Reference Document (SRD) content lives in the `LnL-SRD` git submodule at project root. This content is built into the site under the `/letl/srd/` path. The SRD markdown files use relative links for portability, but the final site requires absolute, lowercase URLs that work on case-sensitive hosting environments (Netlify/Linux).

### Architecture

Two-stage plugin pipeline processes SRD links:

```
Markdown Source → [Remark Plugin] → MDAST → [Rehype Plugin] → HAST → HTML
                      ↓                          ↓
              remarkSrdLinks.ts          rehypeSrdLinks.ts
              remarkUrlLowercase.ts      rehypeSrdLinksWithContext.ts
```

**Stage 1: Remark (Markdown AST)**
- `src/remark/remarkSrdLinks.ts` — Converts relative SRD links to absolute paths
- `src/remark/remarkUrlLowercase.ts` — Lowercases URLs and adds `/letl/srd/` prefix

**Stage 2: Rehype (HTML AST)**
- `src/rehype/rehypeSrdLinks.ts` — Post-processing cleanup
- `src/rehype/rehypeSrdLinksWithContext.ts` — Context-aware link resolution

**URL Generation:**
- `src/pages/letl/srd/[...id].astro` — Forces page IDs to lowercase via `post.id.toLowerCase()`

### Anti-Patterns

<rules>
<rule id="no-hardcoded-prefix">
NEVER hardcode `/letl/srd/` prefixes in LnL-SRD markdown source files.
The plugin handles mapping automatically. Hardcoding breaks portability of the submodule.
</rule>

<rule id="no-manual-case-conversion">
NEVER manually convert link cases in markdown content.
The plugin pipeline handles all case normalization automatically.
</rule>

<rule id="no-absolute-internal-links">
AVOID absolute internal paths in SRD markdown (e.g., `/letl/srd/spells.md`).
Use relative paths (e.g., `../loitsut/spells.md`) to maintain submodule portability.
</rule>
</rules>

## Contract (Quality)

### Definition of Done

- [ ] All generated SRD page URLs are lowercase
- [ ] Relative links in SRD source resolve correctly to `/letl/srd/*` paths
- [ ] Internal absolute paths (starting with `/`) are lowercased
- [ ] External URLs (starting with `http`) are preserved unchanged
- [ ] PDF download links retain original case (file system sensitivity)

### Regression Guardrails

<invariants>
<invariant id="lowercase-urls">
All HTML href attributes pointing to /letl/srd/* MUST be lowercase.
Violation causes 404 errors on case-sensitive Linux hosts (Netlify).
</invariant>

<invariant id="pdf-exception">
Links ending in .pdf MUST NOT be lowercased.
Violation breaks PDF downloads on case-sensitive file systems.
</invariant>

<invariant id="submodule-portability">
LnL-SRD content MUST work independently of this site's URL structure.
Violation prevents the SRD from being used in other contexts.
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: SRD Link Resolution

  Scenario: Relative link to sibling file
    Given a markdown file at LnL-SRD/loitsut/fire.md
    And it contains a link [Ice](ice.md)
    When the page is built
    Then the href should be /letl/srd/loitsut/ice

  Scenario: Relative link to parent directory
    Given a markdown file at LnL-SRD/loitsut/fire.md
    And it contains a link [Home](../readme.md)
    When the page is built
    Then the href should be /letl/srd/readme

  Scenario: Mixed case in source
    Given a markdown file contains [Link](../Spells/FireBall.md)
    When the page is built
    Then the href should be /letl/srd/spells/fireball

  Scenario: PDF download link
    Given a markdown file contains [Download](../downloads/CharSheet.PDF)
    When the page is built
    Then the href should preserve case: /letl/srd/downloads/CharSheet.PDF

  Scenario: External URL
    Given a markdown file contains [Myrrys](https://myrrys.com)
    When the page is built
    Then the href should be unchanged: https://myrrys.com
```

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/remark/remarkSrdLinks.ts` | Resolve relative paths to absolute |
| `src/remark/remarkUrlLowercase.ts` | Lowercase URLs, add /letl/srd/ prefix |
| `src/rehype/rehypeSrdLinks.ts` | HTML-level link cleanup |
| `src/rehype/rehypeSrdLinksWithContext.ts` | Context-aware resolution |
| `src/pages/letl/srd/[...id].astro` | Lowercase page ID generation |
| `astro.config.mjs` | Plugin registration, URL redirects |
