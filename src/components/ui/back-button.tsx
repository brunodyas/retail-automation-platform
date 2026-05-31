'use client';

import { ArrowLeft } from 'lucide-react';

/**
 * Кнопка «Назад» — использует history.back() (клиентский компонент).
 */
export const BackButton = () => {
  return (
    <button
      onClick={() => history.back()}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Назад
    </button>
  );
};
