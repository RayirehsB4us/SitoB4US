'use strict';

/**
 * job-request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::job-request.job-request', ({ strapi }) => ({
  async create(ctx) {
    // Permetti la creazione senza autenticazione
    ctx.state.user = null;
    
    const response = await super.create(ctx);
    return response;
  }
}));
