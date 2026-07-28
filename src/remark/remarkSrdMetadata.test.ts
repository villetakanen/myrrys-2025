import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import {
  MAX_DESCRIPTION,
  deriveDescription,
  isSrdFile,
  takeLeadingHeading,
} from "./remarkSrdMetadata";

const heading = (depth: 1 | 2 | 3, text: string) =>
  ({
    type: "heading",
    depth,
    children: [{ type: "text", value: text }],
  }) as Root["children"][number];

const paragraph = (text: string) =>
  ({
    type: "paragraph",
    children: [{ type: "text", value: text }],
  }) as Root["children"][number];

/** A spell page's `*3-piirin luominen*` line: a paragraph of pure emphasis. */
const emphasisParagraph = (text: string) =>
  ({
    type: "paragraph",
    children: [{ type: "emphasis", children: [{ type: "text", value: text }] }],
  }) as Root["children"][number];

/** A `**Kantama:** 60 metriä` stat line. */
const statParagraph = (key: string, value: string) =>
  ({
    type: "paragraph",
    children: [
      { type: "strong", children: [{ type: "text", value: `${key}:` }] },
      { type: "text", value: ` ${value}` },
    ],
  }) as Root["children"][number];

const list = (...items: string[]) =>
  ({
    type: "list",
    ordered: false,
    children: items.map((text) => ({
      type: "listItem",
      children: [
        { type: "paragraph", children: [{ type: "text", value: text }] },
      ],
    })),
  }) as Root["children"][number];

const table = (...rows: string[][]) =>
  ({
    type: "table",
    children: rows.map((cells) => ({
      type: "tableRow",
      children: cells.map((text) => ({
        type: "tableCell",
        children: [{ type: "text", value: text }],
      })),
    })),
  }) as Root["children"][number];

const thematicBreak = () =>
  ({ type: "thematicBreak" }) as Root["children"][number];

const tree = (...children: Root["children"]): Root => ({
  type: "root",
  children,
});

/** Builds a paragraph of `words` repeated to comfortably exceed 160 chars. */
const longParagraph = (word: string) =>
  paragraph(Array.from({ length: 40 }, () => word).join(" "));

describe("isSrdFile", () => {
  it("matches files inside the submodule", () => {
    expect(isSrdFile("/repo/LnL-SRD/Loitsut/Tulipallo.md")).toBe(true);
  });

  it("matches at the start of a relative path", () => {
    expect(isSrdFile("LnL-SRD/Sanasto.md")).toBe(true);
  });

  it("normalises Windows separators", () => {
    expect(isSrdFile("C:\\repo\\LnL-SRD\\Sanasto.md")).toBe(true);
  });

  it("does not match site content", () => {
    expect(isSrdFile("/repo/src/blog/25-11-03-ametistiviidakko.md")).toBe(
      false,
    );
  });

  it("does not match a similarly named directory", () => {
    expect(isSrdFile("/repo/src/LnL-SRD-notes/foo.md")).toBe(false);
  });
});

describe("takeLeadingHeading", () => {
  it("removes a leading level-3 heading and returns its text", () => {
    const t = tree(heading(3, "Tulipallo"), paragraph("Kirkas valojuova..."));
    expect(takeLeadingHeading(t)).toBe("Tulipallo");
    expect(t.children).toHaveLength(1);
    expect(t.children[0].type).toBe("paragraph");
  });

  it("removes a leading level-1 heading", () => {
    const t = tree(heading(1, "Aseet"), paragraph("Näet asetaulukosta..."));
    expect(takeLeadingHeading(t)).toBe("Aseet");
    expect(t.children).toHaveLength(1);
  });

  it("flattens inline markup in the heading", () => {
    const t = tree({
      type: "heading",
      depth: 2,
      children: [
        { type: "strong", children: [{ type: "text", value: "Loitsut" }] },
        { type: "text", value: " ja taiat" },
      ],
    } as Root["children"][number]);
    expect(takeLeadingHeading(t)).toBe("Loitsut ja taiat");
  });

  it("leaves later headings intact", () => {
    const t = tree(
      heading(1, "Olotilat"),
      paragraph("Olotilat vaikuttavat..."),
      heading(2, "Halvaantunut"),
      heading(2, "Kauhistunut"),
    );
    takeLeadingHeading(t);
    expect(t.children.filter((c) => c.type === "heading")).toHaveLength(2);
  });

  it("returns null when the document opens with prose", () => {
    const t = tree(paragraph("Ei otsikkoa."), heading(2, "Myöhempi"));
    expect(takeLeadingHeading(t)).toBeNull();
    expect(t.children).toHaveLength(2);
  });

  it("returns null for an empty document", () => {
    const t = tree();
    expect(takeLeadingHeading(t)).toBeNull();
    expect(t.children).toHaveLength(0);
  });

  it("removes only one heading when two are adjacent", () => {
    const t = tree(heading(1, "Olotilat"), heading(1, "Maissa"));
    takeLeadingHeading(t);
    expect(t.children).toHaveLength(1);
  });
});

