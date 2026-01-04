import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check that page loaded
    await expect(page).toHaveTitle(/MYRRYS/);

    // Check that main navigation exists
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();

    // Check that logo is present
    const logo = page.locator('img[alt="MYRRYS"]').first();
    await expect(logo).toBeVisible();
  });

  test("blog page loads successfully", async ({ page }) => {
    await page.goto("/blog");

    // Check heading
    await expect(
      page.getByRole("heading", { name: "Blogi", level: 1 }),
    ).toBeVisible();

    // Check that there's content
    const articles = page.locator("article");
    await expect(articles.first()).toBeVisible();
  });

  test("404 page works", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("build artifacts are valid", async ({ page }) => {
    // Check that CSS loads
    await page.goto("/");
    const styles = await page.evaluate(() => {
      const el = document.querySelector("body");
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(styles).toBeTruthy();
  });
});
