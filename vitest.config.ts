import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: "node",
      exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  }),
);
