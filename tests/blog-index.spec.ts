import { expect, test } from "@playwright/test";

test.describe("BlogIndex Component", () => {
  test("Finnish blog index renders posts", async ({ page }) => {
    await page.goto("/blog");

    // Should have heading - using text locator for more flexibility
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Blogi");

    // Should have at least one article
    const articles = page.locator("article");
    await expect(articles.first()).toBeVisible();

    // Articles should have links with Finnish prefix
    const link = articles.locator("a").first();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/blog\//);
  });

  test("English blog index renders posts", async ({ page }) => {
    await page.goto("/en/blog");

    // Should have heading
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Blog");

    // Articles should have links with English prefix
    const articles = page.locator("article");
    if ((await articles.count()) > 0) {
      const link = articles.locator("a").first();
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^\/en\/blog\//);
    }
  });
});
