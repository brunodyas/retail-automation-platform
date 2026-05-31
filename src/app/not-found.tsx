import Link from 'next/link';
import { Home } from 'lucide-react';
import { ROUTES } from '@/constants';
import { BackButton } from '@/components/ui/back-button';

/**
 * Кастомная страница 404 — Not Found.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-indigo-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Страница не найдена
        </h1>
        <p className="text-gray-500 mb-8">
          Возможно, страница была удалена или вы перешли по неверной ссылке.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            На главную
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
