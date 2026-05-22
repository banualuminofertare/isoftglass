import { ro, enUS, de, it, pl, fr, es, nl, hr, type Locale } from 'date-fns/locale';
import i18n from 'i18next';

const localeMap: Record<string, Locale> = { ro, en: enUS, de, it, pl, fr, es, nl, hr };

export function getDateLocale(): Locale {
  return localeMap[i18n.language] || ro;
}
