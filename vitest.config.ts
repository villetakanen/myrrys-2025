import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: "node",
      // `.test.ts` belongs to Vitest, `.spec.ts` to Playwright. This keeps the
      // dist/ corpus suite in tests/ without Playwright trying to run it.
      include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
      exclude: ["**/node_modules/**", "**/dist/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  }),
);
