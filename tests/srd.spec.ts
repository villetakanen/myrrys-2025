import { expect, test } from "@playwright/test";

test.describe("SRD Links Validation", () => {
  test("TOC menu contains proper absolute SRD links without relative markdown artifacts", async ({
    page,
  }) => {
    // Navigate to a known SRD page
    const response = await page.goto("/letl/srd/readme");
    expect(response?.status()).toBe(200);

    // Locate the TOC
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();

    // Check specific known entries from the SRD TOC structure
    const hahmonluontiLink = toc
      .locator("a", { hasText: "Hahmonluonti" })
      .first();
    await expect(hahmonluontiLink).toHaveAttribute(
      "href",
      "/letl/srd/hahmonluonti/vaiheet",
    );

    const loitsuLink = toc.locator("a", { hasText: "0. piirin taikakonstit" });
    await expect(loitsuLink).toHaveAttribute(
      "href",
      "/letl/srd/loitsut/0_piirin_taikakonstit",
    );
  });

  test("Inline relative links inside SRD pages are transformed properly", async ({
    page,
  }) => {
    // Navigate to a known SRD page featuring multiple links
    // "hahmonluonti/vaiheet" usually has cross-references.
    const response = await page.goto("/letl/srd/hahmonluonti/vaiheet");
    expect(response?.status()).toBe(200);

    const allLinks = page.locator("article a[href]");
    const count = await allLinks.count();

    expect(count).toBeGreaterThan(0); // Make sure there are links to verify

    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute("href");

      if (!href) continue;

      // Ignore external, hashed, email links.
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:")
      ) {
        continue;
      }

      // 1. Local links MUST be absolute starting with "/"
      expect(
        href.startsWith("/"),
        `Link should be absolute, but found relative link: ${href}`,
      ).toBeTruthy();

      // 2. Local links MUST point to the SRD sub-route (or generic site routes like /)
      if (href !== "/" && href !== "/blog") {
        expect(
          href.startsWith("/letl/srd/"),
          `Internal SRD link must start with /letl/srd/, found: ${href}`,
        ).toBeTruthy();
      }

      // 3. Ensure no trailing ".md" or raw markdown patterns
      expect(href, `Link should not have .md extension: ${href}`).not.toContain(
        ".md",
      );
    }
  });

  test("There are no broken SRD links on the page", async ({
    page,
    request,
  }) => {
    // Navigate to a known SRD page
    await page.goto("/letl/srd/readme");

    // Grab TOC links
    const testLinks = page.locator(".toc a");
    const count = await testLinks.count();

    // Ensure the TOC actually rendered
    expect(count, "TOC should have links").toBeGreaterThan(5);

    // Limit to just the first 5 to keep the test snappy
    const maxChecks = Math.min(5, count);

    for (let i = 0; i < maxChecks; i++) {
      const href = await testLinks.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      if (!href) continue;

      // Use request context to do a quick GET
      const res = await request.get(href);
      expect(res.status(), `Link ${href} returned ${res.status()}`).toBe(200);
    }
  });
});
