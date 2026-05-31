'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Глобальный Error Boundary.
 * Перехватывает необработанные ошибки и предлагает повторить.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Логирование ошибки (в будущем — в Sentry/PostHog)
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Что-то пошло не так
        </h1>
        <p className="text-gray-500 mb-8">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
