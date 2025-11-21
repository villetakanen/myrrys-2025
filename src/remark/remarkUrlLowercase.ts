import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Lowercase URLs in Markdown links and add /letl/srd/ prefix for SRD content.
 * This plugin detects SRD content reliably in both dev and build environments.
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

        // Try to detect if this is SRD content from multiple sources
        const filePath = file?.history?.[0] || file?.path || "";
        const fileData = file?.data as Record<string, unknown> | undefined;
        const collection =
          fileData &&
          typeof fileData === "object" &&
          "astro" in fileData &&
          typeof fileData.astro === "object" &&
          fileData.astro &&
          "collection" in fileData.astro
            ? fileData.astro.collection
            : undefined;

        // Normalize path separators for cross-platform compatibility
        const normalizedPath = filePath.replace(/\\/g, "/");

        // Check if this is SRD content
        const isSrdContent =
          collection === "lnlsrd" ||
          normalizedPath.includes("LnL-SRD") ||
          normalizedPath.includes("lnlsrd") ||
          normalizedPath.match(/[\/\\]LnL-SRD[\/\\]/i);

        if (isSrdContent) {
          // Add the /letl/srd/ prefix for relative links in SRD content
          node.url = `/letl/srd/${lowercaseUrl}`;
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
