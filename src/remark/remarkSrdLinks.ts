import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Remark plugin to fix SRD relative links at build time.
 * This plugin is designed to work with Astro's glob loader.
 *
 * It transforms relative links like "Antimaaginen_alue" to "/letl/srd/loitsut/antimaaginen_alue"
 * based on the file's location in the LnL-SRD directory structure.
 */
export const remarkSrdLinks: Plugin<[]> = () => {
  return (tree, file) => {
    // Extract folder from file path
    // The file.path or file.history will contain the full path to the markdown file
    let folder = "";

    const filePath = file.path || file.history?.[0] || "";

    if (filePath) {
      // Normalize path separators
      const normalizedPath = filePath.replace(/\\/g, "/");

      // Extract the folder from the path structure: LnL-SRD/{folder}/{file}.md
      // Example: /path/to/LnL-SRD/loitsut/8_piirin_loitsut.md -> "loitsut"
      const match = normalizedPath.match(/LnL-SRD\/([^\/]+)\//);
      if (match?.[1]) {
        folder = match[1].toLowerCase();
      }
    }

    // Process all link nodes in the markdown AST
    visit(tree as Root, "link", (node) => {
      if (!node.url) return;

      const url = node.url;

      // Skip external links, anchors, PDFs, and already absolute paths
      if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("#") ||
        url.endsWith(".pdf") ||
        url.startsWith("/")
      ) {
        return;
      }

      // It's a relative link - rewrite it to an absolute path
      const lowercaseUrl = url.toLowerCase();

      // If the link doesn't contain a slash and we have a folder context,
      // it's a link to another file in the same folder
      if (folder && !lowercaseUrl.includes("/")) {
        node.url = `/letl/srd/${folder}/${lowercaseUrl}`;
      } else {
        // Cross-folder link or root-level link
        node.url = `/letl/srd/${lowercaseUrl}`;
      }
    });
  };
};
