/**
 * import-data.js
 * Legge i file JSON da SeedData/Import/ e popola Strapi
 * Carica le immagini da SeedData/Import/media/ via Upload API
 * Controlla i duplicati per le collection types prima di inserire
 *
 * Uso: node scripts/import-data.js  (oppure npm run import-data)
 * Prerequisito: Strapi deve essere in esecuzione su localhost:1337
 */

var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var config = require('./strapi-config');

var axios = config.getAxiosInstance();
var STRAPI_URL = config.STRAPI_URL;
var IMPORT_DIR = config.IMPORT_DIR;
var MEDIA_DIR = path.join(IMPORT_DIR, 'media');

// ─── Mappa filename → ID Strapi dopo upload ─────────────────────
var mediaMap = {};

// ─── Leggi file JSON da Import ───────────────────────────────────
function readJsonFile(filename) {
  var filePath = path.join(IMPORT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  File non trovato: ' + filePath);
    return null;
  }
  var content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// ─── Upload singolo file media su Strapi ─────────────────────────
async function uploadMediaFile(filename) {
  var filePath = path.join(MEDIA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log('    ⚠️  File non trovato: ' + filename);
    return null;
  }

  try {
    var form = new FormData();
    form.append('files', fs.createReadStream(filePath), filename);

    var response = await axios.post(
      STRAPI_URL.replace('/api', '') + '/api/upload',
      form,
      { headers: form.getHeaders() }
    );

    if (response.data && response.data[0]) {
      return response.data[0].id;
    }
    return null;
  } catch (error) {
    var msg = error.response ? (error.response.data.error || error.response.status) : error.message;
    console.log('    ❌ Upload fallito per ' + filename + ': ' + msg);
    return null;
  }
}

// ─── Upload tutti i file media dalla cartella ────────────────────
async function uploadAllMedia() {
  if (!fs.existsSync(MEDIA_DIR)) {
    console.log('  📝 Nessuna cartella media/ trovata in Import/ — skip upload immagini');
    return;
  }

  var files = fs.readdirSync(MEDIA_DIR).filter(function(f) {
    // Solo file immagine/video, escludi .gitkeep e simili
    return /\.(jpg|jpeg|png|gif|svg|webp|mp4|pdf|ico)$/i.test(f);
  });

  if (files.length === 0) {
    console.log('  📝 Nessun file media da caricare');
    return;
  }

  console.log('  📤 Caricamento ' + files.length + ' file media...');

  for (var i = 0; i < files.length; i++) {
    var filename = files[i];

    // Controlla se esiste gia in Strapi (per nome)
    try {
      var checkResp = await axios.get(
        STRAPI_URL.replace('/api', '') + '/api/upload/files?filters[name][$eq]=' + encodeURIComponent(filename)
      );
      if (checkResp.data && checkResp.data.length > 0) {
        mediaMap[filename] = checkResp.data[0].id;
        console.log('    ⏭️  Già presente: ' + filename + ' (ID: ' + checkResp.data[0].id + ')');
        continue;
      }
    } catch (e) {
      // Se il check fallisce, prova a caricare comunque
    }

    var id = await uploadMediaFile(filename);
    if (id) {
      mediaMap[filename] = id;
      console.log('    ✅ Caricato: ' + filename + ' (ID: ' + id + ')');
    }
  }

  console.log('  🖼️  Media map: ' + Object.keys(mediaMap).length + ' file → ID');
}

// ─── Risolvi marcatori __media nei dati ──────────────────────────
// Sostituisce ricorsivamente { __media: true, file: "x.jpg" } con l'ID numerico
function resolveMediaInData(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(function(item) { return resolveMediaInData(item); });
  }

  if (typeof obj !== 'object') return obj;

  // Se e un marcatore __media, sostituisci con ID
  if (obj.__media === true && obj.file) {
    var id = mediaMap[obj.file];
    if (id) {
      return id;
    } else {
      console.log('    ⚠️  Media non trovato nella map: ' + obj.file);
      return null;
    }
  }

  // Ricorsione su tutti i campi
  var resolved = {};
  Object.keys(obj).forEach(function(key) {
    resolved[key] = resolveMediaInData(obj[key]);
  });
  return resolved;
}

