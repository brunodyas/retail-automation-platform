import { FullPageSpinner } from '@/components/ui';

/**
 * Глобальный индикатор загрузки.
 * Показывается при переходах между страницами (Suspense boundary).
 */
export default function Loading() {
  return <FullPageSpinner />;
}
