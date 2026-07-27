import { describe, expect, it } from "vitest";
import { distExists, pageAt, schemaOfType } from "./helpers/dist-corpus";

/**
 * Per-page JSON-LD shape assertions, read from the build artefact in `dist/`.
 *
 * Migrated from tests/seo.spec.ts. These were previously Playwright tests that
 * booted three browser engines to run `JSON.parse` on a <script> tag's text
 * content — the rendering engine contributed nothing, and each assertion cost
 * a full page navigation. Structured data is static output, so it is checked
 * as static output.
 *
 * Corpus-wide invariants (uniqueness, link integrity, required tags) live in
 * seo-corpus.test.ts. Rendering behaviour stays in tests/*.spec.ts.
 */

interface Schema {
  "@context"?: string;
  "@type"?: string;
  [key: string]: unknown;
}

describe.skipIf(!distExists())("JSON-LD structured data", () => {
  describe("site-wide schemas", () => {
    it("homepage includes a well-formed Organization schema", () => {
      const org = schemaOfType<Schema>(pageAt("/"), "Organization");
      expect(org).toBeDefined();
      expect(org?.["@context"]).toBe("https://schema.org");
      expect(org?.name).toBe("Myrrys");
      expect(org?.url).toContain("myrrys.com");
      expect(org?.logo).toBeDefined();
    });

    it("homepage includes a well-formed WebSite schema", () => {
      const site = schemaOfType<Schema>(pageAt("/"), "WebSite");
      expect(site).toBeDefined();
      expect(site?.["@context"]).toBe("https://schema.org");
      expect(site?.name).toBe("Myrrys");
    });
  });

  describe("Product schema", () => {
    const product = () =>
      schemaOfType<Schema>(pageAt("/letl/letl-pelaajan-kirja"), "Product");

    it("includes core fields", () => {
      const p = product();
      expect(p).toBeDefined();
      expect(p?.["@context"]).toBe("https://schema.org");
      expect(p?.name).toBeTruthy();
      expect(p?.description).toBeTruthy();
      expect(p?.brand).toEqual({ "@type": "Brand", name: "L&L" });
      expect(p?.image).toContain("https://");
    });

    it("includes isbn when the product has one", () => {
      expect(product()?.isbn).toBeTruthy();
    });

    it("includes Offers when the product has distributors", () => {
      const offers = product()?.offers as
        | { "@type": string; url: string; seller: { "@type": string } }[]
        | undefined;
      expect(offers).toBeDefined();
      expect(offers?.length).toBeGreaterThan(0);
      expect(offers?.[0]["@type"]).toBe("Offer");
      expect(offers?.[0].url).toBeTruthy();
      expect(offers?.[0].seller["@type"]).toBe("Organization");
    });
  });

  describe("Article schema", () => {
    const withHero = () =>
      schemaOfType<Schema>(
        pageAt("/blog/25-11-03-ametistiviidakko"),
        "Article",
      );
    const withoutHero = () =>
      schemaOfType<Schema>(pageAt("/blog/errata-1-0-0"), "Article");

    it("includes core fields", () => {
      const a = withHero();
      expect(a).toBeDefined();
      expect(a?.["@context"]).toBe("https://schema.org");
      expect(a?.headline).toBeTruthy();
      expect(a?.description).toBeTruthy();
      expect(a?.datePublished).toBeTruthy();
    });

    it("uses an absolute URL for image when a heroImage is set", () => {
      expect(withHero()?.image).toContain("https://");
    });

    it("omits image when no heroImage is set", () => {
      expect(withoutHero()?.image).toBeUndefined();
    });

    it("includes author as a Person when an author is set", () => {
      const author = withHero()?.author as
        | { "@type": string; name: string }
        | undefined;
      expect(author).toBeDefined();
      expect(author?.["@type"]).toBe("Person");
      expect(author?.name).toBeTruthy();
    });

    it("omits author when none is set", () => {
      expect(withoutHero()?.author).toBeUndefined();
    });

    it("always includes publisher", () => {
      expect(withoutHero()?.publisher).toEqual({
        "@type": "Organization",
        name: "Myrrys",
      });
    });
  });

  describe("BreadcrumbList schema", () => {
    interface ListItem {
      "@type": string;
      position: number;
      name: string;
      item: string;
    }
    const crumbs = (url: string) =>
      schemaOfType<Schema>(pageAt(url), "BreadcrumbList");
    const items = (url: string) =>
      crumbs(url)?.itemListElement as ListItem[] | undefined;

    it("builds a full trail on a deep sub-page", () => {
      const bc = crumbs("/letl/srd/varusteet/aseet");
      expect(bc).toBeDefined();
      expect(bc?.["@context"]).toBe("https://schema.org");

      const list = items("/letl/srd/varusteet/aseet");
      expect(list).toHaveLength(5);
      expect(list?.[0]).toMatchObject({
        "@type": "ListItem",
        position: 1,
        name: "Etusivu",
      });
      expect(list?.[1]).toMatchObject({ position: 2, name: "L&L" });
      expect(list?.[2]).toMatchObject({ position: 3, name: "SRD" });
      expect(list?.[3].position).toBe(4);
      expect(list?.[4].position).toBe(5);
      for (const item of list ?? []) {
        expect(item.item).toContain("https://");
      }
    });

    it("builds a 2-item trail on a single-level page", () => {
      const list = items("/blog");
      expect(list).toHaveLength(2);
      expect(list?.[0].name).toBe("Etusivu");
      expect(list?.[1].name).toBe("Blogi");
    });

    it("builds a 3-item trail on a blog post", () => {
      const list = items("/blog/errata-1-0-0");
      expect(list).toHaveLength(3);
      expect(list?.[0].name).toBe("Etusivu");
      expect(list?.[1].name).toBe("Blogi");
      expect(list?.[2].position).toBe(3);
    });

    it("omits the breadcrumb on the homepage", () => {
      expect(crumbs("/")).toBeUndefined();
    });

    it("uses mapped labels for known path segments", () => {
      const list = items("/letl/srd/readme");
      expect(list?.[1].name).toBe("L&L");
      expect(list?.[2].name).toBe("SRD");
    });

    it("falls back to a capitalised label for unknown segments", () => {
      // "errata-1-0-0" → "Errata 1 0 0"
      expect(items("/blog/errata-1-0-0")?.[2].name).toBe("Errata 1 0 0");
    });
  });
});
