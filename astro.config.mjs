import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";
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
  },
  redirects: {
    "/letl/srd": "/letl/srd/readme",
    "/letl/srd/": "/letl/srd/readme",
    "/LnL-SRD/[...id]": "/letl/srd/[...id]",
    "/lnl-srd/[...id]": "/letl/srd/[...id]",
    "/legendoja-ja-lohikaarmeita": "/letl",
    "/legendoja-ja-lohikaarmeita/": "/letl",
    "/legendoja-ja-lohikaarmeita/srd": "/letl/srd",
    "/legendoja-ja-lohikaarmeita/srd/": "/letl/srd",
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
