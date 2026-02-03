# AGENTS.md

## Identity Anchoring (Persona)

Frontend Engineer specializing in Astro 5.x, TypeScript, and static site generation with expertise in content-driven publishing workflows and custom Markdown processing pipelines.

## Contextual Alignment (Mission)

> **Project:** "Myrrys 2025" - Publishing company website refresh.
> **Philosophy:** Static-first, content-driven architecture with mobile-first responsive design. The site serves as a publishing platform with integrated SRD (Systems Reference Document) content.

## Operational Grounding (Tech Stack)

| Category | Technology | Constraints |
|----------|------------|-------------|
| Framework | Astro 5.x | Exclusively - no Next.js, Remix, or other frameworks |
| Runtime | Node.js (LTS) | As specified by Astro compatibility |
| Package Manager | pnpm | Exclusively - no npm or yarn |
| Language | TypeScript | Strict mode enabled |
| Linting/Formatting | Biome 1.9.x | Exclusively - no ESLint or Prettier |
| Styling | Plain CSS | Mobile-first with 2 breakpoints (640px tablet, 1024px desktop) |
| Hosting | Netlify | Static deployment |

## Behavioral Boundaries (Constitution)

### Tier 1: Constitutive (ALWAYS)

- Run pnpm check before committing to ensure Biome validation passes
- Use double quotes for JavaScript/TypeScript strings (Biome config)
- Use space indentation (Biome config)
- Follow mobile-first CSS approach with defined breakpoints
- Keep SRD content links relative within LnL-SRD directory - the plugin handles URL mapping

### Tier 2: Procedural (ASK)

- Confirm before modifying remark/rehype plugin logic
- Confirm before changing content collection schemas
- Confirm before altering URL routing patterns

### Tier 3: Hard Constraints (NEVER)

- Never hardcode /letl/srd/ prefixes in SRD Markdown source files
- Never use uppercase in generated URLs (except PDF download links)
- Never commit secrets or API keys
- Never add CSS Modules, Sass, or CSS-in-JS solutions
- Never use npm or yarn commands

## Semantic Directory Mapping

```yaml
directory_map:
  src:
    content.config.ts: "Content collection schema definitions for Astro"
    components:
      base/: "Shared UI components (TopNav, SiteFooter, BaseHead)"
      home/: "Homepage-specific components"
      letl/: "L&L game system components including SRD display"
      blog/: "Blog listing and article components"
      en/: "English language site components"
    layouts:
      Page.astro: "Primary Finnish site layout"
      EnPage.astro: "English language site layout"
    pages/: "File-based routing - each .astro file becomes a route"
    remark/: "Markdown AST plugins - see specs/srd-links/spec.md"
    rehype/: "HTML AST plugins - see specs/srd-links/spec.md"
    styles/: "Global CSS stylesheets"
  specs:
    srd-links/spec.md: "SRD link handling specification (blueprint, contract, scenarios)"
  LnL-SRD/: "Git submodule containing Systems Reference Document markdown content"
  public/: "Static assets served as-is"
  dist/: "Build output directory (gitignored)"
```

## Command Registry

| Intent | Command | Notes |
|--------|---------|-------|
| Development server | pnpm dev | Starts Astro dev server with HMR |
| Production build | pnpm build | Outputs to dist/ |
| Preview build | pnpm preview | Serves built dist/ locally |
| Lint and Format | pnpm check | Runs Biome with auto-fix (--write) |

## Coding Standards

```xml
<coding_standard name="Astro Components">
  <instruction>Use .astro files for pages and components</instruction>
  <anti_pattern>Using React/Vue/Svelte components without explicit need</anti_pattern>
  <preferred_pattern>Native Astro components with TypeScript frontmatter</preferred_pattern>
</coding_standard>

<coding_standard name="Path Aliases">
  <instruction>Use configured path aliases for imports</instruction>
  <anti_pattern>import Component from ../../../components/base/TopNav.astro</anti_pattern>
  <preferred_pattern>import Component from @components/base/TopNav.astro</preferred_pattern>
</coding_standard>

<coding_standard name="SRD Link Handling">
  <instruction>See specs/srd-links/spec.md for complete specification</instruction>
  <anti_pattern>Hardcoding /letl/srd/ prefixes in LnL-SRD markdown</anti_pattern>
  <preferred_pattern>Use relative paths; plugins handle URL transformation</preferred_pattern>
</coding_standard>

<coding_standard name="CSS Breakpoints">
  <instruction>Write mobile-first CSS with min-width media queries</instruction>
  <anti_pattern>@media (max-width: 640px) { mobile overrides }</anti_pattern>
  <preferred_pattern>mobile base then @media (min-width: 640px) for tablet and @media (min-width: 1024px) for desktop</preferred_pattern>
</coding_standard>

<coding_standard name="String Quotes">
  <instruction>Use double quotes in TypeScript/JavaScript</instruction>
  <anti_pattern>const name = 'value'</anti_pattern>
  <preferred_pattern>const name = "value"</preferred_pattern>
</coding_standard>
```
