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

// ═══════════════════════════════════════════════════════════════════
// NUOVI DATI SEED — pagine dinamizzate
// ═══════════════════════════════════════════════════════════════════

const tags = [
  { title: 'Agile', icon: 'sync_alt' },
  { title: 'Project Management', icon: 'task_alt' },
  { title: 'Certificazioni', icon: 'verified' },
  { title: 'Gestione Team', icon: 'groups' },
  { title: 'Cloud & Infrastruttura', icon: 'cloud_queue' },
  { title: 'Sviluppo Software', icon: 'code' },
  { title: 'Cyber Security', icon: 'security' },
  { title: 'Data & AI', icon: 'analytics' },
  { title: 'System Integration', icon: 'integration_instructions' },
  { title: 'DevOps & Sysadmin', icon: 'terminal' }
];

const servicePageData = {
  Maintitle: 'Soluzioni IT <span class="text-primary">su misura</span> per il tuo business.',
  descriptiontitle: 'B4US è una società dinamica nata per semplificare la complessità tecnologica. Offriamo consulenza e servizi IT d\'avanguardia per guidare la tua trasformazione digitale.',
  ButtonServizi: 'Esplora i Servizi',
  ButtonContatti: 'Contattaci ora',
  OurSkills: [
    { Tag: 'Le nostre competenze', Title: 'Cosa facciamo per te' }
  ]
};

const prodottiPageData = {
  Title: 'Semplifica le tue Operazioni',
  Title2: 'con Software Intelligenti',
  subtitle: 'Dalla gestione della flotta aziendale al controllo accessi smart per spazi condivisi. Scopri come B4US trasforma logistiche complesse in flussi di lavoro semplici e digitali.',
  Link: 'Scopri di più sull\'Accesso Smart',
  Icon: 'arrow_forward',
  Carfleet: {
    Icon: 'directions_car',
    Title: 'CarFleet',
    subtitle: 'Gestione Flotta Aziendale con PowerApps',
    Description: 'Ottimizza l\'allocazione dei tuoi veicoli con tracciamento in tempo reale, approvazioni delle prenotazioni e programmazione della manutenzione. Costruito sulla robusta Microsoft Power Platform per un\'integrazione perfetta.',
    bulletpointcar: [
      { Icon: 'check_circle', Title: 'Dashboard Intelligente', Description: 'Metriche visive per viaggi attivi, ritardi e validazioni.' },
      { Icon: 'check_circle', Title: 'Geofence & GPS', Description: 'Tracciamento della posizione in tempo reale e avvisi di confine.' },
      { Icon: 'check_circle', Title: 'Flusso di Manutenzione', Description: 'Avvisi automatici per assistenza e riparazioni.' }
    ],
    Link: 'Esplora le Funzionalità di CarFleet',
    icon2: 'arrow_forward'
  },
  Open4us: {
    Icon: 'meeting_room',
    Title: 'Open4US',
    SubTitle: 'Accesso Smart per Spazi Condivisi',
    Description: 'Rivoluziona il modo in cui gestisci coworking, palestre e strutture pubbliche. Integrazione perfetta con serrature smart ISEO e il sistema di gestione Luckey per un\'esperienza senza chiavi.',
    Open4usBlocks: [
      { Icon: 'bluetooth', Title: 'Sblocco Bluetooth', Description: 'Sblocca le porte direttamente dall\'app del tuo smartphone in modo sicuro.' },
      { Icon: 'dashboard', Title: 'Dashboard Centrale', Description: 'Gestisci i permessi utente e visualizza i log di accesso in tempo reale.' },
      { Icon: 'event_available', Title: 'Sistema di Prenotazione', Description: 'Calendario integrato per la prenotazione di sale e risorse.' },
      { Icon: 'settings_remote', Title: 'Integrazione Hardware', Description: 'Funziona nativamente con gli ecosistemi ISEO Argo e Luckey.' }
    ]
  },
  DashboardPrenotazioni: {
    Title: 'Dashboard Prenotazioni',
    Status: 'Confermato',
    Prenotazioni: [
      { title: 'Ufficio Amministrativo Comune Gorgonzola', subTitle: '26/02/2025 17:00 - 17:30', icon: 'lock', content: 'Serratura Smart ISEO Pronta' },
      { title: 'Prenotazione Campo da Basket', subTitle: 'Mercoledì 28/05/2025', icon: 'smartphone', content: 'Sblocco App Abilitato' }
    ]
  }
};

