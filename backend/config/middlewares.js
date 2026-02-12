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
        'http://192.168.1.32:3000',
        'http://192.168.1.32:4242',
        'https://b4us-prod-backend-d5g9ecdjgkc2ake8.swedencentral-01.azurewebsites.net',
        'https://www.b4us.it'
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
