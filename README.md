# B4US Website con Strapi CMS

Sito web B4US con gestione contenuti tramite Strapi CMS.

## Struttura del Progetto

```
.
├── backend/          # Strapi CMS (backend)
├── SitoB4US/         # Express + EJS (frontend)
└── README.md
```

## Setup e Avvio

### 1. Avviare il Backend Strapi

```bash
cd backend
npm run develop
```

Strapi si avvierà su **http://localhost:1337**

Al primo avvio:
1. Vai su http://localhost:1337/admin
2. Crea un account amministratore
3. Accedi al pannello di amministrazione

### 2. Popolare i Dati Iniziali

Dopo aver avviato Strapi e creato l'account admin:

```bash
cd backend
node scripts/seed-data.js
```

Questo popolerà Strapi con:
- ✅ 6 Servizi IT
- ✅ 4 Team Members
- ✅ 4 Blog Posts
- ✅ 3 Job Positions
- ✅ Home Page Content

**IMPORTANTE:** Dopo il popolamento, devi **pubblicare i contenuti**:
1. Vai su http://localhost:1337/admin
2. Entra in ogni Content Type (Servizi, Team Members, Blog Posts, Job Positions)
3. Seleziona tutti gli elementi e clicca "Publish"
4. Per Home Page: vai su "Home" → Clicca "Publish"

### 3. Configurare i Permessi API

Nel pannello Strapi:
1. Vai su **Settings** → **Roles** → **Public**
2. Abilita le seguenti permissions:
   - ✅ Home: `find`, `update`, `create`
   - ✅ Servizio: `find`, `findOne`, `update`, `create`
   - ✅ Team-member: `find`, `findOne`, `update`, `create`
   - ✅ Blog-post: `find`, `findOne`, `update`, `create`
   - ✅ Job-position: `find`, `findOne`, `update`, `create`
3. Salva

### 4. Avviare il Frontend

In un nuovo terminale:

```bash
cd SitoB4US
npm start
```

Il sito sarà disponibile su **http://localhost:3000**

## Content Types Disponibili

### 📄 Single Types (una sola istanza)
- **Home Page**: Contenuti della pagina principale

### 📚 Collection Types (multiple istanze)
- **Servizi**: Servizi IT offerti dall'azienda
- **Team Members**: Membri del team aziendale
- **Blog Posts**: Articoli del blog
- **Job Positions**: Posizioni lavorative aperte

## Modificare i Contenuti

1. Accedi a Strapi: http://localhost:1337/admin
2. Naviga nel Content Manager
3. Modifica, aggiungi o elimina contenuti
4. Pubblica le modifiche
5. Il frontend si aggiornerà automaticamente

## Variabili d'Ambiente

### Backend (backend/.env)
```
HOST=0.0.0.0
PORT=1337
```

### Frontend (SitoB4US/.env)
```
PORT=3000
STRAPI_API_URL=http://localhost:1337/api
```

## API Endpoints

Una volta configurato, puoi accedere alle API:

- Home Page: `http://localhost:1337/api/home?populate=*`
- Servizi: `http://localhost:1337/api/servizi?populate=*`
- Team Members: `http://localhost:1337/api/team-members?populate=*`
- Blog Posts: `http://localhost:1337/api/blog-posts?populate=*`
- Job Positions: `http://localhost:1337/api/job-positions?populate=*`

## Note Tecniche

- **Database**: SQLite (locale, in `backend/.tmp/data.db`)
- **Frontend**: Express.js + EJS templates
- **Backend**: Strapi v4.26
- **Axios**: Per chiamate API dal frontend

## Troubleshooting

### Strapi non si avvia
- Verifica che la porta 1337 sia libera
- Elimina `backend/.tmp` e `backend/.cache` e riavvia

### Frontend non mostra i dati
- Verifica che Strapi sia in running
- Controlla che i contenuti siano pubblicati
- Verifica i permessi API (Settings → Roles → Public)

### Errori di connessione
- Verifica che le variabili d'ambiente siano corrette
- Controlla che CORS sia abilitato in `backend/config/middlewares.js`

## Prossimi Passi

1. ✅ Aggiungi immagini ai contenuti tramite Media Library Strapi
2. ✅ Personalizza i Content Types secondo le tue esigenze
3. ✅ Configura un database production (PostgreSQL/MySQL) per deploy
4. ✅ Implementa autenticazione per aree riservate
5. ✅ Configura backup automatici del database

## Supporto

Per problemi o domande, consulta:
- [Documentazione Strapi](https://docs.strapi.io)
- [Strapi Discord Community](https://discord.strapi.io)
