import Link from 'next/link';
import { ROUTES } from '@/constants';

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_SECTIONS = [
  {
    title: 'Платформа',
    links: [
      { label: 'Проекты', href: ROUTES.PROJECTS },
      { label: 'Исполнители', href: ROUTES.FREELANCERS },
      { label: 'Как это работает', href: '/#how-it-works' },
      { label: 'Категории', href: ROUTES.PROJECTS },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О нас', href: '/about' },
      { label: 'Блог', href: '/blog' },
      { label: 'Карьера', href: '/careers' },
      { label: 'Контакты', href: '/contacts' },
    ],
  },
  {
    title: 'Поддержка',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Служба поддержки', href: '/support' },
      { label: 'Условия использования', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' },
    ],
  },
] as const;

/**
 * Футер сайта с навигацией, ссылками и копирайтом.
 */
export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Основной контент */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Бренд */}
          <div>
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 text-xl font-bold text-indigo-600"
            >
              <span className="text-2xl">&lt;/&gt;</span>
              <span>VibeCoding Freelance</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Безопасная платформа для фриланса в IT и digital. Находите
              лучших специалистов или проекты с гарантией оплаты через эскроу.
            </p>
          </div>

          {/* Секции ссылок */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Нижняя полоса */}
        <div className="py-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {CURRENT_YEAR} VibeCoding Freelance. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Условия
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Конфиденциальность
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
