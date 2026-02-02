# 📋 Documentazione Implementazione Strapi CMS

## ✅ Lavoro Completato

### 1. Backend Strapi Installato
- ✅ Strapi v4.26 configurato in `backend/`
- ✅ Database SQLite locale
- ✅ Configurazione CORS per frontend
- ✅ File `.env` con variabili d'ambiente

### 2. Content Types Creati

#### Single Types (1 istanza):
- **Home Page**: gestisce contenuti homepage
  - `heroTitle`: titolo principale
  - `heroSubtitle`: sottotitolo
  - `heroImage`: immagine hero (opzionale)
  - `introTitle`: titolo intro
  - `introDescription`: descrizione intro (richtext)
  - `einsteinQuote`: citazione Einstein
  - `servicesTitle`: titolo sezione servizi

#### Collection Types (multiple istanze):
- **Servizio**
  - `titolo`: nome servizio
  - `descrizione`: descrizione servizio
  - `icona`: nome icona Material Icons
  - `slug`: URL-friendly slug
  - `ordine`: ordine visualizzazione

- **Team Member**
  - `nome`: nome completo
  - `ruolo`: posizione aziendale
  - `foto`: immagine profilo (media)
  - `bio`: biografia (opzionale)
  - `ordine`: ordine visualizzazione

- **Blog Post**
  - `titolo`: titolo articolo
  - `slug`: URL-friendly slug
  - `descrizione`: estratto/anteprima
  - `contenuto`: testo completo (richtext)
  - `immagine`: immagine copertina (media)
  - `categoria`: categoria articolo
  - `dataPublicazione`: data pubblicazione
  - `tempoLettura`: minuti lettura

- **Job Position**
  - `titolo`: nome posizione
  - `slug`: URL-friendly slug
  - `descrizione`: descrizione ruolo (richtext)
  - `location`: sede lavoro
  - `tipologia`: Full-time/Part-time/Remote/Hybrid
  - `reparto`: reparto aziendale
  - `icona`: nome icona
  - `requisiti`: requisiti richiesti (richtext)
  - `attiva`: se la posizione è aperta
  - `ordine`: ordine visualizzazione

### 3. Frontend Integrato
- ✅ Axios installato per chiamate API
- ✅ `server.js` modificato per fetchare da Strapi
- ✅ Gestione errori e fallback per dati mancanti
- ✅ File `.env` con URL Strapi

### 4. Script di Popolamento
- ✅ `backend/scripts/seed-data.js` pronto
- ✅ Popola automaticamente:
  - 6 Servizi IT
  - 4 Team Members
  - 4 Blog Posts
  - 3 Job Positions
  - Home Page Content

### 5. Documentazione
- ✅ `README.md` completo
- ✅ `QUICK-START.md` per avvio rapido
- ✅ Questo file con dettagli implementazione

---

## 🏗️ Architettura Sistema

```
┌─────────────────────────────────────────────┐
│           Browser (User)                     │
└──────────────┬──────────────────────────────┘
               │
               │ HTTP Request
               ▼
┌─────────────────────────────────────────────┐
│   Express.js Frontend (Port 3000)           │
│   - Riceve richieste                         │
│   - Fetcha dati da Strapi                   │
│   - Renderizza template EJS                 │
└──────────────┬──────────────────────────────┘
               │
               │ Axios HTTP API Calls
               ▼
┌─────────────────────────────────────────────┐
│   Strapi CMS Backend (Port 1337)           │
│   - REST API endpoints                       │
│   - Content Management                       │
│   - Media Library                           │
│   - Admin Panel                             │
└──────────────┬──────────────────────────────┘
               │
               │ SQLite
               ▼
┌─────────────────────────────────────────────┐
│   SQLite Database (.tmp/data.db)           │
│   - Contenuti                                │
│   - Utenti admin                            │
│   - Media metadata                          │
└─────────────────────────────────────────────┘
```

---

## 📁 Struttura File Creati/Modificati

### Backend (`backend/`)
```
backend/
├── config/
│   ├── admin.js          [CREATO]
│   ├── database.js       [CREATO]
│   ├── middlewares.js    [CREATO]
│   └── server.js         [CREATO]
├── src/
│   ├── api/
│   │   ├── home/         [CREATO]
│   │   │   ├── content-types/home/
│   │   │   │   └── schema.json
│   │   │   ├── controllers/home.js
│   │   │   ├── services/home.js
│   │   │   └── routes/home.js
│   │   ├── servizio/     [CREATO] 
│   │   ├── team-member/  [CREATO]
│   │   ├── blog-post/    [CREATO]
│   │   └── job-position/ [CREATO]
│   └── index.js          [CREATO]
├── scripts/
│   └── seed-data.js      [CREATO]
├── .env                  [CREATO]
├── .gitignore            [CREATO]
└── package.json          [CREATO]
```

### Frontend (`SitoB4US/`)
```
SitoB4US/
├── server.js             [MODIFICATO]
│   - Aggiunto require('dotenv')
│   - Aggiunto axios
│   - Funzione fetchFromStrapi()
│   - Route modificate per usare Strapi
├── .env                  [CREATO]
└── package.json          [MODIFICATO]
    - Aggiunto axios
    - Aggiunto dotenv
```

