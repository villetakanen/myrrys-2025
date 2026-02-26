import { describe, expect, it } from "vitest";

// Replicate the relevant class:list logic from src/pages/[id].astro
// This mimics how Astro's class:list directive filters out falsy values like undefined, null, and false.
function resolveClassList(
  items: (string | undefined | null | false)[],
): string {
  return items.filter(Boolean).join(" ");
}

describe("Content Page Theme Logic", () => {
  it("resolves to both theme and content-grid class when theme is defined", () => {
    const theme = "theme-letl";
    const result = resolveClassList([theme, "content-grid"]);

    expect(result).toBe("theme-letl content-grid");
    expect(result).toContain("theme-letl");
    expect(result).toContain("content-grid");
  });

  it("safely filters out undefined theme preventing 'undefined content-grid' bug", () => {
    const theme = undefined;
    const result = resolveClassList([theme, "content-grid"]);

    expect(result).toBe("content-grid");
    expect(result).not.toContain("undefined");
  });

  it("safely filters out null theme", () => {
    const theme = null;
    const result = resolveClassList([theme, "content-grid"]);

    expect(result).toBe("content-grid");
    expect(result).not.toContain("null");
  });
});
