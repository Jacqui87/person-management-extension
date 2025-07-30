// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// i18next-http-backend loads translation JSON files from public/locales
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // load translations using HTTP (from public folder)
  .use(initReactI18next) // pass i18n instance to react-i18next
  .init({
    fallbackLng: "en-GB", // default language
    supportedLngs: ["en-GB", "cy-GB"],
    lng: "en-GB",

    debug: false,

    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // path to translation files
    },

    react: {
      useSuspense: true, // enable suspense to wait for translations
    },
  });

export default i18n;
