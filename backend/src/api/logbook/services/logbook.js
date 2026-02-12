'use strict';

/**
 * logbook service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::logbook.logbook');