const carFleetPageData = {
  Icon: 'directions_car',
  UpperTitle: 'Gestione Flotta Aziendale',
  Title: 'Gestisci la tua flotta',
  Title2: 'aziendale con intelligenza',
  SubTitle: 'Gestisci prenotazioni in modo efficiente, traccia i veicoli in tempo reale e automatizza gli accessi con la nostra soluzione personalizzata su PowerApps. Semplifica le operazioni della tua flotta oggi stesso.',
  Button1: 'Prenota una Demo',
  Button2: 'Scopri le Funzionalità',
  IconText: [
    { Icon: 'check_circle', Text: 'Tracciamento GPS' },
    { Icon: 'check_circle', Text: 'PowerApps Integration' },
    { Icon: 'check_circle', Text: 'Accesso Automatico' }
  ],
  UpperTitle2: 'Panoramica Dashboard',
  Title3: 'Informazioni in tempo reale a colpo d\'occhio',
  SubTitle2: 'Monitora ogni aspetto della tua flotta con metriche chiare e actionable',
  DashboardPanoramica: [
    { icon: 'priority_high', title: 'Validazioni Prenotazioni', subTitle: '3', content: 'Elementi ad alta priorità che richiedono attenzione.' },
    { icon: 'calendar_today', title: 'Prenotazioni Correnti', subTitle: '5', content: 'Approvate con successo e pianificate.' },
    { icon: 'schedule', title: 'Rientri Ritardati', subTitle: '1', content: 'Veicoli non riconsegnati in tempo.' }
  ],
  Title4: 'Gestione Flotta Intelligente',
  SubTitle3: 'CarFleet integra hardware e software avanzati per fornire un\'esperienza senza interruzioni sia ai gestori che ai conducenti.',
  Title5: 'Integrazione PowerApps',
  Subtitle4: 'Costruita sulla robusta piattaforma PowerApps, la nostra soluzione offre flessibilità e sicurezza. Personalizza i flussi di lavoro, gestisce i permessi e si integra perfettamente con il tuo ecosistema aziendale esistente.',
  PowerappsBlocks: [
    { Icon: 'verified_user', Title: 'Validazioni Sicure', Description: 'I processi di approvazione multi-livello garantiscono il rigoroso rispetto delle politiche di utilizzo dei veicoli.' },
    { Icon: 'gps_fixed', Title: 'Tracciamento GPS in Tempo Reale', Description: 'Monitora la posizione dell\'intera flotta in tempo reale sulla mappa. Ottimizza i percorsi e garantisce la sicurezza dei conducenti.' }
  ],
  MappaFlotta: {
    MappaTitle: 'Mappa Flotta',
    Tag: 'Live',
    Icon1: 'place',
    Icon2: 'place',
    Icon3: 'place',
    PIcon: 'person',
    Name: 'Luigi Di Mauro',
    Car: 'Fiat Panda - EZ 998 KL',
    Status: 'In Movimento'
  },
  Title6: 'Controllo Accesso Intelligente',
  SubTitle5: 'Dimentica le chiavi fisiche. La nostra tecnologia di geofencing consente capacità automatiche di blocco e sblocco quando il conducente è vicino al veicolo.',
  Icon2: 'wifi_tethering',
  AccesBlock: [
    { Text: 'Chiave Mobile: Sblocca le auto direttamente dall\'app.', Icon: 'check_circle' },
    { Text: 'Geofencing: Rilevamento automatico di prossimità per accesso senza interruzioni.', Icon: 'check_circle' },
    { Text: 'Accesso Remoto: Gli amministratori possono sbloccare i veicoli da remoto in caso di emergenza.', Icon: 'check_circle' }
  ],
  Title7: 'Pronto a ottimizzare la gestione della tua flotta?',
  Subtitle6: 'Unisciti alle aziende che già usano CarFleet per semplificare la logistica e ridurre i costi operativi.',
  Button3: 'Contatta le Vendite'
};

