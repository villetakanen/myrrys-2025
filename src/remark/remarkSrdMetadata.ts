import type { Root, RootContent } from "mdast";
import { toString as nodeText } from "mdast-util-to-string";
import type { Plugin } from "unified";

/**
 * Derives per-page SEO metadata for SRD documents from their own content.
 *
 * The LnL-SRD submodule is a shared upstream document that does not carry
 * site-specific frontmatter, so `title` and `description` cannot come from the
 * collection schema — they are extracted here and handed to the SRD route
 * through Astro's `remarkPluginFrontmatter`.
 *
 *   title       the text of the document's leading heading, which is also
 *               removed so the route can render it as the page <h1> without
 *               it appearing twice
 *   description the first MAX_DESCRIPTION characters of the remaining body,
 *               flattened to plain text
 *
 * Applies only to files under LnL-SRD/ — Astro runs remark plugins against
 * every markdown source, so the same path guard remarkSrdLinks uses applies
 * here. See docs/reports/seo-audit-2026-07-27.md, findings #1 and #2.
 */

/** Google truncates SERP snippets around here. */
export const MAX_DESCRIPTION = 160;

/** True when the file being processed belongs to the SRD submodule. */
export function isSrdFile(filePath: string): boolean {
  return /(^|\/)LnL-SRD\//i.test(filePath.replace(/\\/g, "/"));
}

/**
 * Removes a leading heading node from an mdast tree, in place, and returns its
 * text. Returns null when the document does not open with a heading.
 *
 * Only the *first* node is considered: a document that opens with prose is left
 * untouched. Headings deeper in the document are never removed, so section
 * hierarchy is preserved. Depth is deliberately not checked — 319 of the 348
 * SRD documents open at `###`, because each spell is authored as a fragment of
 * a larger book.
 */
export function takeLeadingHeading(tree: Root): string | null {
  const first = tree.children[0];
  if (first?.type !== "heading") return null;
  tree.children.shift();
  return nodeText(first);
}

/** Collapses every run of whitespace — hard breaks included — to one space. */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Flattens one block node to text.
 *
 * `nodeText` concatenates sibling children with no separator, which turns a
 * link list into "AjatustenvaihtoElvytysHidastus" and a table row into a run of
 * jammed-together cells. Lists and tables carry real content on the SRD's index
 * pages, so their parts are joined explicitly instead.
 */
function blockText(node: RootContent): string {
  if (node.type === "list") {
    return node.children
      .map((item) => normalizeWhitespace(nodeText(item)))
      .filter(Boolean)
      .join(", ");
  }
  if (node.type === "table") {
    return node.children
      .map((row) =>
        row.children
          .map((cell) => normalizeWhitespace(nodeText(cell)))
          .filter(Boolean)
          .join(" "),
      )
      .filter(Boolean)
      .join(", ");
  }
  return normalizeWhitespace(nodeText(node));
}

/**
 * Truncates to at most MAX_DESCRIPTION characters on a word boundary and
 * appends an ellipsis. Shorter input is returned unchanged.
 */
function truncate(text: string): string {
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[,;:.]+$/, "")}…`;
}

/**
 * Flattens the tree into a plain-text summary. Call *after* takeLeadingHeading,
 * or the description leads with the title it is already the title of.
 *
 * Every remaining block contributes its text, tables and lists included — that
 * is what keeps the spell-circle index pages and the table of contents, which
 * are little more than link lists, above the 70-character snippet floor.
 *
 * No attempt is made to skip the stat block that opens a spell page
 * (`*3-piirin luominen*`, `**Kantama:** 60 metriä`, …). It reads repetitively
 * but is unique on all 348 pages, and the naive rule needs no per-document
 * special cases.
 *
 * The scan stops at the first thematic break: 329 documents end with a `----`
 * rule followed by Ylätaso/Edellinen/Seuraava links, which are chrome.
 */
export function deriveDescription(tree: Root): string {
  const parts: string[] = [];
  let length = 0;

  for (const node of tree.children as RootContent[]) {
    if (node.type === "thematicBreak") break;
    const text = blockText(node);
    if (!text) continue;
    parts.push(text);
    length += text.length + 1;
    if (length >= MAX_DESCRIPTION) break;
  }

  return truncate(normalizeWhitespace(parts.join(" ")));
}

export const remarkSrdMetadata: Plugin<[], Root> = () => {
  return (tree, file) => {
    const filePath = file.path || file.history?.[0] || "";
    if (!isSrdFile(filePath)) return;

    // Astro seeds this before running the pipeline and reads it back out as
    // `remarkPluginFrontmatter`. The guards are for unit tests that call the
    // plugin directly with a bare vfile.
    const data = file.data as {
      astro?: { frontmatter?: Record<string, unknown> };
    };
    data.astro ??= {};
    data.astro.frontmatter ??= {};

    const title = takeLeadingHeading(tree);
    if (title) data.astro.frontmatter.title = title;

    const description = deriveDescription(tree);
    if (description) data.astro.frontmatter.description = description;
  };
};
