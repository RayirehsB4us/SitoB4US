/**
 * seed-data.js
 * Wrapper che avvia l'import dei dati da SeedData/Import/ in Strapi
 *
 * I dati NON sono più hardcoded qui — vengono letti dai file JSON:
 *   - SeedData/Import/single-types.json
 *   - SeedData/Import/collection-types.json
 *
 * Uso: node scripts/seed-data.js  (oppure npm run seed)
 * Prerequisito: Strapi deve essere in esecuzione su localhost:1337
 *
 * Workflow completo:
 *   1. npm run seed           → importa dati da Import/ in Strapi
 *   2. npm run export-data    → esporta dati da Strapi in Export/
 *   3. Copia Export/*.json → Import/*.json per trasferire a un'altra istanza
 */

var { importData } = require('./import-data');

async function seedData() {
  console.log('🌱 Avvio seed da SeedData/Import/...\n');

  try {
    await importData();
    console.log('\n✨ Seed completato con successo!');
    console.log('📌 Ricorda di pubblicare i contenuti dal pannello di amministrazione Strapi');
    console.log('   Vai su http://localhost:1337/admin\n');
  } catch (error) {
    console.error('❌ Errore durante il seed:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
seedData();
