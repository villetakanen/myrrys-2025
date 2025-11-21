import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Lowercase URLs in Markdown links and add /letl/srd/ prefix for relative links.
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
        // Lowercase the URL
        node.url = node.url.toLowerCase();

        // Check if this is SRD content by looking at the file path
        const filePath = file?.history?.[0] || "";
        if (filePath.includes("LnL-SRD") || filePath.includes("lnlsrd")) {
          // Add the /letl/srd/ prefix for relative links in SRD content
          node.url = `/letl/srd/${node.url}`;
        }
      } else if (
        node.url &&
        !node.url.startsWith("http") &&
        !node.url.endsWith(".pdf") &&
        node.url.startsWith("/")
      ) {
        // For absolute internal links, just lowercase them
        node.url = node.url.toLowerCase();
      }
    });
  };
};
