'use strict';

/**
 * software-product service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::software-product.software-product');
