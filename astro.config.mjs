import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";
import { rehypeSrdLinks } from "./src/rehype/rehypeSrdLinks";
import { remarkUrlLowercase } from "./src/remark/remarkUrlLowercase";

// https://astro.build/config
export default defineConfig({
  site: "https://myrrys.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: {},
        include: Features.Nesting,
      },
    },
  },
  trailingSlash: "ignore",
  markdown: {
    remarkPlugins: [remarkUrlLowercase],
    rehypePlugins: [rehypeSrdLinks],
  },
  redirects: {
    "/letl/srd": "/letl/srd/readme",
    "/letl/srd/": "/letl/srd/readme",
    "/LnL-SRD/[...id]": "/letl/srd/[...id]",
    "/lnl-srd/[...id]": "/letl/srd/[...id]",
    "/legendoja-ja-lohikaarmeita": "/letl",
    "/legendoja-ja-lohikaarmeita/srd": "/letl/srd",
  },
});
