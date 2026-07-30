import { expect, test } from "@playwright/test";

test.describe("Feature: Blog Post Theming (MYR-22 Spec)", () => {
  // Scenario: Post with defined theme
  test("Given a blog post with `theme: 'theme-letl'` in its frontmatter", async ({
    page,
  }) => {
    // When the post is rendered at `/blog/[id]`
    await page.goto("/blog/kiitos_luottamuksesta");

    // Then the `<main>` element should contain the classes `theme-letl` and `content-grid`
    const main = page.locator("main").first();
    await expect(main).toHaveClass(/theme-letl/);
    await expect(main).toHaveClass(/content-grid/);
  });

  // Scenario: Post with missing theme
  test("Given a blog post with no `theme` defined in its frontmatter", async ({
    page,
  }) => {
    // When the post is rendered at `/blog/[id]`
    await page.goto("/blog/flame-tongue");

    // Then the `<main>` element should contain the class `content-grid`
    const main = page.locator("main").first();
    await expect(main).toHaveClass(/content-grid/);

    // And the `<main>` element should NOT contain the class `undefined`
    const classAttr = await main.getAttribute("class");
    expect(classAttr).not.toContain("undefined");
  });

  // Markdown tables get styled by scoped CSS in src/pages/blog/[id].astro.
  // Astro's scoper silently emits invalid CSS for a comma-separated pair of
  // :global() selectors, so assert the computed result, not the source.
  test("Given a blog post containing a Markdown table", async ({ page }) => {
    await page.goto("/blog/26-07-29-kysymyksia-kaukasalosta");

    const cell = page.locator("article table tbody td").first();
    await expect(cell).toBeVisible();

    const styles = await cell.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        textAlign: cs.textAlign,
        paddingLeft: cs.paddingLeft,
        borderBottomWidth: cs.borderBottomWidth,
      };
    });
    expect(styles.textAlign).toBe("left");
    expect(Number.parseFloat(styles.paddingLeft)).toBeGreaterThan(0);
    expect(Number.parseFloat(styles.borderBottomWidth)).toBeGreaterThan(0);

    // The table must not push the page into horizontal scrolling on mobile.
    await page.setViewportSize({ width: 390, height: 900 });
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});
