import type { Root } from "mdast";
import type { Plugin } from "unified";

/**
 * Removes the leading heading from SRD documents.
 *
 * SRD pages render their `<h1>` from the `title` frontmatter field, so the
 * document's own opening heading would appear twice — once as the page title
 * and again as the first line of the body. This drops the duplicate.
 *
 * Only the *first* node is considered, and only when it is a heading: a
 * document that opens with prose is left untouched. Headings deeper in the
 * document are never removed, so section hierarchy is preserved.
 *
 * Applies only to files under LnL-SRD/ — Astro runs remark plugins against
 * every markdown source, so the same path guard remarkSrdLinks uses applies
 * here. See docs/reports/seo-audit-2026-07-27.md, finding #2.
 */

/** True when the file being processed belongs to the SRD submodule. */
export function isSrdFile(filePath: string): boolean {
  return /(^|\/)LnL-SRD\//i.test(filePath.replace(/\\/g, "/"));
}

/**
 * Drops a leading heading node from an mdast tree, in place.
 * Returns true when a heading was removed.
 */
export function stripLeadingHeading(tree: Root): boolean {
  const first = tree.children[0];
  if (first?.type !== "heading") return false;
  tree.children.shift();
  return true;
}

export const remarkSrdStripTitle: Plugin<[], Root> = () => {
  return (tree, file) => {
    const filePath = file.path || file.history?.[0] || "";
    if (!isSrdFile(filePath)) return;
    stripLeadingHeading(tree);
  };
};
