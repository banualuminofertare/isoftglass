import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ro from './locales/ro';
import en from './locales/en';
import it from './locales/it';
import de from './locales/de';
import pl from './locales/pl';
import fr from './locales/fr';
import es from './locales/es';
import nl from './locales/nl';
import hr from './locales/hr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: ro },
      en: { translation: en },
      it: { translation: it },
      de: { translation: de },
      pl: { translation: pl },
      fr: { translation: fr },
      es: { translation: es },
      nl: { translation: nl },
      hr: { translation: hr },
    },
    fallbackLng: 'ro',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
