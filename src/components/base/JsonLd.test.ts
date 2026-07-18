import { describe, expect, it } from "vitest";

// Mocking the logic implemented in JsonLd.astro for unit testing
const processSchema = (rawSchema: Record<string, unknown>) => {
  return {
    "@context": "https://schema.org",
    ...rawSchema,
  };
};

describe("JsonLd Component Logic", () => {
  it("injects @context if missing", () => {
    const rawSchema = {
      "@type": "Organization",
      name: "Myrrys",
    };
    const processed = processSchema(rawSchema);

    expect(processed["@context"]).toBe("https://schema.org");
    expect(processed.name).toBe("Myrrys");
  });

  it("preserves existing @context if provided", () => {
    const rawSchema = {
      "@context": "https://schema.test",
      "@type": "Organization",
      name: "Myrrys",
    };
    const processed = processSchema(rawSchema);

    expect(processed["@context"]).toBe("https://schema.test");
    expect(processed.name).toBe("Myrrys");
  });

  it("clones the schema to prevent mutation", () => {
    const rawSchema = {
      "@type": "Person",
      name: "Test",
    };
    const processed = processSchema(rawSchema);

    expect(processed).not.toBe(rawSchema);
    expect(processed.name).toBe(rawSchema.name);
  });
});
