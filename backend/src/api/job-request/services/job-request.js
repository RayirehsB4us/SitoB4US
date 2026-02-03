'use strict';

/**
 * job-request service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job-request.job-request');
