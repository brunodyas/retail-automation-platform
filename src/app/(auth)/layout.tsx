import Link from 'next/link';
import { ROUTES } from '@/constants';

/**
 * Layout для страниц авторизации (логин, регистрация, восстановление пароля).
 * Минималистичный дизайн с центрированной формой.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Минимальный хедер */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span className="text-2xl">&lt;/&gt;</span>
            <span>VibeCoding Freelance</span>
          </Link>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Минимальный футер */}
      <footer className="py-6 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} VibeCoding Freelance. Все права защищены.
        </p>
      </footer>
    </div>
  );
}
