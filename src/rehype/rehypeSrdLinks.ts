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
    const fileData = file?.data as Record<string, unknown> | undefined;

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

    // Extract the folder path from the current file with multiple strategies
    let folderPath = "";

    // Strategy 1: Match "LnL-SRD/FolderName/filename.md"
    let match = normalizedPath.match(/LnL-SRD\/([^/]+)\/[^/]+\.md/i);
    if (match) {
      folderPath = match[1].toLowerCase();
    }

    // Strategy 2: Match any path after LnL-SRD that has a subfolder
    if (!folderPath) {
      match = normalizedPath.match(/LnL-SRD\/([^/]+)\//i);
      if (match) {
        folderPath = match[1].toLowerCase();
      }
    }

    // Strategy 3: Try to extract from Astro's internal data
    if (!folderPath && fileData) {
      const astroData = fileData.astro as Record<string, unknown> | undefined;
      if (astroData && typeof astroData === "object") {
        // Try various possible properties where Astro might store the path
        const possiblePaths = [
          astroData.filePath,
          astroData.sourcePath,
          astroData.id,
        ];

        for (const path of possiblePaths) {
          if (typeof path === "string") {
            const pathMatch = path.match(/LnL-SRD\/([^/]+)\//i);
            if (pathMatch) {
              folderPath = pathMatch[1].toLowerCase();
              break;
            }
          }
        }
      }
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
            // Lowercase the URL
            const lowercaseUrl = href.toLowerCase();

            // If the link doesn't contain a slash and we have a folder path,
            // it's a link to another file in the same folder
            if (folderPath && !lowercaseUrl.includes("/")) {
              node.properties.href = `/letl/srd/${folderPath}/${lowercaseUrl}`;
            } else {
              // Otherwise, it's either a cross-folder link or root-level
              // Just add the prefix
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