### Root
```
.
├── README.md                      [CREATO]
├── QUICK-START.md                 [CREATO]
└── IMPLEMENTAZIONE-STRAPI.md      [QUESTO FILE]
```

---

## 🔗 API Endpoints Disponibili

Una volta configurato e avviato Strapi:

### Content Types
```
GET /api/home?populate=*
GET /api/servizi?populate=*
GET /api/servizi/:id?populate=*
GET /api/team-members?populate=*
GET /api/team-members/:id?populate=*
GET /api/blog-posts?populate=*
GET /api/blog-posts/:id?populate=*
GET /api/job-positions?populate=*
GET /api/job-positions/:id?populate=*
```

### Parametri Query Utili
```
?populate=*                    # Popola tutte le relazioni
?sort=ordine:asc               # Ordina per campo ordine
?filters[attiva][$eq]=true     # Filtra job positions attive
?pagination[page]=1&pagination[pageSize]=10  # Paginazione
```

---

## 🔐 Sicurezza e Permessi

### Permessi Configurati
- **Public Role**: accesso read-only a tutti i Content Types
- **Authenticated Role**: da configurare per utenti registrati
- **Admin**: accesso completo al pannello admin

### Da Fare in Production
- [ ] Cambia tutti i secret in `.env`
- [ ] Configura database PostgreSQL/MySQL
- [ ] Abilita SSL/HTTPS
- [ ] Configura backup automatici
- [ ] Limita rate delle API calls
- [ ] Configura CDN per media files

---

## 🎨 Personalizzazioni Possibili

### 1. Aggiungere Nuovi Content Types
```bash
cd backend
npm run strapi generate
# Scegli "api" e segui il wizard
```

### 2. Modificare Content Types Esistenti
- Via UI: Content-Type Builder nel pannello admin
- Via codice: modifica `schema.json` del Content Type

### 3. Aggiungere Campi Personalizzati
Esempio: aggiungere "email" a Team Member:
```json
"email": {
  "type": "email",
  "required": false
}
```

### 4. Creare Custom API Endpoints
Crea custom controller in `backend/src/api/[nome]/controllers/`

---

## 📊 Monitoring e Debug

### Log Strapi
Strapi logga automaticamente in console. Per log persistenti:
```bash
cd backend
npm run develop > strapi.log 2>&1
```

### Debug Frontend
Il server Express logga gli errori di fetch da Strapi:
```javascript
console.error('Error rendering home:', error);
```

### Verifica Stato API
```bash
curl http://localhost:1337/api/servizi?populate=*
```

---

## 🚀 Deploy in Production

### Backend Strapi

#### Opzione 1: Strapi Cloud (consigliato)
- Deploy automatico
- Database gestito
- CDN incluso
- https://cloud.strapi.io

#### Opzione 2: VPS (Digital Ocean, AWS, ecc.)
```bash
# Setup database production
DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=****

# Build
npm run build

# Start
NODE_ENV=production npm start
```

### Frontend Express

#### Opzione 1: Vercel/Netlify
- Deploy automatico da Git
- Configura STRAPI_API_URL con URL production

#### Opzione 2: VPS
```bash
# Installa PM2
npm install -g pm2

# Avvia con PM2
pm2 start server.js --name "b4us-frontend"
pm2 save
pm2 startup
```

---

## 🛠️ Manutenzione

### Backup Database
```bash
# SQLite (development)
cp backend/.tmp/data.db backup-$(date +%Y%m%d).db

# PostgreSQL (production)
pg_dump strapi > backup-$(date +%Y%m%d).sql
```

### Aggiornare Strapi
```bash
cd backend
npm run strapi version      # Verifica versione
npx @strapi/upgrade major   # Upgrade major version
```

### Pulizia Cache
```bash
cd backend
rm -rf .cache .tmp
npm run develop
```

---

## 📞 Supporto

### Risorse Utili
- **Strapi Docs**: https://docs.strapi.io
- **Strapi Discord**: https://discord.strapi.io
- **Strapi Forum**: https://forum.strapi.io
- **GitHub**: https://github.com/strapi/strapi

### Problemi Comuni
Consulta la sezione Troubleshooting nel `README.md`

---

## ✨ Prossimi Sviluppi Consigliati

1. **Media Management**
   - Configurare cloud storage (AWS S3, Cloudinary)
   - Ottimizzazione automatica immagini

2. **SEO**
   - Installare plugin SEO Strapi
   - Aggiungere meta tags dinamici

3. **Multilingual**
   - Attivare plugin i18n già installato
   - Configurare lingue (IT/EN)

4. **Email**
   - Configurare provider email
   - Form contatti funzionante

5. **Analytics**
   - Integrare Google Analytics
   - Dashboard metriche custom

6. **Performance**
   - Implementare caching con Redis
   - CDN per assets statici
   - Lazy loading immagini

---

**Implementazione completata il**: 02 Febbraio 2026  
**Versione Strapi**: 4.26.1  
**Versione Node**: 22.16.0
