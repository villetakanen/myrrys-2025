import { getCollection } from "astro:content";
import { describe, expectTypeOf, it } from "vitest";

describe("Content Collections Type Safety", () => {
  it("blog-en collection returns correct types", async () => {
    // Only test if collection has items to avoid runtime errors in test logic
    // In a real app we'd mock the content layer, but here we just check existing items
    const posts = await getCollection("blog-en");

    if (posts.length > 0) {
      expectTypeOf(posts[0].data.title).toBeString();
      expectTypeOf(posts[0].data.description).toBeString();
      expectTypeOf(posts[0].data.pubDate).toBeDate();
      expectTypeOf(posts[0].data.tags).toEqualTypeOf<string[] | undefined>();
    }
  });

  it("products-en collection returns correct types", async () => {
    const products = await getCollection("products-en");

    if (products.length > 0) {
      expectTypeOf(products[0].data.title).toBeString();
      expectTypeOf(products[0].data.brand).toBeString();
      expectTypeOf(products[0].data.author).toBeString();
      expectTypeOf(products[0].data.isbn).toEqualTypeOf<string[] | undefined>();
    }
  });
});
