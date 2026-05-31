'use client';

import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания медиа-запросов (адаптивность).
 * @param query - CSS медиа-запрос (например, '(min-width: 768px)')
 * @returns true, если медиа-запрос совпадает
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    const handleChange = () => setMatches(media.matches);
    handleChange();

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

/** Хук: является ли экран мобильным (< 768px) */
export const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 767px)');
};

/** Хук: является ли экран планшетным (768px - 1023px) */
export const useIsTablet = (): boolean => {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
};

/** Хук: является ли экран десктопным (>= 1024px) */
export const useIsDesktop = (): boolean => {
  return useMediaQuery('(min-width: 1024px)');
};
