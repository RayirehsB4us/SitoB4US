const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337/api';

// Dati iniziali da popolare
const servizi = [
  {
    titolo: 'Cloud Transformation',
    descrizione: 'Supportiamo la migrazione dei tuoi sistemi verso il cloud, ottimizzando costi e migliorando la scalabilità della tua infrastruttura.',
    icona: 'cloud_queue',
    ordine: 1
  },
  {
    titolo: 'Cyber Security',
    descrizione: 'Proteggiamo i tuoi dati aziendali con protocolli avanzati di sicurezza e monitoraggio costante contro ogni tipo di minaccia.',
    icona: 'security',
    ordine: 2
  },
  {
    titolo: 'Software Development',
    descrizione: 'Sviluppiamo soluzioni software personalizzate, web app e mobile app basate sulle ultime tecnologie di mercato.',
    icona: 'code',
    ordine: 3
  },
  {
    titolo: 'Data Analytics & AI',
    descrizione: 'Trasformiamo i tuoi dati in valore decisionale attraverso algoritmi di AI e dashboard di analisi predittiva in tempo reale.',
    icona: 'analytics',
    ordine: 4
  },
  {
    titolo: 'System Integration',
    descrizione: 'Colleghiamo i tuoi sistemi frammentati in un ecosistema coeso per massimizzare l\'efficienza dei flussi di lavoro aziendali.',
    icona: 'settings_input_component',
    ordine: 5
  },
  {
    titolo: 'IT Managed Services',
    descrizione: 'Gestione completa della tua infrastruttura IT, garantendo continuità operativa 24/7 con tempi di intervento garantiti.',
    icona: 'support_agent',
    ordine: 6
  }
];

const teamMembers = [
  {
    nome: 'Riccardo Germinario',
    ruolo: 'CEO & Founder',
    ordine: 1
  },
  {
    nome: 'Nicolò Guerra',
    ruolo: 'Cloud - Collaboration',
    ordine: 2
  },
  {
    nome: 'Pedro Nova',
    ruolo: 'Systems',
    ordine: 3
  },
  {
    nome: 'Pasquale Schiavone',
    ruolo: 'Cloud - Infrastructure',
    ordine: 4
  }
];

const blogPosts = [
  {
    titolo: 'La Nuova Frontiera della Sicurezza Informatica nel 2024',
    descrizione: 'Scopri come le aziende stanno adottando l\'approccio Zero Trust per contrastare le minacce sempre più sofisticate guidate dall\'AI.',
    categoria: 'Cybersecurity',
    dataPublicazione: '2024-05-12',
    tempoLettura: 5
  },
  {
    titolo: 'AI Generativa: Da Trend a Strumento Operativo per le PMI',
    descrizione: 'L\'intelligenza artificiale non è più solo per i colossi tecnologici. Vediamo casi studio reali di come le piccole e medie imprese italiane...',
    categoria: 'AI & Data',
    dataPublicazione: '2024-05-08',
    tempoLettura: 8
  },
  {
    titolo: 'Migrazione Cloud: Errori Comuni e Come Evitarli',
    descrizione: 'Passare al cloud è un passo fondamentale per la digitalizzazione, ma senza una strategia chiara i costi possono sfuggire al controllo.',
    categoria: 'Cloud Strategy',
    dataPublicazione: '2024-05-02',
    tempoLettura: 4
  },
  {
    titolo: 'Sostenibilità Digitale: Il Green IT come Priorità',
    descrizione: 'Come ridurre l\'impatto ambientale dell\'infrastruttura IT aziendale migliorando al contempo le prestazioni e riducendo i costi.',
    categoria: 'Innovazione',
    dataPublicazione: '2024-04-25',
    tempoLettura: 6
  }
];

