/**
 * export-data.js
 * Esporta tutti i dati da Strapi in esecuzione e li salva come JSON
 * in SeedData/Export/single-types.json e SeedData/Export/collection-types.json
 * Copia anche le immagini da public/uploads/ in SeedData/Export/media/
 *
 * Uso: node scripts/export-data.js  (oppure npm run export-data)
 * Prerequisito: Strapi deve essere in esecuzione su localhost:1337
 */

var fs = require('fs');
var path = require('path');
var config = require('./strapi-config');

var axios = config.getAxiosInstance();
var STRAPI_URL = config.STRAPI_URL;
var EXPORT_DIR = config.EXPORT_DIR;
var UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
var MEDIA_DIR = path.join(EXPORT_DIR, 'media');

// ─── Tracker file media copiati ──────────────────────────────────
var copiedMediaFiles = [];

// ─── Utility: pulizia ricorsiva campi Strapi ─────────────────────
// Rimuove id, createdAt, updatedAt, publishedAt da oggetti annidati
// Rileva campi media (url con /uploads/) e li marca con __media
function cleanAttributes(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(function(item) { return cleanAttributes(item); });
  }
  if (typeof obj !== 'object') return obj;

  var cleaned = {};
  var keysToRemove = ['id', 'createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy',
                      'hash', 'ext', 'size', 'width', 'height', 'formats', 'provider',
                      'provider_metadata', 'folderPath', 'previewUrl', 'mime', 'caption'];

  Object.keys(obj).forEach(function(key) {
    if (keysToRemove.indexOf(key) !== -1) return;

    var val = obj[key];

    // Gestione struttura relazione/media Strapi v4: { data: { id, attributes } }
    if (val && typeof val === 'object' && val.data !== undefined && !Array.isArray(val) && Object.keys(val).length <= 2) {
      if (Array.isArray(val.data)) {
        // Relazione/media a molti: { data: [{ id, attributes }, ...] }
        cleaned[key] = val.data.map(function(item) {
          var attrs = cleanAttributes(item.attributes || item);
          return processMediaField(attrs);
        });
      } else if (val.data && val.data.attributes) {
        // Relazione singola o media singola: { data: { id, attributes } }
        var attrs = cleanAttributes(val.data.attributes);
        cleaned[key] = processMediaField(attrs);
      } else if (val.data === null) {
        cleaned[key] = null;
      } else {
        cleaned[key] = cleanAttributes(val);
      }
    } else {
      cleaned[key] = cleanAttributes(val);
    }
  });

  return cleaned;
}

// ─── Rileva e processa campo media ───────────────────────────────
// Se un oggetto ha un campo 'url' che inizia con /uploads/, è un file media
// Lo marca con __media: true e copia il file fisico
function processMediaField(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.url && typeof obj.url === 'string' && obj.url.indexOf('/uploads/') === 0) {
    var filename = path.basename(obj.url);
    // Copia il file fisico
    copyMediaFile(filename);
    return {
      __media: true,
      file: filename,
      name: obj.name || filename,
      alternativeText: obj.alternativeText || null
    };
  }
  return obj;
}

// ─── Copia file media da uploads/ a Export/media/ ────────────────
function copyMediaFile(filename) {
  var src = path.join(UPLOADS_DIR, filename);
  var dest = path.join(MEDIA_DIR, filename);

  if (!fs.existsSync(src)) {
    // Prova anche con le varianti thumbnail (small_, medium_, large_, thumbnail_)
    return;
  }

  if (copiedMediaFiles.indexOf(filename) !== -1) return; // gia copiato

  try {
    fs.copyFileSync(src, dest);
    copiedMediaFiles.push(filename);
  } catch (err) {
    console.log('    ⚠️  Impossibile copiare: ' + filename + ' — ' + err.message);
  }
}

// ─── Export Single Types ─────────────────────────────────────────
async function exportSingleTypes() {
  var result = {};

  for (var i = 0; i < config.SINGLE_TYPES.length; i++) {
    var st = config.SINGLE_TYPES[i];
    var queryStr = config.buildPopulateQuery(st.populate);
    var url = STRAPI_URL + '/' + st.apiId + queryStr;

    try {
      var response = await axios.get(url);
      if (response.data && response.data.data) {
        var attrs = response.data.data.attributes || response.data.data;
        result[st.apiId] = cleanAttributes(attrs);
        console.log('  ✅ ' + st.displayName);
      } else {
        console.log('  ⚠️  ' + st.displayName + ' — nessun dato trovato');
        result[st.apiId] = null;
      }
    } catch (error) {
      var status = error.response ? error.response.status : 'network';
      console.log('  ❌ ' + st.displayName + ' — errore ' + status + ': ' + error.message);
      result[st.apiId] = null;
    }
  }

  return result;
}

// ─── Export Collection Types ─────────────────────────────────────
async function exportCollectionTypes() {
  var result = {};

  for (var i = 0; i < config.COLLECTION_TYPES.length; i++) {
    var ct = config.COLLECTION_TYPES[i];
    var url = STRAPI_URL + '/' + ct.pluralId + '?populate=*&pagination[pageSize]=100';

    try {
      var response = await axios.get(url);
      if (response.data && response.data.data) {
        var items = response.data.data.map(function(item) {
          return cleanAttributes(item.attributes || item);
        });
        result[ct.pluralId] = items;
        console.log('  ✅ ' + ct.displayName + ' (' + items.length + ' elementi)');
      } else {
        console.log('  ⚠️  ' + ct.displayName + ' — nessun dato trovato');
        result[ct.pluralId] = [];
      }
    } catch (error) {
      var status = error.response ? error.response.status : 'network';
      console.log('  ❌ ' + ct.displayName + ' — errore ' + status + ': ' + error.message);
      result[ct.pluralId] = [];
    }
  }

  return result;
}

// ─── Main ────────────────────────────────────────────────────────
async function exportData() {
  console.log('\n📦 Export dati da Strapi...\n');

  // Assicurati che le cartelle esistano
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }

  // Export Single Types
  console.log('📄 Single Types:');
  var singleTypes = await exportSingleTypes();

  // Export Collection Types
  console.log('\n📚 Collection Types:');
  var collectionTypes = await exportCollectionTypes();

  // Scrivi i file JSON
  var timestamp = new Date().toISOString();

  var singleTypesFile = path.join(EXPORT_DIR, 'single-types.json');
  fs.writeFileSync(singleTypesFile, JSON.stringify({
    exportedAt: timestamp,
    singleTypes: singleTypes
  }, null, 2), 'utf8');
  console.log('\n✅ Scritto: ' + singleTypesFile);

  var collectionTypesFile = path.join(EXPORT_DIR, 'collection-types.json');
  fs.writeFileSync(collectionTypesFile, JSON.stringify({
    exportedAt: timestamp,
    collectionTypes: collectionTypes
  }, null, 2), 'utf8');
  console.log('✅ Scritto: ' + collectionTypesFile);

  // Report media
  if (copiedMediaFiles.length > 0) {
    console.log('\n🖼️  Copiati ' + copiedMediaFiles.length + ' file media in Export/media/');
  } else {
    console.log('\n📝 Nessun file media trovato nei dati');
  }

  console.log('\n✨ Export completato!\n');
}

// Esegui se chiamato direttamente
if (require.main === module) {
  exportData().catch(function(err) {
    console.error('❌ Errore durante export:', err.message);
    process.exit(1);
  });
}

module.exports = { exportData: exportData };
