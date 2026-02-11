#!/usr/bin/env node
/**
 * Single-process launcher for Azure App Service.
 * 1. Avvia Strapi (backend) come sottoprocesso sulla porta 1337
 * 2. Attende che Strapi sia pronto
 * 3. Avvia il frontend Express sulla PORT fornita da Azure (process.env.PORT)
 *
 * Azure esegue: npm start → node server.js
 * Un solo processo principale (questo), che ascolta su PORT.
 */

const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const STRAPI_PORT = 1337;
const STRAPI_READY_RETRIES = 30;
const STRAPI_READY_INTERVAL_MS = 1000;

function waitForStrapi() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    function check() {
      const req = http.get(`http://127.0.0.1:${STRAPI_PORT}/`, (res) => {
        // Strapi non ha /_health; qualsiasi risposta HTTP = server up
        res.resume();
        return resolve();
      });
      req.on('error', tryNext);
      req.setTimeout(2000, () => {
        req.destroy();
        tryNext();
      });
    }
    function tryNext() {
      attempts++;
      if (attempts >= STRAPI_READY_RETRIES) {
        return reject(new Error(`Strapi non pronto dopo ${STRAPI_READY_RETRIES} tentativi`));
      }
      setTimeout(check, STRAPI_READY_INTERVAL_MS);
    }
    check();
  });
}

function startStrapi() {
  const backendDir = path.join(__dirname, 'backend');
  const strapiBin = path.join(backendDir, 'node_modules', '@strapi', 'strapi', 'bin', 'strapi.js');
  const env = {
    ...process.env,
    PORT: String(STRAPI_PORT),
    NODE_ENV: process.env.NODE_ENV || 'production',
    HOST: '0.0.0.0',
  };

  const child = spawn(process.execPath, [strapiBin, 'start'], {
    cwd: backendDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => process.stdout.write(`[Strapi] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[Strapi] ${data}`));
  child.on('error', (err) => {
    console.error('[Strapi] Errore avvio:', err.message);
  });
  child.on('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      console.error(`[Strapi] Processo terminato con code=${code} signal=${signal}`);
    }
  });

  return child;
}

async function main() {
  console.log('Avvio Strapi (backend) in sottoprocesso...');
  const strapiChild = startStrapi();

  console.log('Attendo che Strapi sia pronto...');
  try {
    await waitForStrapi();
    console.log('Strapi pronto.');
  } catch (err) {
    console.error(err.message);
    strapiChild.kill();
    process.exit(1);
  }

  // Frontend deve parlare con Strapi in locale
  process.env.STRAPI_URL = process.env.STRAPI_URL || `http://127.0.0.1:${STRAPI_PORT}`;
  process.env.STRAPI_API_URL = process.env.STRAPI_API_URL || `http://127.0.0.1:${STRAPI_PORT}/api`;

  console.log('Avvio frontend Express su PORT=', process.env.PORT || 3000);
  require(path.join(__dirname, 'frontend', 'server.js'));
}

main();
