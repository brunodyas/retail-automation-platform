import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения Tailwind CSS классов с поддержкой условий.
 * Использует clsx для условного применения и twMerge для разрешения конфликтов.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
