import { expect, test } from "@playwright/test";

test.describe("Feature: Content-Driven Pages", () => {
  test("Scenario: /myrrys returns HTTP 200", async ({ page }) => {
    const response = await page.goto("/myrrys");
    expect(response?.status()).toBe(200);
  });

  test("Scenario: Myrrys page has exactly one H1 with correct text", async ({
    page,
  }) => {
    await page.goto("/myrrys");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Myrrysmiehet Oy");
  });

  test("Scenario: <main> has theme-letl and content-grid classes", async ({
    page,
  }) => {
    await page.goto("/myrrys");
    const main = page.locator("main").first();
    await expect(main).toHaveClass(/theme-letl/);
    await expect(main).toHaveClass(/content-grid/);
  });

  test("Scenario: Title and description meta populated from frontmatter", async ({
    page,
  }) => {
    await page.goto("/myrrys");
    const title = await page.title();
    expect(title).toContain("Myrrysmiehet Oy");

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
    expect(description).toContain("kustannusosakeyhtiö");
  });

  test("Scenario: No 'undefined' in class attribute", async ({ page }) => {
    await page.goto("/myrrys");
    const mainClass = await page.locator("main").first().getAttribute("class");
    expect(mainClass).not.toContain("undefined");
  });

  test("Scenario: Footer link to /myrrys resolves", async ({ page }) => {
    await page.goto("/");
    const footerLink = page.locator('footer a[href="/myrrys"]');
    await expect(footerLink).toBeVisible();
    await footerLink.click();
    await page.waitForURL("**/myrrys");
    const h1 = page.locator("h1");
    await expect(h1).toHaveText("Myrrysmiehet Oy");
  });

  test("Scenario: Breadcrumb JSON-LD contains mapped label", async ({
    page,
  }) => {
    await page.goto("/myrrys");
    const schemas = await page.evaluate(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );
      return Array.from(scripts).map((s) => JSON.parse(s.textContent ?? "{}"));
    });
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    expect(bc).toBeDefined();
    expect(bc.itemListElement).toHaveLength(2);
    expect(bc.itemListElement[1].name).toBe("Myrrysmiehet Oy");
  });
});
