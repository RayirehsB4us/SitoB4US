/**
 * Utility functions extracted from server.js for testability.
 * server.js imports these; tests can import them directly.
 */

/**
 * Normalizza un indirizzo IP per il confronto:
 * - Rimuove prefisso ::ffff: (IPv4-mapped IPv6)
 * - Rimuove zone ID (%...)
 * - Rimuove porta da IPv4:porta
 */
function normalizeIpForCompare(ip) {
  if (!ip || typeof ip !== "string") return ip || "";
  let s = ip.trim();
  if (s.startsWith("::ffff:")) s = s.substring(7);
  if (s.includes("%")) s = s.split("%")[0];
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(s)) s = s.replace(/:(\d+)$/, "");
  return s;
}

/**
 * Controlla se un IP client corrisponde a una lista di IP/pattern consentiti.
 * Supporta IP singoli e wildcard (es. "192.168.1.*")
 */
function isIpAllowed(clientIp, allowedIps) {
  if (!clientIp || !Array.isArray(allowedIps)) return false;
  return allowedIps.some((rule) => {
    const normRule = normalizeIpForCompare(rule);
    if (rule.endsWith(".*")) {
      const prefix = normRule.slice(0, -1);
      return clientIp.startsWith(prefix);
    }
    return clientIp === normRule;
  });
}

/**
 * Costruisce la query string per il populate di Strapi.
 * @param {string[]} deepPopulate - Componenti da popolare in profondità
 * @returns {string} Query string
 */
function buildStrapiPopulateQuery(deepPopulate) {
  if (deepPopulate && deepPopulate.length > 0) {
    return deepPopulate
      .map((c) => "populate[" + c + "][populate]=*")
      .join("&");
  }
  return "populate=*";
}

/**
 * Sanitizza un nome file per SharePoint: rimuove caratteri non sicuri.
 */
function sanitizeFileName(fileName) {
  return (fileName || "").replace(/[^a-zA-Z0-9._\- ]/g, "_");
}

/**
 * Sanitizza un nome cartella per SharePoint.
 */
function sanitizeFolderName(folderName) {
  return (folderName || "Candidature_Spontanee").replace(/[^a-zA-Z0-9_\- ]/g, "_");
}

/**
 * Genera l'XML della sitemap.
 */
function generateSitemapXml(baseUrl, pages) {
  const base = baseUrl.replace(/\/$/, "");
  const urls = pages.map(({ path, changefreq, priority }) => {
    const loc = path ? `${base}/${path}` : base;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
    "\n</urlset>"
  );
}

/**
 * Genera il contenuto di robots.txt.
 */
function generateRobotsTxt(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  return `# ${base}\nUser-agent: *\nAllow: /\n\n# Sitemap\nSitemap: ${base}/sitemap.xml\n`;
}

module.exports = {
  normalizeIpForCompare,
  isIpAllowed,
  buildStrapiPopulateQuery,
  sanitizeFileName,
  sanitizeFolderName,
  generateSitemapXml,
  generateRobotsTxt,
};