const open4UsPageData = {
  UpperMainTitle: 'Nuova Integrazione Disponibile',
  MainTitle: 'Accesso Smart &',
  MainTitle2: 'Condivisione Semplice',
  MainSubTitle: 'Gestisci i tuoi spazi senza sforzo con Open4US. Da hub di coworking a palestre, automatizza l\'ingresso con la nostra avanzata integrazione di serrature smart ISEO e potente dashboard cloud.',
  MainButton1: 'Prenota una Demo',
  MainButton2: 'Scopri le Funzionalità',
  MainIcon: 'arrow_forward',
  AccesSmart: [
    { Text: 'Configurazione Istantanea', Icon: 'check_circle' },
    { Text: 'Bluetooth Sicuro', Icon: 'check_circle' },
    { Text: 'Monitoraggio 24/7', Icon: 'check_circle' }
  ],
  ImageCard: {
    Title: 'Cilindro Smart ISEO',
    SubTitle: 'Ingresso senza chiave via Smartphone'
  },
  SmartBlock: {
    Icon: 'lock_open',
    Title: 'Tocca per Sbloccare',
    Description: 'Ufficio Amministrativo'
  },
  DashUpperTitle: 'Pannello di Controllo',
  DashTitle: 'Potente Dashboard di Gestione',
  DashSubTitle: 'Visualizza prenotazioni, gestisci diritti di accesso e monitora la tua struttura in tempo reale. Tutto ciò di cui hai bisogno in un\'unica piattaforma centralizzata.',
  DashLink: 'dashboard.open4us.com/calendario',
  DashIcon: 'SS',
  DashName: 'Sheriyar Shakeel',
  DashRole: 'Admin',
  DashboardOptions: [
    { Text: 'Home', Icon: 'home' },
    { Text: 'Prenotazioni', Icon: 'calendar_today' },
    { Text: 'Utenti', Icon: 'people' },
    { Text: 'Serrature', Icon: 'lock' },
    { Text: 'Stanze', Icon: 'meeting_room' },
    { Text: 'Logout', Icon: 'logout' }
  ],
  CalendarDate: 'Marzo 2025',
  CalendarIcon: 'chevron_left',
  CalendarOggi: 'Oggi',
  CalendarIcon2: 'chevron_right',
  CalendarIcon3: 'search',
  CalendarBlock: {
    Title: 'Ufficio Admin - Gorgonzola',
    Status: 'Confermato',
    Icon1: 'calendar_today',
    Date: '26/02/2025 17:00',
    Icon2: 'person',
    Name: 'Luigi Di Mauro (3 ospiti)',
    Icon3: 'vpn_key',
    Access: 'Accesso autorizzato: ARIES TEST1'
  },
  SpaceTitle: 'Perfetto per Ogni Spazio',
  SpaceBlock: [
    { Icon: 'business_center', Title: 'Spazi di Coworking', Description: 'Automatizza l\'accesso ai membri. Concedi pass temporanei per sale riunioni e postazioni automaticamente dopo il pagamento della prenotazione.' },
    { Icon: 'fitness_center', Title: 'Palestre & Centri Sportivi', Description: 'Gestisci prenotazioni campi e ingressi in palestra. Imposta codici di accesso temporizzati per classi specifiche o slot di affitto.' },
    { Icon: 'apartment', Title: 'Residenze & Uffici', Description: 'Proteggi i tuoi edifici per uffici. Rilascia chiavi digitali ai dipendenti e accesso temporaneo al personale di manutenzione.' }
  ],
  AppIcon: {
    Icon: 'smartphone',
    Text: 'App Open4US - Sblocco Smartphone'
  },
  AppTitle: 'Sblocca con l\'App Open4US',
  AppSubTitle: 'Dimentica le chiavi fisiche. Con la nostra perfetta integrazione con l\'ecosistema Luckey, i tuoi utenti possono sbloccare le porte direttamente dal loro smartphone usando credenziali Bluetooth sicure.',
  AppBlocks: [
    { Icon: 'wifi_off', Title: 'Funziona Offline', Description: 'Le serrature smart verificano le credenziali anche senza connessione internet.' },
    { Icon: 'share', Title: 'Condivisione Intelligente', Description: 'Invia chiavi virtuali via email o SMS istantaneamente.' },
    { Icon: 'history', Title: 'Registro Accessi', Description: 'Vedi esattamente chi è entrato e quando dalla dashboard.' }
  ],
  ModernTitle: 'Pronto a modernizzare il tuo controllo accessi?',
  ModernSubTitle: 'Unisciti alle aziende che già usano Open4US per semplificare la gestione delle loro strutture.',
  ModernButton: 'Contatta le Vendite'
};