const jobPositions = [
  {
    titolo: 'Senior Full Stack Developer',
    descrizione: '<p>Siamo alla ricerca di un Senior Full Stack Developer con esperienza in Node.js e React per potenziare il nostro team di sviluppo prodotto.</p><ul><li>Esperienza minima 5 anni</li><li>Ottima conoscenza di TypeScript</li><li>Esperienza con Architetture Cloud (AWS/Azure)</li></ul>',
    location: 'Milano / Remote',
    tipologia: 'Full-time',
    reparto: 'Sviluppo',
    icona: 'code',
    attiva: true,
    ordine: 1
  },
  {
    titolo: 'Cyber Security Analyst',
    descrizione: '<p>Cerchiamo un profilo specializzato in analisi delle vulnerabilità e monitoraggio delle infrastrutture IT.</p><ul><li>Competenze in penetration testing</li><li>Gestione SIEM</li><li>Certificazioni (es. OSCP) gradite</li></ul>',
    location: 'Roma / Remote',
    tipologia: 'Full-time',
    reparto: 'Cybersecurity',
    icona: 'security',
    attiva: true,
    ordine: 2
  },
  {
    titolo: 'Cloud Architect',
    descrizione: '<p>Progetta e implementa infrastrutture cloud scalabili per i nostri clienti di fascia Enterprise.</p>',
    location: 'Remote',
    tipologia: 'Full-time',
    reparto: 'Infrastruttura',
    icona: 'cloud',
    attiva: true,
    ordine: 3
  }
];

const homePageData = {
  heroTitle: 'Simplify IT with B4US.',
  heroSubtitle: 'Siamo una giovane e dinamica società di consulenza, soluzioni e servizi IT nata per guidare la tua azienda nel futuro digitale.',
  introTitle: 'Chi è B4US?',
  introDescription: '<p>B4US è una giovane e dinamica società di consulenza, soluzioni e servizi IT nata dalla passione di esperti del settore.</p><p>Ci impegniamo ogni giorno per semplificare la complessità tecnologica, offrendo soluzioni su misura che permettano ai nostri clienti di concentrarsi sul loro core business.</p><p>La nostra missione è essere il partner tecnologico di fiducia, guidando l\'innovazione attraverso competenza, etica e visione.</p>',
  einsteinQuote: '"Non pretendiamo che le cose cambino, se continuiamo a fare le stesse cose. La crisi può essere una grande benedizione per le persone e le nazioni, perché la crisi porta progressi..."',
  servicesTitle: 'Le nostre soluzioni',
  servicesSubtitle: ''
};

async function seedData() {
  console.log('🌱 Inizio popolamento dati Strapi...\n');

  try {
    // Popola Servizi
    console.log('📦 Popolamento Servizi...');
    for (const servizio of servizi) {
      try {
        await axios.post(`${STRAPI_URL}/servizi`, {
          data: servizio
        });
        console.log(`  ✅ Creato: ${servizio.titolo}`);
      } catch (error) {
        console.log(`  ⚠️  Errore creando ${servizio.titolo}: ${error.message}`);
      }
    }

    // Popola Team Members
    console.log('\n👥 Popolamento Team Members...');
    for (const member of teamMembers) {
      try {
        await axios.post(`${STRAPI_URL}/team-members`, {
          data: member
        });
        console.log(`  ✅ Creato: ${member.nome}`);
      } catch (error) {
        console.log(`  ⚠️  Errore creando ${member.nome}: ${error.message}`);
      }
    }

    // Popola Blog Posts
    console.log('\n📝 Popolamento Blog Posts...');
    for (const post of blogPosts) {
      try {
        await axios.post(`${STRAPI_URL}/blog-posts`, {
          data: post
        });
        console.log(`  ✅ Creato: ${post.titolo}`);
      } catch (error) {
        console.log(`  ⚠️  Errore creando ${post.titolo}: ${error.message}`);
      }
    }

    // Popola Job Positions
    console.log('\n💼 Popolamento Job Positions...');
    for (const job of jobPositions) {
      try {
        await axios.post(`${STRAPI_URL}/job-positions`, {
          data: job
        });
        console.log(`  ✅ Creato: ${job.titolo}`);
      } catch (error) {
        console.log(`  ⚠️  Errore creando ${job.titolo}: ${error.message}`);
      }
    }

    // Popola Home Page (Single Type)
    console.log('\n🏠 Popolamento Home Page...');
    try {
      await axios.put(`${STRAPI_URL}/home`, {
        data: homePageData
      });
      console.log('  ✅ Home page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando home: ${error.message}`);
    }

    console.log('\n✨ Popolamento completato con successo!');
    console.log('\n📌 Ricorda di pubblicare i contenuti dal pannello di amministrazione Strapi');
    console.log('   Vai su http://localhost:1337/admin\n');

  } catch (error) {
    console.error('❌ Errore durante il popolamento:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
seedData();
