import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { render } from "astro:content";
import sanitizeHtml from "sanitize-html";

export async function GET({ site }: APIContext) {
  if (!site) {
    throw new Error("Missing site metadata");
  }
  const blog = await getCollection("blog");
  blog.sort((a, b) => {
    return (
      new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
    );
  });
  const container = await AstroContainer.create();

  const items = await Promise.all(
    blog.map(async (post) => {
      const { Content } = await render(post);
      const renderedHtml = await container.renderToString(Content);

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
        content: sanitizeHtml(renderedHtml, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        }),
      };
    }),
  );

  return rss({
    title: "MYRRYS Blogi",
    description:
      "MYRRYS Blogi: Legendoja & lohikäärmeitä - ja muita pelejä pelaajilta pelaajille",
    site,
    stylesheet: "/rss/styles.xsl",
    items,
  });
}
