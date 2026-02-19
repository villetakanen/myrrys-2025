import { expect, test } from "@playwright/test";

/** Helper to extract all JSON-LD objects from a page */
async function getJsonLdSchemas(page) {
  return page.evaluate(() => {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    return Array.from(scripts).map((s) => JSON.parse(s.textContent ?? "{}"));
  });
}

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

test.describe("JSON-LD Structured Data", () => {
  test("All pages include Organization and WebSite schemas", async ({
    page,
  }) => {
    await page.goto("/");
    const schemas = await getJsonLdSchemas(page);

    const org = schemas.find((s) => s["@type"] === "Organization");
    expect(org).toBeDefined();
    expect(org["@context"]).toBe("https://schema.org");
    expect(org.name).toBe("Myrrys");
    expect(org.url).toContain("myrrys.com");
    expect(org.logo).toBeDefined();

    const site = schemas.find((s) => s["@type"] === "WebSite");
    expect(site).toBeDefined();
    expect(site["@context"]).toBe("https://schema.org");
    expect(site.name).toBe("Myrrys");
  });

  test("Product page includes Product schema with core fields", async ({
    page,
  }) => {
    await page.goto("/letl/letl-pelaajan-kirja");
    const schemas = await getJsonLdSchemas(page);

    const product = schemas.find((s) => s["@type"] === "Product");
    expect(product).toBeDefined();
    expect(product["@context"]).toBe("https://schema.org");
    expect(product.name).toBeTruthy();
    expect(product.description).toBeTruthy();
    expect(product.brand).toEqual({ "@type": "Brand", name: "L&L" });
    expect(product.image).toContain("https://");
  });

  test("Product with ISBN includes isbn field", async ({ page }) => {
    await page.goto("/letl/letl-pelaajan-kirja");
    const schemas = await getJsonLdSchemas(page);
    const product = schemas.find((s) => s["@type"] === "Product");
    expect(product.isbn).toBeTruthy();
  });

  test("Product with distributors includes Offers", async ({ page }) => {
    await page.goto("/letl/letl-pelaajan-kirja");
    const schemas = await getJsonLdSchemas(page);
    const product = schemas.find((s) => s["@type"] === "Product");
    expect(product.offers).toBeDefined();
    expect(product.offers.length).toBeGreaterThan(0);
    expect(product.offers[0]["@type"]).toBe("Offer");
    expect(product.offers[0].url).toBeTruthy();
    expect(product.offers[0].seller["@type"]).toBe("Organization");
  });
});
