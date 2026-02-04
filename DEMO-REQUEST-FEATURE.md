# Demo Request Feature - Documentazione

## Panoramica
Ho implementato un sistema di richiesta demo che permette agli utenti di prenotare una demo dei prodotti Open4US e CarFleet.

## Componenti Implementati

### 1. Modale Riutilizzabile (`frontend/views/partials/demo-modal.ejs`)
- Form con campi: nome, cognome, azienda, email
- Validazione lato client
- Messaggi di successo/errore
- Loader durante l'invio
- Chiusura automatica dopo successo
- Click fuori dal modale per chiudere

### 2. Pagine Aggiornate
- **open4us.ejs**: Aggiunto `onclick="openDemoModal('Open4US')"` ai button "Prenota una Demo" e "Inizia Ora"
- **carfleet.ejs**: Aggiunto `onclick="openDemoModal('CarFleet')"` ai button "Prenota una Demo" e "Inizia Gratuitamente"

### 3. Endpoint Backend (`frontend/server.js`)
- **Route**: `POST /api/demo-request`
- **Funzionalità**:
  - Validazione campi obbligatori
  - Validazione email
  - Ricerca/creazione automatica del software-product
  - Creazione demo-request in Strapi
  - Gestione errori completa

## Struttura Dati Strapi

### demo-request
```json
{
  "nome": "string",
  "cognome": "string",
  "azienda": "string",
  "email": "email",
  "software_product": "relation (oneToOne con software-product)"
}
```

### software-product
```json
{
  "name": "string"
}
```

## Come Testare

### 1. Riavvia il Server Frontend
```bash
cd frontend
npm run start
```

### 2. Verifica Backend Strapi
Assicurati che Strapi sia in esecuzione su http://localhost:1337

### 3. Testa la Funzionalità

#### Test Open4US
1. Vai su http://localhost:3000/open4us
2. Clicca su "Prenota una Demo" (primo button nell'hero)
3. Compila il form con dati di test
4. Clicca "Invia Richiesta"
5. Dovresti vedere un messaggio di successo
6. Il modale si chiuderà automaticamente dopo 2 secondi

#### Test CarFleet
1. Vai su http://localhost:3000/carfleet
2. Clicca su "Prenota una Demo" (primo button nell'hero)
3. Compila il form con dati di test
4. Clicca "Invia Richiesta"
5. Dovresti vedere un messaggio di successo
6. Il modale si chiuderà automaticamente dopo 2 secondi

### 4. Verifica in Strapi
1. Vai su http://localhost:1337/admin
2. Naviga su "Content Manager" > "Demo Request"
3. Dovresti vedere le richieste create
4. Verifica che siano correttamente collegate al software-product

## API Endpoint

### POST /api/demo-request

**Request Body:**
```json
{
  "nome": "Roberto",
  "cognome": "Biggi",
  "azienda": "B4US",
  "email": "roberto.biggi@b4us.it",
  "softwareProduct": "Open4US"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Richiesta demo inviata con successo! Ti contatteremo presto.",
  "data": {
    "data": {
      "id": 1,
      "attributes": {
        "nome": "Roberto",
        "cognome": "Biggi",
        "azienda": "B4US",
        "email": "roberto.biggi@b4us.it",
        "createdAt": "2026-02-04T11:15:44.540Z",
        "updatedAt": "2026-02-04T11:15:45.238Z",
        "publishedAt": "2026-02-04T11:15:45.234Z"
      }
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Tutti i campi sono obbligatori"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Errore durante l'invio della richiesta demo"
}
```

## Note Tecniche

1. **Software Product Auto-Creation**: Se il prodotto software non esiste in Strapi, viene creato automaticamente
2. **Email Validation**: Regex pattern per validare email lato server
3. **Published At**: Tutti i record vengono pubblicati automaticamente
4. **Error Handling**: Gestione completa degli errori con messaggi user-friendly
5. **Responsive**: Il modale è completamente responsive
6. **Accessibility**: Chiusura con click fuori o bottone X

## Troubleshooting

### Il modale non si apre
- Verifica che il partial `demo-modal.ejs` sia incluso nella pagina
- Controlla la console del browser per errori JavaScript

### Errore durante l'invio
- Verifica che Strapi sia in esecuzione
- Controlla i log del server frontend
- Verifica le credenziali del database Strapi

### Software Product non collegato
- Il sistema tenta di collegare automaticamente il prodotto
- Se fallisce, crea comunque la demo-request senza relazione
- Controlla i log per dettagli

## File Modificati

1. `frontend/views/partials/demo-modal.ejs` - NUOVO
2. `frontend/views/open4us.ejs` - Modificato
3. `frontend/views/carfleet.ejs` - Modificato
4. `frontend/server.js` - Aggiunto endpoint /api/demo-request
