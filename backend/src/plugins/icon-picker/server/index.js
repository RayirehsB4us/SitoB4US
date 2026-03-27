'use strict';

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'icon',
      plugin: 'icon-picker',
      type: 'string',
    });
  },
  bootstrap() {},
};
