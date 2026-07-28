import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Loads the built static site from `dist/` and exposes it as a queryable
 * corpus of pages.
 *
 * These helpers deliberately parse the build artefact from disk rather than
 * driving a browser: the SEO invariants they support are whole-corpus
 * properties ("no two pages share a title") that cannot be expressed as a
 * per-page browser assertion without 400+ navigations. See
 * docs/reports/seo-audit-2026-07-27.md.
 */

export const DIST = resolve(import.meta.dirname, "../../dist");

export function distExists(): boolean {
  return existsSync(join(DIST, "index.html"));
}

/** Decodes the subset of HTML entities Astro emits into attribute values. */
export function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Normalises a URL path for comparison: percent-decoded, Unicode-normalised
 * (macOS returns NFD from the filesystem while HTML carries NFC), and with a
 * guaranteed trailing slash.
 */
export function normalizePath(path: string): string {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    decoded = path;
  }
  const normalized = decoded.normalize("NFC");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export interface DistPage {
  /** Public URL path, e.g. "/letl/srd/loitsut/tulipallo/" */
  url: string;
  /** Absolute path of the source file in dist/ */
  file: string;
  html: string;
  head: string;
  body: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogType: string | null;
  lang: string | null;
  headings: { level: number; text: string }[];
  /** Internal href targets (site-relative), entity-decoded, without hash/query */
  internalLinks: string[];
  jsonLd: {
    types: string[];
    invalid: number;
    /** Parsed JSON-LD objects, in document order. */
    schemas: Record<string, unknown>[];
  };
}

function attr(source: string, pattern: RegExp): string | null {
  const match = source.match(pattern);
  return match ? decodeEntities(match[1]).trim() : null;
}

function toUrl(file: string): string {
  const rel = file.slice(DIST.length);
  if (rel === "/index.html") return "/";
  if (rel.endsWith("/index.html")) return rel.slice(0, -"index.html".length);
  return rel;
}

let cache: DistPage[] | null = null;

export function loadPages(): DistPage[] {
  if (cache) return cache;

  const files = execFileSync("find", [DIST, "-name", "*.html"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  })
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();

  cache = files.map((file) => {
    const html = readFileSync(file, "utf8");
    const splitAt = html.indexOf("</head>");
    const head = splitAt === -1 ? html : html.slice(0, splitAt);
    const body = splitAt === -1 ? "" : html.slice(splitAt);

    const headings = [
      ...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi),
    ].map((m) => ({
      level: Number(m[1]),
      text: decodeEntities(m[2].replace(/<[^>]+>/g, "")).trim(),
    }));

    const internalLinks = [...body.matchAll(/<a\b[^>]*href\s*=\s*"([^"]+)"/gi)]
      .map((m) => decodeEntities(m[1]))
      .filter((href) => href.startsWith("/"))
      .map((href) => href.split("#")[0].split("?")[0])
      .filter(Boolean);

    let invalid = 0;
    const schemas: Record<string, unknown>[] = [];
    for (const match of html.matchAll(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
    )) {
      try {
        schemas.push(JSON.parse(match[1]));
      } catch {
        invalid += 1;
      }
    }
    const types = schemas.flatMap(
      (s) => [s["@type"]].flat().filter(Boolean) as string[],
    );

    return {
      url: decodeURIComponent(toUrl(file)).normalize("NFC"),
      file,
      html,
      head,
      body,
      title: attr(head, /<title>([\s\S]*?)<\/title>/i),
      description: attr(
        head,
        /<meta\s+name="description"\s+content="([\s\S]*?)"/i,
      ),
      canonical: attr(head, /<link\s+rel="canonical"\s+href="([^"]*)"/i),
      ogType: attr(head, /property="og:type"\s+content="([^"]*)"/i),
      lang: attr(html, /<html[^>]*\blang="([^"]*)"/i),
      headings,
      internalLinks: [...new Set(internalLinks)],
      jsonLd: { types, invalid, schemas },
    };
  });

  return cache;
}

/**
 * Looks up a single built page by URL path, tolerating a missing or present
 * trailing slash. Throws if the page was not built, so a renamed route fails
 * loudly instead of silently skipping its assertions.
 */
export function pageAt(url: string): DistPage {
  const wanted = normalizePath(url);
  const found = loadPages().find((p) => normalizePath(p.url) === wanted);
  if (!found) {
    throw new Error(
      `No built page at "${url}". Did the route change, or is dist/ stale?`,
    );
  }
  return found;
}

/** Finds the first JSON-LD schema of the given @type on a page. */
export function schemaOfType<T = Record<string, unknown>>(
  page: DistPage,
  type: string,
): T | undefined {
  return page.jsonLd.schemas.find((s) => s["@type"] === type) as T | undefined;
}

/** URL paths of every built page, normalised for link resolution. */
export function builtPaths(): Set<string> {
  return new Set(loadPages().map((p) => normalizePath(p.url)));
}

/** True if a site-relative href resolves to a built page or a real static asset. */
export function resolvesInDist(href: string, built: Set<string>): boolean {
  if (built.has(normalizePath(href))) return true;
  let decoded: string;
  try {
    decoded = decodeURIComponent(href);
  } catch {
    decoded = href;
  }
  const asset = join(DIST, decoded);
  return (
    existsSync(asset.normalize("NFC")) || existsSync(asset.normalize("NFD"))
  );
}

/** Formats a list of offending pages for a readable assertion message. */
export function report(items: string[], limit = 15): string {
  if (items.length === 0) return "none";
  const shown = items.slice(0, limit).map((i) => `  - ${i}`);
  const rest =
    items.length > limit ? `\n  …and ${items.length - limit} more` : "";
  return `${items.length} total:\n${shown.join("\n")}${rest}`;
}
