import { expect, test } from "@playwright/test";

test.describe("LCP Resource Priority Optimization", () => {
  test("Background image preloads have fetchpriority=high", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Mobile preload: max-width: 640px
    const mobilePreload = page.locator(
      'link[rel="preload"][as="image"][href="/branding/letl-gm-screen-splash-mobile.webp"]',
    );
    await expect(mobilePreload).toHaveAttribute("media", "(max-width: 640px)");
    await expect(mobilePreload).toHaveAttribute("fetchpriority", "high");

    // Desktop preload: min-width: 641px
    const desktopPreload = page.locator(
      'link[rel="preload"][as="image"][href="/branding/letl-gm-screen-splash.webp"]',
    );
    await expect(desktopPreload).toHaveAttribute("media", "(min-width: 641px)");
    await expect(desktopPreload).toHaveAttribute("fetchpriority", "high");
  });

  test("Logo image has fetchpriority=high on Finnish homepage", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const logo = page.locator("#site-header img#logo");
    await expect(logo).toHaveAttribute("fetchpriority", "high");
  });

  test("Critical font is preloaded with crossorigin attribute", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // At least one font preload link with crossorigin must exist
    const fontPreloads = page.locator(
      'link[rel="preload"][as="font"][type="font/woff2"]',
    );
    const count = await fontPreloads.count();
    expect(count, "Expected at least one font preload link").toBeGreaterThan(0);

    // Find a font preload that points to a .woff2 file and has crossorigin
    let foundValidFontPreload = false;
    for (let i = 0; i < count; i++) {
      const href = await fontPreloads.nth(i).getAttribute("href");
      const crossorigin = await fontPreloads.nth(i).getAttribute("crossorigin");

      if (href?.endsWith(".woff2") && crossorigin !== null) {
        foundValidFontPreload = true;
        break;
      }
    }

    expect(
      foundValidFontPreload,
      "Expected a <link rel=preload as=font type=font/woff2> with crossorigin pointing to a .woff2 file",
    ).toBe(true);
  });

  test("English layout logo does NOT have fetchpriority=high", async ({
    page,
  }) => {
    const response = await page.goto("/en/");
    expect(response?.status()).toBe(200);

    const logo = page.locator("#site-header img#logo");
    const fetchpriority = await logo.getAttribute("fetchpriority");
    expect(
      fetchpriority,
      "English layout logo must not have fetchpriority=high",
    ).not.toBe("high");
  });
});
