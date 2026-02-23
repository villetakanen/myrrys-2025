import { expect, test } from "@playwright/test";

test.describe("Feature: Image Asset Optimization (MYR-40)", () => {
  // Scenario: Blog index thumbnails are optimized (MYR-40)
  test("Blog index thumbnails have optimized srcset with candidates ≤128px wide", async ({
    page,
  }) => {
    await page.goto("/blog/");

    // Find article elements that contain img tags (blog post thumbnails)
    const articles = page.locator("article");
    const articleCount = await articles.count();
    expect(
      articleCount,
      "Expected at least one article on the blog index",
    ).toBeGreaterThan(0);

    // Collect srcset values from all thumbnail imgs inside articles
    let foundSrcset = false;
    let foundSmallCandidate = false;

    for (let i = 0; i < articleCount; i++) {
      const article = articles.nth(i);
      const imgs = article.locator("img");
      const imgCount = await imgs.count();

      for (let j = 0; j < imgCount; j++) {
        const img = imgs.nth(j);
        const srcset = await img.getAttribute("srcset");

        if (srcset) {
          foundSrcset = true;

          // Parse the srcset to find width descriptors
          // srcset candidates look like: "url 64w, url 128w"
          const candidates = srcset.split(",").map((c) => c.trim());
          for (const candidate of candidates) {
            const match = candidate.match(/(\d+)w\s*$/);
            if (match) {
              const width = Number.parseInt(match[1], 10);
              if (width <= 128) {
                foundSmallCandidate = true;
              }
            }
          }
        }
      }
    }

    expect(
      foundSrcset,
      "Expected at least one thumbnail <img> in an <article> to have a srcset attribute",
    ).toBe(true);

    expect(
      foundSmallCandidate,
      "Expected the thumbnail srcset to contain at least one candidate ≤128px wide (e.g., '64w' or '128w')",
    ).toBe(true);
  });

  // Scenario: Blog post poster image is optimized (MYR-40)
  test("Blog post poster/hero image has srcset and sizes attributes", async ({
    page,
  }) => {
    // Navigate to a blog post confirmed to have a hero image
    await page.goto("/blog/25-11-03-ametistiviidakko/");

    // The poster is the first img inside article (Astro's Image component output)
    const article = page.locator("article").first();
    await expect(article).toBeVisible();

    const posterImg = article.locator("img").first();
    await expect(
      posterImg,
      "Expected to find an <img> inside the blog post <article>",
    ).toBeVisible();

    await expect(
      posterImg,
      "Expected the poster <img> to have a srcset attribute",
    ).toHaveAttribute("srcset", /.+/);

    await expect(
      posterImg,
      "Expected the poster <img> to have a sizes attribute",
    ).toHaveAttribute("sizes", /.+/);
  });

  // Scenario: Legenda cover uses static import (MYR-40)
  test("Legenda cover image has srcset with no candidates wider than 600px", async ({
    page,
  }) => {
    await page.goto("/");

    // LegendaFrontArticle renders a <figure class="cover-image"> containing the img
    const coverImg = page.locator("figure.cover-image img");
    await expect(
      coverImg,
      "Expected to find an <img> inside <figure class='cover-image'>",
    ).toBeVisible();

    await expect(
      coverImg,
      "Expected the Legenda cover <img> to have a srcset attribute",
    ).toHaveAttribute("srcset", /.+/);

    // Parse srcset and assert no candidate exceeds 600w
    const srcset = await coverImg.getAttribute("srcset");
    expect(srcset, "srcset must not be null").not.toBeNull();

    const candidates = (srcset as string).split(",").map((c) => c.trim());
    const widths: number[] = [];

    for (const candidate of candidates) {
      const match = candidate.match(/(\d+)w\s*$/);
      if (match) {
        widths.push(Number.parseInt(match[1], 10));
      }
    }

    expect(
      widths.length,
      "Expected the srcset to contain at least one width descriptor",
    ).toBeGreaterThan(0);

    const maxWidth = Math.max(...widths);
    expect(
      maxWidth,
      `Expected no srcset candidate to exceed 600w, but found ${maxWidth}w`,
    ).toBeLessThanOrEqual(600);
  });
});