describe("deriveDescription", () => {
  it("joins consecutive paragraphs with a single space", () => {
    const t = tree(paragraph("Ensimmäinen."), paragraph("Toinen."));
    expect(deriveDescription(t)).toBe("Ensimmäinen. Toinen.");
  });

  it("stops at a thematic break so the footer nav never appears", () => {
    const t = tree(
      paragraph("Varsinainen sisältö."),
      thematicBreak(),
      paragraph("Ylätaso Kolmannen piirin loitsut"),
    );
    expect(deriveDescription(t)).toBe("Varsinainen sisältö.");
  });

  it("collapses newlines and repeated spaces", () => {
    const t = tree(paragraph("Rivi\nyksi   ja\t kaksi"));
    expect(deriveDescription(t)).toBe("Rivi yksi ja kaksi");
  });

  it("includes list text, which keeps link-list pages above the snippet floor", () => {
    const t = tree(
      paragraph("A-V ajatustenvaihdosta vilahdukseen."),
      list("Ajatustenvaihto", "Elvytys", "Hidastus"),
    );
    expect(deriveDescription(t)).toBe(
      "A-V ajatustenvaihdosta vilahdukseen. Ajatustenvaihto, Elvytys, Hidastus",
    );
  });

  it("separates table cells and rows rather than jamming them together", () => {
    const t = tree(table(["Julkaisu", "Versio"], ["2026", "1.0.0-rc.1"]));
    expect(deriveDescription(t)).toBe("Julkaisu Versio, 2026 1.0.0-rc.1");
  });

  // The naive rule is the point: skipping the stat block was considered and
  // rejected, because it is measurably unique on all 348 pages as-is.
  it("keeps a spell's emphasis line and stat block verbatim", () => {
    const t = tree(
      emphasisParagraph("3-piirin luominen"),
      statParagraph("Loitsimisviive", "1 toiminto"),
      statParagraph("Kantama", "60 metriä"),
      paragraph("Kirkas valojuova suhahtaa."),
    );
    expect(deriveDescription(t)).toBe(
      "3-piirin luominen Loitsimisviive: 1 toiminto Kantama: 60 metriä Kirkas valojuova suhahtaa.",
    );
  });

  it("truncates on a word boundary at or under the limit", () => {
    const result = deriveDescription(tree(longParagraph("tulipallo")));
    expect(result.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
    expect(result.endsWith("…")).toBe(true);
  });

  it("never splits a word", () => {
    const result = deriveDescription(tree(longParagraph("tulipallo")));
    for (const word of result.replace(/…$/, "").trim().split(" ")) {
      expect(word).toBe("tulipallo");
    }
  });

  it("strips trailing punctuation before the ellipsis", () => {
    const filler = Array.from({ length: 30 }, () => "sana").join(" ");
    const t = tree(paragraph(`${filler}, jatkuu vielä pitkään tämän jälkeen.`));
    expect(deriveDescription(t)).not.toMatch(/[,;:.]…$/);
  });

  it("leaves text under the limit untouched", () => {
    const t = tree(paragraph("Lyhyt kuvaus."));
    expect(deriveDescription(t)).toBe("Lyhyt kuvaus.");
  });

  it("returns an empty string for an empty tree", () => {
    expect(deriveDescription(tree())).toBe("");
  });
});
