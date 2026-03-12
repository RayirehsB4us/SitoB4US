// updateTeam.js
// Usa fetch nativo di Node 18+ (nessuna dipendenza extra)
const STRAPI_URL = 'http://192.168.1.32:1337';
// Inserisci qui il tuo token API di Strapi (meglio ancora: usa una variabile d'ambiente)
const TOKEN = '90919ed660bc33f3f076dd357d9804db33428dd93f5980a4dd6259cde823f47dc40856715e6cd0cdd4949e1bc6a76f257a16aa5849e6aee9a90adc2a8a542f0e255bc2fded98b15c0a5164c7c7ce0a58efa8c6c490d186fa71082cba44bc45750c6b3ead2370d0241a09d04dbd366917b41866bbca6326a527a8a94fbb8e2018';
// Team "Cloud - Collaboration" (documentId)
const TEAM_DOCUMENT_ID = 'kxy4v2vh4y9elmthwxtq50mj';

// Aggiornamenti basati su documentId (non sull'id numerico)
const updates = [
  {
    documentId: 'o08hfopo1fedlj8oo7z2dkfu', // Sheriyar Shakeel
    jobTitle: 'Full stack Developer',
    JobDescription:
      'Specialista nello sviluppo end‑to‑end di applicazioni web moderne, dall’interfaccia utente al backend.',
  },
  {
    documentId: 'dryakntdaczyzn8198bte52w', // Maurizio Colli Vignarelli
    jobTitle: 'Sistemista Windows e VMware',
    JobDescription:
      'Esperto nella gestione di infrastrutture Windows e ambienti virtualizzati VMware ad alta disponibilità.',
  },
  {
    documentId: 'mszkkos16s8l7m9ajlboein5', // Nicolò Guerra
    jobTitle: 'Senior System Administrator',
    JobDescription:
      'Responsabile del design, dell’implementazione e del mantenimento di infrastrutture IT complesse e critiche.',
  },
  {
    documentId: 'e0khd4ulfmhnpp76wibmts3z', // Marco D’Angelo
    jobTitle:
      'Founder, Cloud Ecosystem Open Source @ Radixia | Huawei Open Source | ex-Microsoft | Conference Organizer | Speaker | Suits & Ties only in profile photos',
    JobDescription:
      'Consulente e leader tecnico nel mondo open source e cloud, con forte focus su ecosistemi enterprise e community.',
  },
  {
    documentId: 'urqxsb03ufu3q0mxr49li8fq', // Pedro Nova
    jobTitle: 'System Engineer',
    JobDescription:
      'Tecnico specializzato nella progettazione, configurazione e manutenzione di sistemi e servizi IT aziendali.',
  },
  {
    documentId: 'w8yz0gz3qqu56osxe7fv3kts', // Pasquale Lino Schiavone
    jobTitle: 'IT Senior Specialist',
    JobDescription:
      'Professionista IT con consolidata esperienza nella gestione di infrastrutture e nel supporto a progetti complessi.',
  },
  {
    documentId: 'dwj08c5i07wq9mprlqe3ypnk', // Dario Gurrieri
    jobTitle: 'Owner IT Architectures',
    JobDescription:
      'Architetto IT focalizzato sulla definizione di soluzioni scalabili, sicure e ad alte prestazioni.',
  },
  {
    documentId: 'zs6xie90gm7vwyuulr5orczc', // Federica De Iudicibus
    jobTitle: 'Junior Cloud Engineer',
    JobDescription:
      'Supporta la progettazione e l’operatività di soluzioni cloud, apprendendo best practice di sicurezza e automazione.',
  },
  {
    documentId: 'fmskq0vb05aeki93q6f38eqe', // Gabriele Alessi
    jobTitle: 'System Engineer',
    JobDescription:
      'Si occupa dell’implementazione e ottimizzazione di sistemi IT, garantendo affidabilità e continuità operativa.',
  },
  {
    documentId: 's37bonchboo78r5jo9jgy8fj', // Roberto D’Ignazio
    jobTitle: 'System Engineer',
    JobDescription:
      'Gestisce infrastrutture server e servizi di rete, assicurando stabilità e performance dell’ambiente IT.',
  },
  {
    documentId: 'lo5zk91ff143xbiw6hxoth5x', // Marco Rossi
    jobTitle: 'System Engineer',
    JobDescription:
      'Contribuisce alla gestione quotidiana dei sistemi e al miglioramento continuo delle piattaforme tecnologiche.',
  },
  {
    documentId: 'lp2jzyntim1t7tfyo0ou2ax4', // Corrado Molinatto
    jobTitle: 'DBA, System Engineer and IT Manager',
    JobDescription:
      'Coordina infrastrutture e database mission‑critical, unendo competenze tecniche e responsabilità di gestione.',
  },
  {
    documentId: 'e8n3ycw1wtnr200gnps69sao', // Jacopo Bruno Marchetti
    jobTitle: 'SCCM/Intune',
    JobDescription:
      'Specialista nella gestione centralizzata di endpoint e applicazioni tramite SCCM e Microsoft Intune.',
  },
  {
    documentId: 'qiyat465sin5xk92xbbtpepo', // Marco Veglia
    jobTitle: 'System Engineer',
    JobDescription:
      'Supporta la progettazione e l’esercizio di ambienti server e di rete, con attenzione a sicurezza e scalabilità.',
  },
  {
    documentId: 'ugpl4svgcr3255jh3i7bg5r8', // Pietro Ceriani
    jobTitle: 'System Administrator',
    JobDescription:
      'Amministra sistemi e servizi aziendali, curando monitoraggio, aggiornamenti e troubleshooting.',
  },
  {
    documentId: 'gcb05lz8rchnlgad1q4y3i37', // Elena B4US
    jobTitle: 'Segretary',
    JobDescription:
      'Gestisce attività amministrative e di segreteria, garantendo organizzazione e supporto operativo al team.',
  },
  {
    documentId: 'vrq3v3doajgsn8sg92ir1v61', // Francesco Mura
    jobTitle: 'System Administrator',
    JobDescription:
      'Si occupa della gestione quotidiana di server e servizi, assicurando continuità e affidabilità operativa.',
  },
  {
    documentId: 's6670k3yzdqwievl8u490u8k', // Francesco Guerrieri
    jobTitle: 'Web Developer',
    JobDescription:
      'Sviluppa e mantiene siti e applicazioni web, con attenzione a usabilità, performance e qualità del codice.',
  },
  {
    documentId: 'ym68zc3lvu985kojdunf1cwm', // Martin Asaro
    jobTitle: 'AWS Cloud Consultant',
    JobDescription:
      'Consulente specializzato in soluzioni AWS, dalla progettazione all’ottimizzazione di ambienti cloud.',
  },
  {
    documentId: 'gzuo2fjsnrnuhld8dq4apqpc', // Damiano Mirante
    jobTitle: 'Cloud Observability Engineer',
    JobDescription:
      'Progetta e gestisce sistemi di osservabilità per monitorare servizi cloud e migliorarne affidabilità e prestazioni.',
  },
  {
    documentId: 'c9s1thsw5rngyknvde2ks7bm', // Riccardo Germinario
    jobTitle: 'General Manager and Digital Transformation and Smart Working Architect',
    JobDescription:
      'Guida la trasformazione digitale e i modelli di smart working, allineando strategia aziendale e tecnologia.',
  },
  {
    documentId: 's4pjm3ht7hdqpvv393sws8oz', // Carmen Calderone
    jobTitle: 'Cloud Infrastructure Consultant',
    JobDescription:
      'Consulente focalizzata su infrastrutture cloud resilienti e sicure, dal design alla messa in produzione.',
  },
];

async function run() {
  for (const { documentId, jobTitle, JobDescription } of updates) {
    const res = await fetch(`${STRAPI_URL}/api/employes/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          jobTitle,
          JobDescription,
          Consulente: false,
          // assegna tutti al team "Cloud - Collaboration"
          teams: {
            set: [{ documentId: TEAM_DOCUMENT_ID }],
          },
        },
      }),
    });

    if (!res.ok) {
      console.error(`Errore aggiornando documentId ${documentId}:`, res.status, await res.text());
    } else {
      console.log(`Aggiornato documentId ${documentId} → ${jobTitle}`);
    }
  }
}

run().catch(console.error);