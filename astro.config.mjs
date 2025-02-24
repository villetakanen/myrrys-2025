import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";

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
  redirects: {
    "/letl/srd": "/letl/srd/readme",
    "LnL-SRD/[...id]": "/letl/srd/[...id]",
    "lnl-srd/[...id]": "/letl/srd/[...id]",
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
