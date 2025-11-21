import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add /letl/srd/ prefix to internal links in SRD content.
 * This works on the HTML AST after markdown has been converted, making it more reliable.
 * Preserves folder structure for relative links.
 */
export const rehypeSrdLinks: Plugin = () => {
  return (tree, file) => {
    // Try to detect if this is SRD content
    const filePath = file?.history?.[0] || file?.path || "";

    // Normalize path separators for cross-platform compatibility
    const normalizedPath = filePath.replace(/\\/g, "/");

    // Check if this is SRD content
    const isSrdContent =
      normalizedPath.includes("LnL-SRD") ||
      normalizedPath.includes("lnlsrd") ||
      normalizedPath.match(/[\/\\]LnL-SRD[\/\\]/i);

    if (!isSrdContent) {
      return; // Not SRD content, skip processing
    }

    // Extract the folder path from the current file
    // e.g., "LnL-SRD/Loitsut/8_piirin_loitsut.md" -> "loitsut"
    const srdMatch = normalizedPath.match(/LnL-SRD\/([^/]+)\//i);
    const folderPath = srdMatch ? srdMatch[1].toLowerCase() : "";

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
            // Lowercase the URL
            const lowercaseUrl = href.toLowerCase();

            // If the link doesn't contain a slash and we have a folder path,
            // it's in the same folder
            if (folderPath && !lowercaseUrl.includes("/")) {
              node.properties.href = `/letl/srd/${folderPath}/${lowercaseUrl}`;
            } else {
              // Otherwise, just add the prefix
              node.properties.href = `/letl/srd/${lowercaseUrl}`;
            }
          } else if (href?.startsWith("/") && !href.startsWith("http")) {
            // Just lowercase absolute internal links
            node.properties.href = href.toLowerCase();
          }
        }
      },
    );
  };
};
