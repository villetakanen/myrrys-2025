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

  test("Blog post includes Article schema with core fields", async ({
    page,
  }) => {
    await page.goto("/blog/25-11-03-ametistiviidakko");
    const schemas = await getJsonLdSchemas(page);

    const article = schemas.find((s) => s["@type"] === "Article");
    expect(article).toBeDefined();
    expect(article["@context"]).toBe("https://schema.org");
    expect(article.headline).toBeTruthy();
    expect(article.description).toBeTruthy();
    expect(article.datePublished).toBeTruthy();
  });

  test("Blog post with heroImage includes image as absolute URL", async ({
    page,
  }) => {
    await page.goto("/blog/25-11-03-ametistiviidakko");
    const schemas = await getJsonLdSchemas(page);
    const article = schemas.find((s) => s["@type"] === "Article");
    expect(article.image).toContain("https://");
  });

  test("Blog post without heroImage omits image field", async ({ page }) => {
    await page.goto("/blog/errata-1-0-0");
    const schemas = await getJsonLdSchemas(page);
    const article = schemas.find((s) => s["@type"] === "Article");
    expect(article).toBeDefined();
    expect(article.image).toBeUndefined();
  });

  test("Blog post with author includes author as Person", async ({ page }) => {
    await page.goto("/blog/25-11-03-ametistiviidakko");
    const schemas = await getJsonLdSchemas(page);
    const article = schemas.find((s) => s["@type"] === "Article");
    expect(article.author).toBeDefined();
    expect(article.author["@type"]).toBe("Person");
    expect(article.author.name).toBeTruthy();
  });

  test("Blog post without author omits author field", async ({ page }) => {
    await page.goto("/blog/errata-1-0-0");
    const schemas = await getJsonLdSchemas(page);
    const article = schemas.find((s) => s["@type"] === "Article");
    expect(article.author).toBeUndefined();
  });

  test("Blog post always includes publisher", async ({ page }) => {
    await page.goto("/blog/errata-1-0-0");
    const schemas = await getJsonLdSchemas(page);
    const article = schemas.find((s) => s["@type"] === "Article");
    expect(article.publisher).toEqual({
      "@type": "Organization",
      name: "Myrrys",
    });
  });

  test("Deep sub-page includes full breadcrumb trail", async ({ page }) => {
    await page.goto("/letl/srd/varusteet/aseet");
    const schemas = await getJsonLdSchemas(page);
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    expect(bc).toBeDefined();
    expect(bc["@context"]).toBe("https://schema.org");
    expect(bc.itemListElement).toHaveLength(5);
    expect(bc.itemListElement[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      name: "Etusivu",
    });
    expect(bc.itemListElement[1]).toMatchObject({
      "@type": "ListItem",
      position: 2,
      name: "L&L",
    });
    expect(bc.itemListElement[2]).toMatchObject({
      "@type": "ListItem",
      position: 3,
      name: "SRD",
    });
    expect(bc.itemListElement[3].position).toBe(4);
    expect(bc.itemListElement[4].position).toBe(5);
    for (const item of bc.itemListElement) {
      expect(item.item).toContain("https://");
    }
  });

  test("Single-level page includes breadcrumb with 2 items", async ({
    page,
  }) => {
    await page.goto("/blog");
    const schemas = await getJsonLdSchemas(page);
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    expect(bc).toBeDefined();
    expect(bc.itemListElement).toHaveLength(2);
    expect(bc.itemListElement[0].name).toBe("Etusivu");
    expect(bc.itemListElement[1].name).toBe("Blogi");
  });

  test("Blog post includes breadcrumb with 3 items", async ({ page }) => {
    await page.goto("/blog/errata-1-0-0");
    const schemas = await getJsonLdSchemas(page);
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    expect(bc).toBeDefined();
    expect(bc.itemListElement).toHaveLength(3);
    expect(bc.itemListElement[0].name).toBe("Etusivu");
    expect(bc.itemListElement[1].name).toBe("Blogi");
    expect(bc.itemListElement[2].position).toBe(3);
  });

  test("Homepage has no breadcrumb", async ({ page }) => {
    await page.goto("/");
    const schemas = await getJsonLdSchemas(page);
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    expect(bc).toBeUndefined();
  });

  test("Known segments use mapped labels", async ({ page }) => {
    await page.goto("/letl/srd/readme");
    const schemas = await getJsonLdSchemas(page);
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    expect(bc.itemListElement[1].name).toBe("L&L");
    expect(bc.itemListElement[2].name).toBe("SRD");
  });

  test("Unknown segments use capitalized fallback", async ({ page }) => {
    await page.goto("/blog/errata-1-0-0");
    const schemas = await getJsonLdSchemas(page);
    const bc = schemas.find((s) => s["@type"] === "BreadcrumbList");
    // "errata-1-0-0" → "Errata 1 0 0"
    expect(bc.itemListElement[2].name).toBe("Errata 1 0 0");
  });
});

/** Representative page set covering all page types */
const seoSweepPages = [
  "/",
  "/blog",
  "/blog/errata-1-0-0",
  "/letl/letl-pelaajan-kirja",
  "/letl/srd/readme",
  "/en/blog",
  "/legenda",
  "/myrrys",
];

test.describe("SEO Verification Sweep", () => {
  for (const url of seoSweepPages) {
    test(`${url} has exactly one H1`, async ({ page }) => {
      await page.goto(url);
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
    });
  }

  for (const url of seoSweepPages) {
    test(`${url} has valid JSON-LD with @context`, async ({ page }) => {
      await page.goto(url);
      const schemas = await getJsonLdSchemas(page);
      expect(schemas.length).toBeGreaterThan(0);
      for (const schema of schemas) {
        expect(schema["@context"]).toBe("https://schema.org");
        expect(schema["@type"]).toBeTruthy();
      }
    });
  }
});
