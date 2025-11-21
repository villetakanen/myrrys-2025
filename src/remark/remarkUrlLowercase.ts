import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Lowercase URLs in Markdown links and add /letl/srd/ prefix for relative links.
 */
export const remarkUrlLowercase: Plugin = () => {
  return (tree, file) => {
    const filePath = file?.history?.[0] || "";
    // Normalize path separators to forward slashes for consistency
    const normalizedFilePath = filePath.split("\\").join("/");

    // Check if this is SRD content
    const isSrd = normalizedFilePath.includes("/LnL-SRD/") || normalizedFilePath.includes("/lnlsrd/");

    let srdRelativeDir = "";
    if (isSrd) {
      // Find the part of the path after LnL-SRD (or lnlsrd)
      const marker = normalizedFilePath.includes("/LnL-SRD/") ? "/LnL-SRD/" : "/lnlsrd/";
      const parts = normalizedFilePath.split(marker);
      if (parts.length > 1) {
        // Get the directory of the current file relative to SRD root
        const fileRelativePath = parts[1];
        const lastSlashIndex = fileRelativePath.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          srdRelativeDir = fileRelativePath.substring(0, lastSlashIndex);
        }
      }
    }

    visit(tree as Root, "link", (node) => {
      if (!node.url) return;

      // Skip external links, anchors, and PDFs (unless we want to lowercase PDFs too, but usually files are case sensitive or we want to preserve it)
      // Requirement: "all other urls should be lower case (unless they relate to downloads, like pdf's)"
      if (
        !node.url.startsWith("http") &&
        !node.url.startsWith("#") &&
        !node.url.endsWith(".pdf")
      ) {
        // Handle relative links in SRD content
        if (isSrd && !node.url.startsWith("/")) {
          // It's a relative link
          // Combine srdRelativeDir with the link url
          // We need to resolve ".." and "."
          // Since we don't have 'path' module easily available in all environments without setup, 
          // and this is a simple path resolution, we can do a basic join.
          // However, 'path' module IS standard in Node.js where Remark runs. 
          // But let's try to do it with string manipulation to be safe or use a simple resolver if needed.
          // Actually, let's use a simple array reduction for path resolution to be robust.

          const parts = [...(srdRelativeDir ? srdRelativeDir.split("/") : []), ...node.url.split("/")];
          const resolvedParts: string[] = [];

          for (const part of parts) {
            if (part === "." || part === "") continue;
            if (part === "..") {
              resolvedParts.pop();
            } else {
              resolvedParts.push(part);
            }
          }

          const resolvedPath = resolvedParts.join("/");
          node.url = `/letl/srd/${resolvedPath}`;
        } else if (isSrd && node.url.startsWith("/")) {
          // If it is absolute path, we assume it is already correct or relative to site root.
          // But if the user meant "absolute path within the project", we might need to adjust.
          // Standard markdown behavior: /foo means root of the site.
          // So we just leave it alone or lowercase it.
        }

        // Lowercase the URL
        node.url = node.url.toLowerCase();
      }
    });
  };
};