// ─── Controllo duplicati per collection ──────────────────────────
async function checkDuplicate(pluralId, identityField, value) {
  try {
    var filterValue = encodeURIComponent(value);
    var url = STRAPI_URL + '/' + pluralId + '?filters[' + identityField + '][$eq]=' + filterValue;
    var response = await axios.get(url);
    if (response.data && response.data.data && response.data.data.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// ─── Risoluzione relazioni tags ──────────────────────────────────
async function resolveTagIds() {
  var tagMap = {};
  try {
    var response = await axios.get(STRAPI_URL + '/tags?pagination[pageSize]=100');
    if (response.data && response.data.data) {
      response.data.data.forEach(function(tag) {
        var title = tag.attributes ? tag.attributes.title : tag.title;
        tagMap[title] = tag.id;
      });
    }
    console.log('  📋 Mappati ' + Object.keys(tagMap).length + ' tag title → ID');
  } catch (error) {
    console.log('  ⚠️  Impossibile recuperare tag IDs: ' + error.message);
  }
  return tagMap;
}

// ─── Risolvi tags nei dati organizzazione ────────────────────────
function resolveTagsInData(data, tagMap) {
  if (!data || !data.techArea || !Array.isArray(data.techArea)) return data;

  var resolved = JSON.parse(JSON.stringify(data));
  resolved.techArea.forEach(function(area) {
    if (area.tags && Array.isArray(area.tags)) {
      var resolvedIds = [];
      area.tags.forEach(function(tag) {
        if (typeof tag === 'object' && tag.title) {
          var id = tagMap[tag.title];
          if (id) {
            resolvedIds.push(id);
          } else {
            console.log('    ⚠️  Tag non trovato: ' + tag.title);
          }
        } else if (typeof tag === 'number') {
          resolvedIds.push(tag);
        } else if (typeof tag === 'string') {
          var id2 = tagMap[tag];
          if (id2) resolvedIds.push(id2);
        }
      });
      area.tags = resolvedIds;
    }
  });
  return resolved;
}

// ─── Import Collection Types ─────────────────────────────────────
async function importCollections(collectionData) {
  if (!collectionData || !collectionData.collectionTypes) {
    console.log('⚠️  Nessun dato collection da importare');
    return;
  }

  var sortedTypes = config.COLLECTION_TYPES.slice().sort(function(a, b) {
    return a.importOrder - b.importOrder;
  });

  for (var i = 0; i < sortedTypes.length; i++) {
    var ct = sortedTypes[i];
    var items = collectionData.collectionTypes[ct.pluralId];

    if (!items || items.length === 0) {
      console.log('  ⏭️  ' + ct.displayName + ' — nessun dato');
      continue;
    }

    console.log('\n📥 ' + ct.displayName + ' (' + items.length + ' elementi)...');

    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      var identityValue = item[ct.identityField];
      var label = identityValue !== undefined ? identityValue : ('item ' + (j + 1));

      try {
        var exists = await checkDuplicate(ct.pluralId, ct.identityField, identityValue);
        if (exists) {
          console.log('  ⏭️  Già esistente: ' + label);
          continue;
        }

        // Risolvi riferimenti media prima di POST
        var resolvedItem = resolveMediaInData(item);
        await axios.post(STRAPI_URL + '/' + ct.pluralId, { data: resolvedItem });
        console.log('  ✅ Creato: ' + label);
      } catch (error) {
        var msg = error.response ? JSON.stringify(error.response.data).substring(0, 200) : error.message;
        console.log('  ❌ Errore creando ' + label + ': ' + msg);
      }
    }
  }
}

// ─── Import Single Types ─────────────────────────────────────────
async function importSingleTypes(singleTypeData, tagMap) {
  if (!singleTypeData || !singleTypeData.singleTypes) {
    console.log('⚠️  Nessun dato single type da importare');
    return;
  }

  for (var i = 0; i < config.SINGLE_TYPES.length; i++) {
    var st = config.SINGLE_TYPES[i];
    var data = singleTypeData.singleTypes[st.apiId];

    if (!data) {
      console.log('  ⏭️  ' + st.displayName + ' — nessun dato');
      continue;
    }

    try {
      // Risolvi tag IDs per organizzazione
      if (st.apiId === 'organizzazione' && tagMap) {
        data = resolveTagsInData(data, tagMap);
      }

      // Risolvi riferimenti media prima di PUT
      var resolvedData = resolveMediaInData(data);

      await axios.put(STRAPI_URL + '/' + st.apiId, { data: resolvedData });
      console.log('  ✅ ' + st.displayName);
    } catch (error) {
      var msg = error.response ? JSON.stringify(error.response.data).substring(0, 200) : error.message;
      console.log('  ❌ Errore aggiornando ' + st.displayName + ': ' + msg);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────
async function importData() {
  console.log('\n🌱 Import dati in Strapi da SeedData/Import/...\n');

  // Verifica che la cartella Import esista
  if (!fs.existsSync(IMPORT_DIR)) {
    console.error('❌ Cartella Import non trovata: ' + IMPORT_DIR);
    console.error('   Crea i file JSON in SeedData/Import/ o esegui prima export-data.js');
    process.exit(1);
  }

  // Leggi i file JSON
  var collectionData = readJsonFile('collection-types.json');
  var singleTypeData = readJsonFile('single-types.json');

  if (!collectionData && !singleTypeData) {
    console.error('❌ Nessun file JSON trovato in ' + IMPORT_DIR);
    console.error('   Copia i file da SeedData/Export/ o crea manualmente:');
    console.error('   - single-types.json');
    console.error('   - collection-types.json');
    process.exit(1);
  }

  // 0. Upload media (se la cartella esiste)
  console.log('🖼️  Upload Media...');
  await uploadAllMedia();

  // 1. Importa collection types (tags prima di tutto)
  console.log('\n📚 Importazione Collection Types...');
  await importCollections(collectionData);

  // 2. Risolvi tag IDs dopo l'import dei tags
  console.log('\n🔗 Risoluzione relazioni...');
  var tagMap = await resolveTagIds();

  // 3. Importa single types (con relazioni e media risolti)
  console.log('\n📄 Importazione Single Types...');
  await importSingleTypes(singleTypeData, tagMap);

  console.log('\n✨ Import completato!');
  console.log('📌 Ricorda di pubblicare i contenuti da http://localhost:1337/admin\n');
}

// Esegui se chiamato direttamente
if (require.main === module) {
  importData().catch(function(err) {
    console.error('❌ Errore durante import:', err.message);
    process.exit(1);
  });
}

module.exports = { importData: importData };