const storiaPageData = {
  UpperTitle: 'Il nostro percorso',
  MainTitle: 'La nostra Storia',
  Description: 'Un viaggio fatto di passione, innovazione e crescita. Scopri le tappe che hanno segnato l\'evoluzione di B4US e la nostra missione di semplificare l\'IT per le aziende.',
  Timeline: [
    { Anno: '2020', Descrizione: 'Nasce B4US con la missione di semplificare l\'IT per le aziende italiane.' },
    { Anno: '2021', Descrizione: 'Primi clienti Enterprise e consolidamento del team di consulenza.' },
    { Anno: '2022', Descrizione: 'Lancio di CarFleet, la soluzione di gestione flotta aziendale su PowerApps.' },
    { Anno: '2023', Descrizione: 'Partnership con ISEO e lancio di Open4US per il controllo accessi smart.' },
    { Anno: '2024', Descrizione: 'Espansione del team a oltre 20 professionisti e istituzione dei Knowledge Days.' }
  ],
  CtaTitle: 'Vuoi far parte della nostra storia?',
  CtaDescription: 'Siamo sempre alla ricerca di talenti pronti a crescere con noi e a contribuire al nostro futuro.',
  CtaButtonApply: 'Lavora con noi',
  CtaButtonContact: 'Contattaci'
};

const carrierePageData = {
  UpperTitle: 'Carriere in B4US',
  MainTitle: 'Costruisci il futuro dell\'IT con noi.',
  Description: 'Siamo alla ricerca di talenti pronti a mettersi in gioco e ad esprimere le proprie capacità. Entra a far parte di un team che valorizza l\'innovazione e la crescita personale.',
  Button1Text: 'Posizioni Aperte',
  Button2Text: 'Scopri la nostra cultura',
  CultureTitle: 'Perché scegliere B4US?',
  CultureSubTitle: 'Offriamo un ambiente di lavoro flessibile che premia il merito e incoraggia l\'apprendimento continuo.',
  CultureCards: [
    { icon: 'psychology', title: 'Crescita Professionale', description: 'Piani di formazione personalizzati e certificazioni IT pagate dall\'azienda.' },
    { icon: 'home_work', title: 'Smart Working', description: 'Flessibilità totale tra ufficio e casa per garantire un equilibrio vita-lavoro sano.' },
    { icon: 'rocket_launch', title: 'Progetti Innovativi', description: 'Lavora con le ultime tecnologie e su sfide concrete per grandi aziende enterprise.' }
  ],
  PositionsTitle: 'Posizioni Aperte',
  PositionsSubTitle: 'Trova il ruolo perfetto per le tue competenze.',
  SpontaneousTitle: 'Non trovi la posizione giusta per te?',
  SpontaneousSubTitle: 'Siamo sempre alla ricerca di persone brillanti. Inviaci la tua candidatura spontanea.',
  SpontaneousLinkText: 'Invia CV Spontaneo',
  BottomCtaTitle: 'Pronto per la tua prossima sfida?',
  BottomCtaSubTitle: 'B4US non è solo un posto di lavoro, è un ambiente dove le tue idee diventano realtà. Unisciti a noi e semplifichiamo l\'IT insieme.',
  BottomCtaButton: 'Apply Now'
};

