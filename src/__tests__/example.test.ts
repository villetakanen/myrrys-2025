import { describe, expect, it } from "vitest";

describe("Example Test Suite", () => {
  it("should pass basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle strings", () => {
    const greeting = "Hello, MYRRYS";
    expect(greeting).toContain("MYRRYS");
  });

  it("should work with arrays", () => {
    const items = ["blog", "products", "lnlsrd"];
    expect(items).toHaveLength(3);
    expect(items).toContain("blog");
  });
});
