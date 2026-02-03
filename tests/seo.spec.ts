import { expect, test } from "@playwright/test";

test.describe("SEO Verification", () => {
  test("Finnish pages have lang='fi'", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("fi");
  });

  test("English pages have lang='en'", async ({ page }) => {
    await page.goto("/en/blog");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("Homepage has exactly one H1", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });
});