const contattiPageData = {
  MainTitle: 'Parliamo del tuo futuro IT',
  Description: 'Hai un progetto in mente o hai bisogno di una consulenza specializzata? Il nostro team di esperti è pronto ad aiutarti a semplificare la tua infrastruttura tecnologica.',
  FormTitle: 'Inviaci un messaggio',
  ContactDetails: [
    { icon: 'phone_in_talk', title: 'Chiamaci', subTitle: 'Lun-Ven dalle 9:00 alle 18:00', linkText: '+39 02 36647728', linkUrl: 'tel:+390236647728' },
    { icon: 'mail', title: 'Scrivici', subTitle: 'Ti risponderemo entro 24h', linkText: 'info@b4us.it', linkUrl: 'mailto:info@b4us.it' },
    { icon: 'groups', title: 'LinkedIn', subTitle: 'News, eventi e vita aziendale', linkText: 'B4US', linkUrl: 'https://www.linkedin.com/company/b4us' }
  ],
  SedeTitle: 'La nostra sede',
  SedeAddress: 'Via Vincenzo Pessina, 2 - 20064 Gorgonzola (MI), Italia',
  SedeMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2795.8573762744447!2d9.401682976519436!3d45.52766367107462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c0f5e5e5e5e5%3A0x5e5e5e5e5e5e5e5e!2sVia%20Vincenzo%20Pessina%2C%202%2C%2020064%20Gorgonzola%20MI!5e0!3m2!1sit!2sit!4v1000000000000!5m2!1sit!2sit'
};

const blogPageDataSingle = {
  MainTitle: 'Diario di Bordo',
  Description: 'Traguardi, obiettivi e attività del team B4US. Una panoramica sulla crescita della nostra azienda e sui progetti che ci guidano verso il futuro.'
};

