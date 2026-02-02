# 🚀 Quick Start Guide - B4US + Strapi CMS

## Setup Rapido (5 minuti)

### Passo 1: Avvia Strapi Backend

Apri un terminale e esegui:

```bash
cd backend
npm run develop
```

✅ Strapi si avvierà su **http://localhost:1337**

**Al primo avvio:**
- Il browser si aprirà automaticamente su http://localhost:1337/admin
- Crea il tuo account amministratore (email + password)
- Accedi al pannello

### Passo 2: Configura i Permessi API

Nel pannello admin di Strapi:

1. Vai su **Settings** (⚙️) nel menu laterale
2. Clicca su **Users & Permissions Plugin** → **Roles**
3. Clicca su **Public**
4. Nella sezione **Permissions**, espandi ogni Content Type e abilita:
   - ✅ **Home**: `find`
   - ✅ **Servizio**: `find` e `findOne`
   - ✅ **Team-member**: `find` e `findOne`  
   - ✅ **Blog-post**: `find` e `findOne`
   - ✅ **Job-position**: `find` e `findOne`
5. Clicca **Save** in alto a destra

### Passo 3: Popola i Dati

In un nuovo terminale (lascia Strapi in running):

```bash
cd backend
node scripts/seed-data.js
```

Vedrai l'output:
```
🌱 Inizio popolamento dati Strapi...
📦 Popolamento Servizi...
  ✅ Creato: Cloud Transformation
  ✅ Creato: Cyber Security
  ...
✨ Popolamento completato con successo!
```

### Passo 4: Pubblica i Contenuti

Torna su http://localhost:1337/admin

**Per ogni Content Type** (Servizi, Team Members, Blog Posts, Job Positions):
1. Clicca sul Content Type nel menu laterale
2. Seleziona tutti gli elementi (checkbox in alto)
3. Clicca sul pulsante **Publish** (icona 🌍)

**Per Home Page:**
1. Clicca su **Home** nel menu laterale  
2. Clicca su **Publish** in alto a destra

### Passo 5: Avvia il Frontend

In un nuovo terminale:

```bash
cd SitoB4US
npm start
```

Il sito sarà disponibile su **http://localhost:3000** 🎉

---

## Verifiche Rapide

### ✅ Backend Funziona?
Vai su: http://localhost:1337/api/servizi?populate=*

Dovresti vedere un JSON con i servizi.

### ✅ Frontend Funziona?
Vai su: http://localhost:3000

Dovresti vedere il sito B4US con i contenuti dinamici da Strapi.

---

## Modifica Contenuti

1. Vai su http://localhost:1337/admin
2. Clicca su un Content Type (es. **Servizi**)
3. Clicca su un elemento per modificarlo
4. Fai le modifiche
5. Clicca **Save** e poi **Publish**
6. Ricarica il frontend → vedrai le modifiche! ✨

---

## Comandi Utili

```bash
# Avvia Strapi backend
cd backend && npm run develop

# Avvia frontend
cd SitoB4US && npm start

# Ripopola dati (attenzione: crea duplicati se già esistenti!)
cd backend && node scripts/seed-data.js
```

---

## Troubleshooting Veloce

### Strapi non si avvia
```bash
cd backend
rm -rf .cache .tmp
npm run develop
```

### Frontend non mostra dati
1. Controlla che Strapi sia in running (http://localhost:1337)
2. Verifica permessi API (Settings → Roles → Public)
3. Verifica che i contenuti siano pubblicati

### Errore "Cannot connect to Strapi"
- Controlla che `backend/.env` abbia `PORT=1337`
- Controlla che `SitoB4US/.env` abbia `STRAPI_API_URL=http://localhost:1337/api`

---

## Prossimi Passi

✅ Carica immagini nella Media Library di Strapi  
✅ Personalizza i Content Types  
✅ Aggiungi nuove pagine  
✅ Configura deploy in production  

**Buon lavoro! 🚀**
