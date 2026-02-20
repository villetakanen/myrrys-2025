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
});