// ═══════════════════════════════════════════════════════════════════

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

    // ───────────────────────────────────────────────────────────────
    // NUOVE SEZIONI SEED
    // ───────────────────────────────────────────────────────────────

    // Popola Tags (collection)
    console.log('\n🏷️  Popolamento Tags...');
    for (const tag of tags) {
      try {
        await axios.post(`${STRAPI_URL}/tags`, {
          data: tag
        });
        console.log(`  ✅ Creato tag: ${tag.title}`);
      } catch (error) {
        console.log(`  ⚠️  Errore creando tag ${tag.title}: ${error.message}`);
      }
    }

    // Recupera ID tags per la relazione in organizzazione.techArea
    let tagIds = [];
    try {
      const tagsRes = await axios.get(`${STRAPI_URL}/tags?pagination[pageSize]=100`);
      tagIds = (tagsRes.data.data || []).map(function(t) { return t.id; });
      console.log(`  📋 Recuperati ${tagIds.length} tag IDs`);
    } catch (error) {
      console.log(`  ⚠️  Impossibile recuperare tag IDs: ${error.message}`);
    }

    // Popola Organizzazione / Struttura (Single Type)
    console.log('\n🏢 Popolamento Organizzazione...');
    try {
      await axios.put(`${STRAPI_URL}/organizzazione`, {
        data: {
          MainTitle: 'Organizzazione',
          descriptionTitle: 'Crediamo che l\'efficienza non nasca da strutture complesse, ma da una comunicazione aperta e continua. Per noi è fondamentale che le informazioni circolino liberamente, in modo trasversale, senza barriere legate a ruoli, competenze o aree operative.',
          HeroSection: [
            {
              tag: 'Il nostro approccio',
              Title: 'Nessun compartimento stagno',
              SubTitle: 'Nel nostro modo di lavorare non esistono barriere: ognuno porta competenze solide nel proprio ambito, ma con una visione d\'insieme condivisa.',
              card: [
                { title: 'Chi sviluppa', subTitle: 'Conosce i sistemi e l\'infrastruttura' },
                { title: 'Chi lavora sull\'infrastruttura', subTitle: 'Comprende il prodotto e il business' },
                { title: 'Chi segue la parte commerciale', subTitle: 'Ha familiarità con gli aspetti tecnici' }
              ]
            },
            {
              tag: 'Investiamo nelle persone',
              Title: 'Crescita e Formazione',
              SubTitle: 'Ogni collaboratore ha un percorso di sviluppo definito e monitorato, supportato da formazione continua.',
              card: [
                {
                  title: 'Figure Junior',
                  subTitle: 'Percorso di crescita strutturato',
                  content: 'Affiancamento a professionisti esperti\nMentorship personalizzata\nVelocità di crescita basata su impegno e capacità'
                },
                {
                  title: 'Figure Senior',
                  subTitle: 'Formazione continua avanzata',
                  content: 'Formazione dedicata ogni anno\nCorsi, seminari e conferenze di settore\nAmpliamento e rafforzamento competenze'
                }
              ]
            }
          ],
          techArea: [
            { title: 'Le nostre aree di formazione', tags: tagIds }
          ],
          knowledgeArea: {
            MainCard: {
              icon: 'calendar_month',
              title: 'Knowledge Days',
              subTitle: 'Due giornate all\'anno dedicate alla crescita delle nostre persone.'
            },
            content: 'Crediamo che la vera efficienza nasca dalla condivisione, non dalla complessità. Per questo abbiamo istituito i Knowledge Days: due appuntamenti annuali, riconosciuti a livello aziendale, interamente dedicati alla formazione e allo scambio di competenze tra colleghi e con professionisti esterni. Sono momenti pensati per fermarsi, uscire dalla routine operativa e investire tempo nella conoscenza: si approfondiscono temi specifici, si condividono esperienze concrete e si discutono approcci, strumenti e pratiche di lavoro. Un\'occasione per valorizzare ciò che funziona, imparare dagli errori e costruire insieme una cultura aziendale basata su apprendimento continuo, confronto e crescita condivisa.',
            subCard: [
              { icon: 'thumb_up', title: 'Best Practices', subTitle: 'Le esperienze che hanno generato valore.' },
              { icon: 'lightbulb', title: 'Lessons Learned', subTitle: 'Gli insegnamenti che ci aiutano a migliorare.' }
            ]
          }
        }
      });
      console.log('  ✅ Organizzazione aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando organizzazione: ${error.message}`);
    }

    // Popola Service Page (Single Type)
    console.log('\n🔧 Popolamento Service Page...');
    try {
      await axios.put(`${STRAPI_URL}/service`, {
        data: servicePageData
      });
      console.log('  ✅ Service page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando service: ${error.message}`);
    }

    // Popola Prodotti Page (Single Type)
    console.log('\n📦 Popolamento Prodotti Page...');
    try {
      await axios.put(`${STRAPI_URL}/prodotti`, {
        data: prodottiPageData
      });
      console.log('  ✅ Prodotti page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando prodotti: ${error.message}`);
    }

    // Popola Car Fleet Page (Single Type)
    console.log('\n🚗 Popolamento Car Fleet Page...');
    try {
      await axios.put(`${STRAPI_URL}/car-fleet`, {
        data: carFleetPageData
      });
      console.log('  ✅ Car Fleet page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando car-fleet: ${error.message}`);
    }

    // Popola Open4US Page (Single Type)
    console.log('\n🔐 Popolamento Open4US Page...');
    try {
      await axios.put(`${STRAPI_URL}/open4-us`, {
        data: open4UsPageData
      });
      console.log('  ✅ Open4US page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando open4-us: ${error.message}`);
    }

    // Popola Storia Page (Single Type)
    console.log('\n📜 Popolamento Storia Page...');
    try {
      await axios.put(`${STRAPI_URL}/storia`, {
        data: storiaPageData
      });
      console.log('  ✅ Storia page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando storia: ${error.message}`);
    }

    // Popola Carriere Page (Single Type)
    console.log('\n💼 Popolamento Carriere Page...');
    try {
      await axios.put(`${STRAPI_URL}/carriere`, {
        data: carrierePageData
      });
      console.log('  ✅ Carriere page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando carriere: ${error.message}`);
    }

    // Popola Contatti Page (Single Type)
    console.log('\n📞 Popolamento Contatti Page...');
    try {
      await axios.put(`${STRAPI_URL}/contatti`, {
        data: contattiPageData
      });
      console.log('  ✅ Contatti page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando contatti: ${error.message}`);
    }

    // Popola Blog Page (Single Type)
    console.log('\n📰 Popolamento Blog Page...');
    try {
      await axios.put(`${STRAPI_URL}/blog-page`, {
        data: blogPageDataSingle
      });
      console.log('  ✅ Blog page aggiornata');
    } catch (error) {
      console.log(`  ⚠️  Errore aggiornando blog-page: ${error.message}`);
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
