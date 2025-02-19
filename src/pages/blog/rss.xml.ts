import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
const parser = new MarkdownIt();

export async function GET({ site }: APIContext) {
  if (!site) {
    throw new Error("Missing site metadata");
  }
  const blog = await getCollection("blog");
  return rss({
    title: "MYRRYS Blogi",
    description:
      "MYRRYS Blogi: Legendoja & lohikäärmeitä - ja muita pelejä pelaajilta pelaajille",
    site,
    stylesheet: "/rss/styles.xsl",
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // Compute RSS link from post `id`
      // This example assumes all posts are rendered as `/blog/[id]` routes
      content: sanitizeHtml(
        parser.render(`# ${post.data.title}\n\n${post.body}`),
      ),
      link: `/blog/${post.id}/`,
    })),
  });
}
