import { describe, expect, it } from "vitest";

// Replicate the relevant class:list logic from src/pages/blog/[id].astro
// This mimics how Astro's class:list directive filters out falsy values like undefined, null, and false.
function resolveClassList(
  items: (string | undefined | null | false)[],
): string {
  return items.filter(Boolean).join(" ");
}

describe("Blog Post Theme Logic (MYR-22)", () => {
  it("resolves to both theme and default grid class when theme is defined", () => {
    // 1. Post with defined theme
    const theme = "dark-mode";
    const result = resolveClassList([theme, "content-grid"]);

    expect(result).toBe("dark-mode content-grid");
    expect(result).toContain("dark-mode");
    expect(result).toContain("content-grid");
  });

  it("safely filters out undefined theme properties preventing 'undefined content-grid' bug", () => {
    // 2. Post with missing theme
    const theme = undefined;
    const result = resolveClassList([theme, "content-grid"]);

    expect(result).toBe("content-grid");
    expect(result).not.toContain("undefined");
  });
});
