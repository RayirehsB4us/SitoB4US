import './extensions/theme.css';

export default {
  config: {
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