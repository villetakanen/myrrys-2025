// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://myrrys-2025.netlify.app/",
  integrations: [sitemap()],
});
