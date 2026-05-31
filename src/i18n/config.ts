export type Locale = 'ru' | 'en';

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALES: Locale[] = ['ru', 'en'];

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
};
