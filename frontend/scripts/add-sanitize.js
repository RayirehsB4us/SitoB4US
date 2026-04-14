/**
 * Script per aggiungere sanitize() a tutti i <%- campo %> nelle view EJS.
 * NON tocca le <%- include(...) %> e i campi gia' sanitizzati.
 *
 * Uso: node scripts/add-sanitize.js
 * Aggiunge --dry per vedere le modifiche senza applicarle.
 */
const fs = require("fs");
const path = require("path");

const VIEWS_DIR = path.join(__dirname, "..", "views");
const DRY_RUN = process.argv.includes("--dry");

// Regex: cattura <%- CONTENUTO %> dove CONTENUTO non inizia con include( o sanitize(
// Gestisce anche multilinea (es. <%- campo\n|| '' %>)
const UNESCAPED_RE = /<%-([\s\S]*?)%>/g;

function shouldSkip(content) {
  const trimmed = content.trim();
  // Skip include() statements
  if (trimmed.startsWith("include(")) return true;
  // Already sanitized
  if (trimmed.startsWith("sanitize(")) return true;
  return false;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let modified = original;
  let count = 0;

  modified = modified.replace(UNESCAPED_RE, (match, innerContent) => {
    if (shouldSkip(innerContent)) return match;

    count++;
    // Preserva gli spazi originali attorno al contenuto
    const trimmed = innerContent.trim();
    // Rileva se il contenuto ha || '' o || "" fallback
    // Wrappa tutto in sanitize()
    const leadingSpace = innerContent.match(/^\s*/)[0];
    const trailingSpace = innerContent.match(/\s*$/)[0];

    return `<%-${leadingSpace}sanitize(${trimmed})${trailingSpace}%>`;
  });

  if (count > 0) {
    const rel = path.relative(VIEWS_DIR, filePath);
    if (DRY_RUN) {
      console.log(`[DRY] ${rel}: ${count} campi da sanitizzare`);
    } else {
      fs.writeFileSync(filePath, modified, "utf8");
      console.log(`[OK]  ${rel}: ${count} campi sanitizzati`);
    }
  }
  return count;
}

function walkDir(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += walkDir(fullPath);
    } else if (entry.name.endsWith(".ejs")) {
      total += processFile(fullPath);
    }
  }
  return total;
}

console.log(DRY_RUN ? "=== DRY RUN ===" : "=== Applicando sanitize() ===");
const total = walkDir(VIEWS_DIR);
console.log(`\nTotale: ${total} campi ${DRY_RUN ? "da sanitizzare" : "sanitizzati"}`);
