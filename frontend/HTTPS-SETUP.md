# Configurazione HTTPS per Sviluppo Locale

Questo documento spiega come abilitare HTTPS sul server di sviluppo.

## Opzione 1: mkcert (Consigliato - Windows)

mkcert genera certificati SSL locali fidati automaticamente dal browser.

### Installazione su Windows

1. **Scarica mkcert:**
   - Vai su https://github.com/FiloSottile/mkcert/releases
   - Scarica `mkcert-v1.4.4-windows-amd64.exe`
   - Rinominalo in `mkcert.exe`
   - Spostalo in una cartella nel PATH (es: `C:\Windows\System32`) oppure usa il percorso completo

2. **Installa la CA locale:**
   ```powershell
   mkcert -install
   ```

3. **Genera i certificati per localhost:**
   ```powershell
   cd "C:\Users\sheriyar.shakeel\Documents\Work Project\SitoB4US\frontend"
   mkcert localhost 127.0.0.1 ::1
   ```

   Questo creerà:
   - `localhost+2.pem` (certificato)
   - `localhost+2-key.pem` (chiave privata)

4. **Rinomina i file:**
   ```powershell
   rename localhost+2.pem localhost.pem
   rename localhost+2-key.pem localhost-key.pem
   ```

5. **Riavvia il server:**
   ```powershell
   npm run start
   ```

6. **Accedi a:** https://localhost:3443

## Opzione 2: OpenSSL (Self-Signed)

Se non vuoi installare mkcert, puoi usare OpenSSL (il browser mostrerà un avviso).

### Su Windows con Git Bash o WSL:

```bash
cd "frontend"
openssl req -nodes -new -x509 -keyout localhost-key.pem -out localhost.pem -days 365 -subj "/CN=localhost"
```

### Su Linux:

```bash
cd frontend
openssl req -nodes -new -x509 -keyout localhost-key.pem -out localhost.pem -days 365 -subj "/CN=localhost"
```

## Configurazione Porte

Per default:
- **HTTP:** porta 3000 (reindirizza a HTTPS se i certificati esistono)
- **HTTPS:** porta 3443

Per cambiare le porte, modifica il file `.env`:

```env
PORT=3000
HTTPS_PORT=3443
```

## Come Funziona

Il server controlla automaticamente se esistono i file:
- `localhost-key.pem`
- `localhost.pem`

**Se esistono:** Avvia HTTPS sulla porta 3443 e HTTP sulla 3000 (con redirect)
**Se NON esistono:** Avvia solo HTTP sulla porta 3000

## Disabilitare HTTPS

Semplicemente rimuovi o rinomina i file `.pem`:

```powershell
move localhost.pem localhost.pem.backup
move localhost-key.pem localhost-key.pem.backup
```

Poi riavvia il server.

## Produzione (Linux con Dominio)

Per la produzione su Linux con un dominio reale, usa Let's Encrypt:

```bash
# Installa Certbot
sudo apt install certbot

# Ottieni certificato
sudo certbot certonly --standalone -d tuodominio.com

# I certificati saranno in:
# /etc/letsencrypt/live/tuodominio.com/fullchain.pem
# /etc/letsencrypt/live/tuodominio.com/privkey.pem
```

Poi modifica il server.js per puntare a questi percorsi.

## Troubleshooting

### Errore "EACCES: permission denied"
- Su Linux, usa `sudo` per accedere alle porte < 1024
- Oppure usa porte > 1024 (es: 3000, 3443)

### Browser mostra "Not Secure"
- Con mkcert: Assicurati di aver eseguito `mkcert -install`
- Con OpenSSL: È normale, clicca "Advanced" > "Proceed to localhost"

### Certificati non trovati
Controlla che i file siano nella directory `frontend`:
```powershell
dir localhost*.pem
```

## Security Note

⚠️ I certificati self-signed sono SOLO per sviluppo locale.
⚠️ NON usare mai in produzione!
⚠️ Per produzione, usa sempre Let's Encrypt o un certificato valido.
