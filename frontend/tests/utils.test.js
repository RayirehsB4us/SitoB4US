import { describe, it, expect } from "vitest";
const {
  normalizeIpForCompare,
  isIpAllowed,
  buildStrapiPopulateQuery,
  sanitizeFileName,
  sanitizeFolderName,
  generateSitemapXml,
  generateRobotsTxt,
} = require("../utils");

// ── normalizeIpForCompare ──────────────────────────────────────────

describe("normalizeIpForCompare", () => {
  it("ritorna stringa vuota per input null/undefined", () => {
    expect(normalizeIpForCompare(null)).toBe("");
    expect(normalizeIpForCompare(undefined)).toBe("");
    expect(normalizeIpForCompare("")).toBe("");
  });

  it("ritorna input non-stringa invariato (fallback passthrough)", () => {
    // numeri e altri tipi non-stringa vengono restituiti via `ip || ""`
    expect(normalizeIpForCompare(123)).toBe(123);
    expect(normalizeIpForCompare(0)).toBe("");
    expect(normalizeIpForCompare(false)).toBe("");
  });

  it("rimuove prefisso ::ffff:", () => {
    expect(normalizeIpForCompare("::ffff:192.168.1.1")).toBe("192.168.1.1");
  });

  it("rimuove zone ID (%)", () => {
    expect(normalizeIpForCompare("fe80::1%eth0")).toBe("fe80::1");
  });

  it("rimuove porta da IPv4:porta", () => {
    expect(normalizeIpForCompare("192.168.1.1:3000")).toBe("192.168.1.1");
  });

  it("gestisce combinazione ::ffff: e porta", () => {
    expect(normalizeIpForCompare("::ffff:10.0.0.1:8080")).toBe("10.0.0.1");
  });

  it("non modifica un IPv4 semplice", () => {
    expect(normalizeIpForCompare("4.232.71.155")).toBe("4.232.71.155");
  });

  it("fa trim degli spazi", () => {
    expect(normalizeIpForCompare("  192.168.1.1  ")).toBe("192.168.1.1");
  });

  it("gestisce IPv6 puro senza zone", () => {
    expect(normalizeIpForCompare("::1")).toBe("::1");
  });
});

// ── isIpAllowed ────────────────────────────────────────────────────

describe("isIpAllowed", () => {
  const allowedIps = ["4.232.71.155", "192.168.178.*", "10.0.0.1"];

  it("consente un IP esatto nella lista", () => {
    expect(isIpAllowed("4.232.71.155", allowedIps)).toBe(true);
  });

  it("consente un IP che matcha il wildcard", () => {
    expect(isIpAllowed("192.168.178.42", allowedIps)).toBe(true);
    expect(isIpAllowed("192.168.178.1", allowedIps)).toBe(true);
    expect(isIpAllowed("192.168.178.255", allowedIps)).toBe(true);
  });

  it("rifiuta un IP non nella lista", () => {
    expect(isIpAllowed("8.8.8.8", allowedIps)).toBe(false);
  });

  it("rifiuta IP in subnet diversa dal wildcard", () => {
    expect(isIpAllowed("192.168.179.1", allowedIps)).toBe(false);
  });

  it("ritorna false per clientIp vuoto", () => {
    expect(isIpAllowed("", allowedIps)).toBe(false);
    expect(isIpAllowed(null, allowedIps)).toBe(false);
  });

  it("ritorna false per lista vuota", () => {
    expect(isIpAllowed("4.232.71.155", [])).toBe(false);
  });

  it("ritorna false per allowedIps non-array", () => {
    expect(isIpAllowed("4.232.71.155", null)).toBe(false);
  });
});

// ── buildStrapiPopulateQuery ───────────────────────────────────────

