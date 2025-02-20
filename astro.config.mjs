// @ts-check
import { defineConfig } from "astro/config";
import { Features } from "lightningcss";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://myrrys-2025.netlify.app/",
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
});
