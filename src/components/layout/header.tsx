'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  X,
  Plus,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth } from '@/hooks/use-auth';

/** Ссылки навигации для гостя */
const GUEST_NAV_LINKS = [
  { href: ROUTES.PROJECTS, label: 'Проекты' },
  { href: ROUTES.FREELANCERS, label: 'Исполнители' },
] as const;

/** Ссылки навигации для авторизованного пользователя */
const AUTH_NAV_LINKS = [
  { href: ROUTES.PROJECTS, label: 'Проекты' },
  { href: ROUTES.FREELANCERS, label: 'Исполнители' },
  { href: ROUTES.DASHBOARD, label: 'Кабинет' },
] as const;

/**
 * Шапка сайта. Содержит навигацию, поиск, уведомления, профиль.
 * Адаптивная: бургер-меню на мобильных.
 */
export const Header = () => {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu,
    unreadNotificationsCount, unreadMessagesCount } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const { signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navLinks = isAuthenticated ? AUTH_NAV_LINKS : GUEST_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center gap-8">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl">&lt;/&gt;</span>
              <span>VibeCoding Freelance</span>
            </Link>

            {/* Десктопная навигация */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Основная навигация">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-3">
            {/* Поиск (десктоп) */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск проектов..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {isAuthenticated ? (
              <>
                {/* Создать проект */}
                <Link href={ROUTES.CREATE_PROJECT} className="hidden sm:block">
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                    Создать проект
                  </Button>
                </Link>

                {/* Сообщения */}
                <Link
                  href={ROUTES.DASHBOARD_MESSAGES}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Сообщения"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5">
                      <Badge variant="danger" size="sm">
                        {unreadMessagesCount}
                      </Badge>
                    </span>
                  )}
                </Link>

                {/* Уведомления */}
                <button
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Уведомления"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5">
                      <Badge variant="danger" size="sm">
                        {unreadNotificationsCount}
                      </Badge>
                    </span>
                  )}
                </button>

                {/* Меню профиля */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar
                      src={user?.avatarUrl}
                      alt={user?.name || 'Профиль'}
                      size="sm"
                    />
                    <ChevronDown className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      isProfileMenuOpen && 'rotate-180'
                    )} />
                  </button>

                  {/* Выпадающее меню */}
                  {isProfileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          href={ROUTES.DASHBOARD}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Кабинет
                        </Link>
                        <Link
                          href={ROUTES.PROFILE}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Профиль
                        </Link>
                        <Link
                          href={ROUTES.DASHBOARD_SETTINGS}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Настройки
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => { setIsProfileMenuOpen(false); signOut(); }}
                          >
                            <LogOut className="h-4 w-4" />
                            Выйти
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button size="sm">
                    Регистрация
                  </Button>
                </Link>
              </div>
            )}

            {/* Бургер-меню (мобильное) */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* Поиск */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск проектов..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Ссылки */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-base font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}

            {/* Действия */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href={ROUTES.CREATE_PROJECT} onClick={closeMobileMenu}>
                    <Button fullWidth leftIcon={<Plus className="h-4 w-4" />}>
                      Создать проект
                    </Button>
                  </Link>
                  <Link href={ROUTES.PROFILE} onClick={closeMobileMenu}>
                    <Button variant="outline" fullWidth>
                      Профиль
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={ROUTES.LOGIN} onClick={closeMobileMenu}>
                    <Button variant="outline" fullWidth>
                      Войти
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER} onClick={closeMobileMenu}>
                    <Button fullWidth>
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