describe("buildStrapiPopulateQuery", () => {
  it("ritorna populate=* senza parametri", () => {
    expect(buildStrapiPopulateQuery(null)).toBe("populate=*");
    expect(buildStrapiPopulateQuery([])).toBe("populate=*");
  });

  it("costruisce query per un componente", () => {
    expect(buildStrapiPopulateQuery(["HeroImage"])).toBe(
      "populate[HeroImage][populate]=*"
    );
  });

  it("costruisce query per piu componenti con &", () => {
    const result = buildStrapiPopulateQuery(["HeroImage", "Team", "ValueCards"]);
    expect(result).toBe(
      "populate[HeroImage][populate]=*&populate[Team][populate]=*&populate[ValueCards][populate]=*"
    );
  });
});

// ── sanitizeFileName ───────────────────────────────────────────────

describe("sanitizeFileName", () => {
  it("mantiene nomi file semplici", () => {
    expect(sanitizeFileName("CV_Mario_Rossi.pdf")).toBe("CV_Mario_Rossi.pdf");
  });

  it("sostituisce caratteri speciali con underscore", () => {
    expect(sanitizeFileName("file (1)è.pdf")).toBe("file _1__.pdf");
  });

  it("gestisce input vuoto", () => {
    expect(sanitizeFileName("")).toBe("");
    expect(sanitizeFileName(null)).toBe("");
  });

  it("mantiene spazi, punti e trattini", () => {
    expect(sanitizeFileName("il mio file-v2.docx")).toBe("il mio file-v2.docx");
  });
});

// ── sanitizeFolderName ─────────────────────────────────────────────

describe("sanitizeFolderName", () => {
  it("mantiene nomi cartella semplici", () => {
    expect(sanitizeFolderName("Frontend_Developer")).toBe("Frontend_Developer");
  });

  it("usa fallback per input vuoto", () => {
    expect(sanitizeFolderName("")).toBe("Candidature_Spontanee");
    expect(sanitizeFolderName(null)).toBe("Candidature_Spontanee");
  });

  it("sostituisce caratteri non sicuri", () => {
    expect(sanitizeFolderName("Posizione/Test!è")).toBe("Posizione_Test__");
  });

  it("mantiene spazi e trattini", () => {
    expect(sanitizeFolderName("Full Stack - Senior")).toBe("Full Stack - Senior");
  });
});

// ── generateRobotsTxt ──────────────────────────────────────────────

describe("generateRobotsTxt", () => {
  it("genera robots.txt corretto", () => {
    const txt = generateRobotsTxt("https://www.b4us.it");
    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Allow: /");
    expect(txt).toContain("Sitemap: https://www.b4us.it/sitemap.xml");
  });

  it("rimuove trailing slash dal base URL", () => {
    const txt = generateRobotsTxt("https://www.b4us.it/");
    expect(txt).toContain("Sitemap: https://www.b4us.it/sitemap.xml");
    expect(txt).not.toContain("b4us.it//sitemap");
  });
});

// ── generateSitemapXml ─────────────────────────────────────────────

describe("generateSitemapXml", () => {
  const pages = [
    { path: "", changefreq: "weekly", priority: "1.0" },
    { path: "chi-siamo", changefreq: "monthly", priority: "0.8" },
  ];

  it("genera XML valido con header corretto", () => {
    const xml = generateSitemapXml("https://www.b4us.it", pages);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
  });

  it("include URL per la homepage (path vuoto)", () => {
    const xml = generateSitemapXml("https://www.b4us.it", pages);
    expect(xml).toContain("<loc>https://www.b4us.it</loc>");
  });

  it("include URL per le sotto-pagine", () => {
    const xml = generateSitemapXml("https://www.b4us.it", pages);
    expect(xml).toContain("<loc>https://www.b4us.it/chi-siamo</loc>");
  });

  it("include changefreq e priority", () => {
    const xml = generateSitemapXml("https://www.b4us.it", pages);
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>1.0</priority>");
  });

  it("gestisce lista vuota", () => {
    const xml = generateSitemapXml("https://www.b4us.it", []);
    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});
