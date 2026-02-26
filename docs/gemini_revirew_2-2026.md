# Astro Project Review - myrrys-2025 (Feb 2026)

This document contains a codebase review of the `myrrys-2025` project against the official Astro documentation (specifically focusing on Astro 5 features and best practices).

## ✅ What is done well (Astro 5 Best Practices)

1. **Content Layer API (Astro 5)**:
   - The project has correctly migrated to the new Astro 5 Content Layer by using `src/content.config.ts` instead of `config.ts`.
   - Collections are properly defined using `loader: glob(...)` from `astro/loaders`.
   - Data rendering correctly uses the new `render(post)` API imported from `astro:content`, rather than the deprecated Astro 4 `post.render()` component method.

2. **Routing & Dynamic Pages**:
   - The project uses `[id].astro` for dynamic routing instead of `[...slug].astro`, correctly adopting the Astro 5 pattern where `id` replaces `slug`.
   - `getStaticPaths` correctly returns `params: { id: post.id }`.

3. **View Transitions API**:
   - `src/components/base/BaseHead.astro` implements page transitions using the modern `<ClientRouter />` component from `astro:transitions`, which is the correct Astro 5 replacement for the deprecated `<ViewTransitions />`.

4. **Styling & CSS**:
   - The project utilizes `lightningcss` as the Vite CSS transformer (`astro.config.mjs`), which is modern and highly performant for handling CSS nesting and minification without PostCSS overhead.
   - Global CSS imports follow the recommended pattern.

5. **Tooling & Settings**:
   - `tsconfig.json` extends `astro/tsconfigs/strict` and correctly includes `.astro/types.d.ts`.
   - The site configuration utilizes trailing slash ignore and correctly wires up `@astrojs/sitemap`.

---

## ⚠️ Issues and Areas for Improvement

### 1. Template Literal / String Concatenation Bug in `[id].astro`
In `src/pages/blog/[id].astro`, the `<main>` tag's class attribute is evaluated incorrectly if the theme is omitted:

```astro
<main class={post.data.theme + " content-grid" || "content-grid"}>
```
**Issue**: Since `post.data.theme` is optional in the Zod schema, it can be `undefined`. In JavaScript, `undefined + " content-grid"` evaluates to the string `"undefined content-grid"`. Since this string is truthy, the fallback `"content-grid"` is never used, resulting in an invalid CSS class name `undefined` being injected into the DOM.

**Fix**:
Change the class assignment to cleanly handle the optional theme, for example:
```astro
<main class={[post.data.theme, "content-grid"].filter(Boolean).join(" ")}>
```
Or using template literals:
```astro
<main class={post.data.theme ? `${post.data.theme} content-grid` : "content-grid"}>
```

### 2. Empty Schema Validation for Content Collections
In `src/content.config.ts`, the `lnlsrd` collection uses an empty Zod object for its schema:
```typescript
const lnlsrd = defineCollection({
  loader: glob({ pattern: ["**/*.md"], base: "LnL-SRD" }),
  schema: z.object({}),
});
```
**Feedback**: While technically valid, an empty `z.object({})` provides no validation benefits. If these markdown files do not have consistent frontmatter, you can safely omit the `schema` property entirely. Alternatively, if they do use frontmatter, you should define those properties to benefit from Astro's type safety.

### 3. Redundant Dependencies (Potential)
The `package.json` includes `markdown-it` and `sanitize-html`. Since Astro handles markdown rendering internally via Remark/Rehype (and custom remark plugins like `remarkSrdLinks` are already present), explicit dependencies on `markdown-it` are typically unnecessary unless they are used for custom parsing logic outside the Astro build pipeline or for client-side processing. Consider evaluating if they can be removed to reduce dependency weight.
