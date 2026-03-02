/**
 * strapi-config.js
 * Configurazione condivisa per export-data.js e import-data.js
 * Contiene definizioni content types, deep populate e auth
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');
const path = require('path');

// ─── Costanti ────────────────────────────────────────────────────
const STRAPI_URL = 'http://localhost:1337/api';
const SEED_DATA_DIR = path.join(__dirname, '..', 'SeedData');
const EXPORT_DIR = path.join(SEED_DATA_DIR, 'Export');
const IMPORT_DIR = path.join(SEED_DATA_DIR, 'Import');

// ─── Auth ────────────────────────────────────────────────────────
function getAxiosInstance() {
  var token = process.env.FRONTEND_API_TOKEN || '';
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    console.log('🔑 Token API configurato');
  } else {
    console.log('⚠️  Nessun FRONTEND_API_TOKEN trovato in .env');
  }
  return axios;
}

// ─── Deep Populate Query Builder ─────────────────────────────────
// Costruisce la query string per i componenti annidati
// Es: buildPopulateQuery(['Carfleet', 'Open4us']) =>
//   "?populate[Carfleet][populate]=*&populate[Open4us][populate]=*"
function buildPopulateQuery(components) {
  if (!components || components.length === 0) {
    return '?populate=*';
  }
  var parts = components.map(function(comp) {
    return 'populate[' + comp + '][populate]=*';
  });
  return '?' + parts.join('&');
}

// ─── Single Types ────────────────────────────────────────────────
// populate: array di nomi componenti per deep populate, oppure null per ?populate=*
var SINGLE_TYPES = [
  {
    apiId: 'home',
    displayName: 'Home Page',
    populate: null
  },
  {
    apiId: 'organizzazione',
    displayName: 'Organizzazione',
    populate: ['HeroSection', 'techArea', 'knowledgeArea', 'CoverImage']
  },
  {
    apiId: 'service',
    displayName: 'Service',
    populate: null
  },
  {
    apiId: 'prodotti',
    displayName: 'Prodotti',
    populate: ['Carfleet', 'Open4us', 'DashboardPrenotazioni']
  },
  {
    apiId: 'car-fleet',
    displayName: 'Car Fleet',
    populate: ['IconText', 'DashboardPanoramica', 'PowerappsBlocks', 'MappaFlotta', 'AccesBlock']
  },
  {
    apiId: 'open4-us',
    displayName: 'Open4US',
    populate: ['AccesSmart', 'ImageCard', 'SmartBlock', 'DashboardOptions', 'CalendarBlock', 'SpaceBlock', 'AppIcon', 'AppBlocks']
  },
  {
    apiId: 'storia',
    displayName: 'Storia',
    populate: null
  },
  {
    apiId: 'carriere',
    displayName: 'Carriere',
    populate: ['HeroImage', 'CultureCards']
  },
  {
    apiId: 'contatti',
    displayName: 'Contatti',
    populate: ['ContactDetails']
  },
  {
    apiId: 'blog-page',
    displayName: 'Blog Page',
    populate: null
  },
  {
    apiId: 'chi-siamo',
    displayName: 'Chi Siamo',
    populate: ['ValueCards', 'HeroImage']
  }
];

// ─── Collection Types (solo quelli da seedare) ───────────────────
// identityField: campo usato per il controllo duplicati
// importOrder: ordine di importazione (tags prima per le relazioni)
var COLLECTION_TYPES = [
  {
    apiId: 'tags',
    pluralId: 'tags',
    displayName: 'Tags',
    identityField: 'title',
    importOrder: 1
  },
  {
    apiId: 'servizi',
    pluralId: 'servizi',
    displayName: 'Servizi',
    identityField: 'titolo',
    importOrder: 2
  },
  {
    apiId: 'team-members',
    pluralId: 'team-members',
    displayName: 'Team Members',
    identityField: 'nome',
    importOrder: 3
  },
  {
    apiId: 'blog-posts',
    pluralId: 'blog-posts',
    displayName: 'Blog Posts',
    identityField: 'titolo',
    importOrder: 4
  },
  {
    apiId: 'job-positions',
    pluralId: 'job-positions',
    displayName: 'Job Positions',
    identityField: 'titolo',
    importOrder: 5
  },
  {
    apiId: 'storia-b4-us',
    pluralId: 'storia-b4-uses',
    displayName: 'Storia B4US',
    identityField: 'Anno',
    importOrder: 6
  }
];

// ─── Export ──────────────────────────────────────────────────────
module.exports = {
  STRAPI_URL: STRAPI_URL,
  SEED_DATA_DIR: SEED_DATA_DIR,
  EXPORT_DIR: EXPORT_DIR,
  IMPORT_DIR: IMPORT_DIR,
  SINGLE_TYPES: SINGLE_TYPES,
  COLLECTION_TYPES: COLLECTION_TYPES,
  getAxiosInstance: getAxiosInstance,
  buildPopulateQuery: buildPopulateQuery
};
