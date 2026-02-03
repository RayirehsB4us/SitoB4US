import './extensions/theme.css';

export default {
  config: {
    // Logo personalizzato per la pagina di login
    auth: {
      logo: '/logo.png',
      backgroundImage: '/sfondo.png',
    },
    // Logo per il menu laterale (admin panel)
    menu: {
      logo: '/logo.png',
    },
    // Titolo nell'header
    head: {
      favicon: '/logo.png',
    },
    locales: ['it'],
    translations: {
      it: {
        'app.components.LeftMenu.navbrand.title': 'OpenPortal',
        'app.components.LeftMenu.navbrand.workplace': 'B4US',
        'Auth.form.welcome.title': 'Benvenuto!', // Cambia il titolo (opzionale)
        'Auth.form.welcome.subtitle': 'Accedi ad OpenPortal', // Cambia il sottotitolo
      },
      en: {
        'app.components.LeftMenu.navbrand.title': 'OpenPortal',
        'app.components.LeftMenu.navbrand.workplace': 'B4US',
        'Auth.form.welcome.title': 'Welcome!',
        'Auth.form.welcome.subtitle': 'Log in to OpenPortal',
      },
    },
    theme: {
      colors: {
        primary100: "#d4edda",
        primary200: "#c3e6cb",
        primary500: "#28a745",
        primary600: "#28a745",
        primary700: "#218838",
        buttonPrimary500: "#28a745",
        buttonPrimary600: "#218838",
      },
    },
  },
  bootstrap(app) {
    localStorage.setItem('STRAPI_THEME', 'light');
  },
};