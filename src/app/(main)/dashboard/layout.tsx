import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/sidebar';

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Управляйте проектами, финансами и настройками на VibeCoding Freelance',
};

/**
 * Layout для личного кабинета (dashboard).
 * Включает боковую навигацию.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
