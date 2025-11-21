import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Lowercase URLs in Markdown links and add /letl/srd/ prefix for SRD content.
 * Preserves folder structure for relative links.
 */
export const remarkUrlLowercase: Plugin = () => {
  return (tree, file) => {
    visit(tree as Root, "link", (node) => {
      if (
        node.url &&
        !node.url.startsWith("http") &&
        !node.url.startsWith("/") &&
        !node.url.startsWith("#") &&
        !node.url.endsWith(".pdf")
      ) {
        // Lowercase the URL first
        const lowercaseUrl = node.url.toLowerCase();

        // Try to detect if this is SRD content from file path
        const filePath = file?.history?.[0] || file?.path || "";

        // Normalize path separators for cross-platform compatibility
        const normalizedPath = filePath.replace(/\\/g, "/");

        // Check if this is SRD content
        const isSrdContent =
          normalizedPath.includes("LnL-SRD") ||
          normalizedPath.includes("lnlsrd") ||
          normalizedPath.match(/[\/\\]LnL-SRD[\/\\]/i);

        if (isSrdContent) {
          // Extract the folder path from the current file
          // e.g., "LnL-SRD/Loitsut/8_piirin_loitsut.md" -> "loitsut"
          const srdMatch = normalizedPath.match(/LnL-SRD\/([^/]+)\//i);
          const folderPath = srdMatch ? srdMatch[1].toLowerCase() : "";

          // If the link doesn't contain a slash, it's in the same folder
          if (folderPath && !lowercaseUrl.includes("/")) {
            node.url = `/letl/srd/${folderPath}/${lowercaseUrl}`;
          } else {
            // Otherwise, just add the prefix
            node.url = `/letl/srd/${lowercaseUrl}`;
          }
        } else {
          // Just lowercase for other content
          node.url = lowercaseUrl;
        }
      } else if (
        node.url?.startsWith("/") &&
        !node.url.startsWith("http") &&
        !node.url.endsWith(".pdf")
      ) {
        // For absolute internal links, just lowercase them
        node.url = node.url.toLowerCase();
      }
    });
  };
};
