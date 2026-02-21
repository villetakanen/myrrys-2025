import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";
import { remarkSrdLinks } from "./src/remark/remarkSrdLinks";

// https://astro.build/config
export default defineConfig({
  site: "https://myrrys.com",
  output: "static",
  adapter: netlify(),
  image: {
    service: { entrypoint: "@astrojs/netlify/image-service" },
  },
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
    remarkPlugins: [remarkSrdLinks],
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
