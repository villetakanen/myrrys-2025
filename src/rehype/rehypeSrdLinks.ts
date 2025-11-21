import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add /letl/srd/ prefix to internal links in SRD content.
 * This works on the HTML AST after markdown has been converted, making it more reliable.
 */
export const rehypeSrdLinks: Plugin = () => {
  return (tree, file) => {
    // Try to detect if this is SRD content
    const filePath = file?.history?.[0] || file?.path || "";

    // Normalize path separators for cross-platform compatibility
    const normalizedPath = filePath.replace(/\\/g, "/");

    // Check if this is SRD content by looking at the file path
    const isSrdContent =
      normalizedPath.includes("LnL-SRD") ||
      normalizedPath.includes("lnlsrd") ||
      normalizedPath.match(/[\/\\]LnL-SRD[\/\\]/i);

    if (!isSrdContent) {
      return; // Not SRD content, skip processing
    }

    // Process all anchor tags
    visit(
      tree,
      "element",
      (node: { tagName?: string; properties?: Record<string, unknown> }) => {
        if (node.tagName === "a" && node.properties && node.properties.href) {
          const href = String(node.properties.href);

          // Only process relative links (not starting with /, http, or #)
          if (
            href &&
            !href.startsWith("/") &&
            !href.startsWith("http") &&
            !href.startsWith("#") &&
            !href.endsWith(".pdf")
          ) {
            // Lowercase and add prefix
            node.properties.href = `/letl/srd/${href.toLowerCase()}`;
          } else if (href?.startsWith("/") && !href.startsWith("http")) {
            // Just lowercase absolute internal links
            node.properties.href = href.toLowerCase();
          }
        }
      },
    );
  };
};
