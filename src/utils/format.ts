import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const DEFAULT_LOCALE = ru;

/**
 * Форматирует дату в читаемый формат.
 */
export const formatDate = (
  date: string | Date,
  pattern: string = 'dd.MM.yyyy'
): string => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, pattern, { locale: DEFAULT_LOCALE });
};

/**
 * Форматирует дату в относительный формат ("2 часа назад").
 */
export const formatRelativeDate = (date: string | Date): string => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: DEFAULT_LOCALE,
  });
};

/**
 * Форматирует сумму в денежный формат.
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'BYN',
  locale: string = 'ru-BY'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Форматирует число с разделителями.
 */
export const formatNumber = (
  num: number,
  locale: string = 'ru-RU'
): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Сокращает текст до указанной длины с многоточием.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

/**
 * Склоняет слово в зависимости от числа (1 проект, 2 проекта, 5 проектов).
 */
export const pluralize = (
  count: number,
  one: string,
  few: string,
  many: string
): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};
