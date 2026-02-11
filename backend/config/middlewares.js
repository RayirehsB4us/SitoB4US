module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'http://localhost:3443',
        'https://localhost:3443',
        'http://192.168.1.32:3000',
        'https://192.168.1.32:4242',
        'http://192.168.1.32:4242',
      ],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Middleware personalizzato per proteggere le API con token
  'global::api-token-auth',
];
