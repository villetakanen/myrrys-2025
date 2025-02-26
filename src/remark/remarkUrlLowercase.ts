import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Lowercase URLs in Markdown links.
 */
export const remarkUrlLowercase: Plugin = () => {
  return (tree) => {
    visit(tree as Root, "link", (node) => {
      if (
        node.url &&
        !node.url.startsWith("http") &&
        !node.url.endsWith(".pdf")
      ) {
        // if(node.url.indexOf('/') > 0) console.log("Lowercasing URL:", node.url);
        node.url = node.url.toLowerCase();
      }
    });
  };
};
