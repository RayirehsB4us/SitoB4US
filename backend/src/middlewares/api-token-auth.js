'use strict';

/**
 * Middleware per autenticazione API tramite token.
 * Protegge tutte le rotte /api/* richiedendo un token Bearer valido.
 * Le rotte /admin/*, /uploads/* e le rotte non-API non sono interessate.
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Proteggi solo le rotte /api/*
    if (!requestPath.startsWith('/api/')) {
      return await next();
    }

    const expectedToken = process.env.FRONTEND_API_TOKEN;

    // Se il token non è configurato nel .env, blocca tutto per sicurezza
    if (!expectedToken) {
      strapi.log.error('FRONTEND_API_TOKEN non configurato nel .env! Tutte le richieste API sono bloccate.');
      ctx.status = 500;
      ctx.body = { error: 'Configurazione server non valida' };
      return;
    }

    // Controlla l'header Authorization
    const authHeader = ctx.request.header['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 403;
      ctx.body = { error: 'Accesso negato: token di autenticazione mancante' };
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (token !== expectedToken) {
      ctx.status = 403;
      ctx.body = { error: 'Accesso negato: token di autenticazione non valido' };
      return;
    }

    // Token valido, prosegui
    await next();
  };
};
