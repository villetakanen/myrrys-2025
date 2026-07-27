import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { isSrdFile, stripLeadingHeading } from "./remarkSrdStripTitle";

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

const tree = (...children: Root["children"]): Root => ({
  type: "root",
  children,
});

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

describe("stripLeadingHeading", () => {
  it("removes a leading level-3 heading", () => {
    const t = tree(heading(3, "Tulipallo"), paragraph("Kirkas valojuova..."));
    expect(stripLeadingHeading(t)).toBe(true);
    expect(t.children).toHaveLength(1);
    expect(t.children[0].type).toBe("paragraph");
  });

  it("removes a leading level-1 heading", () => {
    const t = tree(heading(1, "Aseet"), paragraph("Näet asetaulukosta..."));
    expect(stripLeadingHeading(t)).toBe(true);
    expect(t.children).toHaveLength(1);
  });

  it("leaves later headings intact", () => {
    const t = tree(
      heading(1, "Olotilat"),
      paragraph("Olotilat vaikuttavat..."),
      heading(2, "Halvaantunut"),
      heading(2, "Kauhistunut"),
    );
    stripLeadingHeading(t);
    expect(t.children.filter((c) => c.type === "heading")).toHaveLength(2);
  });

  it("does nothing when the document opens with prose", () => {
    const t = tree(paragraph("Ei otsikkoa."), heading(2, "Myöhempi"));
    expect(stripLeadingHeading(t)).toBe(false);
    expect(t.children).toHaveLength(2);
  });

  it("does nothing for an empty document", () => {
    const t = tree();
    expect(stripLeadingHeading(t)).toBe(false);
    expect(t.children).toHaveLength(0);
  });

  it("removes only one heading when two are adjacent", () => {
    const t = tree(heading(1, "Olotilat"), heading(1, "Maissa"));
    stripLeadingHeading(t);
    expect(t.children).toHaveLength(1);
  });
});
