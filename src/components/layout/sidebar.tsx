'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Wallet,
  MessageSquare,
  Settings,
  Star,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const SIDEBAR_LINKS: SidebarLink[] = [
  {
    href: ROUTES.DASHBOARD,
    label: 'Обзор',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: ROUTES.DASHBOARD_PROJECTS,
    label: 'Мои проекты',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    href: ROUTES.DASHBOARD_PROPOSALS,
    label: 'Отклики',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: ROUTES.DASHBOARD_FINANCES,
    label: 'Финансы',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    href: ROUTES.DASHBOARD_MESSAGES,
    label: 'Сообщения',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    href: ROUTES.DASHBOARD_SETTINGS,
    label: 'Настройки',
    icon: <Settings className="h-5 w-5" />,
  },
];

/**
 * Боковая панель для личного кабинета (dashboard).
 * Показывает навигацию по разделам с подсветкой активного маршрута.
 */
export const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav
        className="sticky top-20 space-y-1"
        aria-label="Навигация кабинета"
      >
        {SIDEBAR_LINKS.map((link) => {
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className={cn(active ? 'text-indigo-600' : 'text-gray-400')}>
                {link.icon}
              </span>
              {link.label}
              {link.badge !== undefined && link.badge > 0 && (
                <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Ссылка на профиль */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <Link
            href={ROUTES.PROFILE}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(ROUTES.PROFILE)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Star className={cn(
              'h-5 w-5',
              pathname.startsWith(ROUTES.PROFILE) ? 'text-indigo-600' : 'text-gray-400'
            )} />
            Мой профиль
          </Link>
        </div>
      </nav>
    </aside>
  );
};
