import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add /letl/srd/ prefix to internal links in SRD content.
 * This version uses the post context (ID) to determine the correct folder path.
 *
 * Usage: Pass the post ID as an option when rendering.
 * The post ID includes the folder structure (e.g., "loitsut/8_piirin_loitsut")
 */
interface RehypeSrdLinksOptions {
  postId?: string;
}

export const rehypeSrdLinksWithContext: Plugin<[RehypeSrdLinksOptions?]> = (
  options = {},
) => {
  return (tree) => {
    const postId = options.postId || "";

    // Extract folder path from post ID (e.g., "loitsut/8_piirin_loitsut" -> "loitsut")
    const parts = postId.split("/");
    const folderPath = parts.length > 1 ? parts[0].toLowerCase() : "";

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
