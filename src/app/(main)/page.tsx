import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  Shield,
  Star,
  Zap,
  Users,
  FolderKanban,
  CheckCircle,
  ArrowRight,
  Globe,
  Smartphone,
  Palette,
  Server,
  BarChart3,
  FileText,
} from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION, ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: `${APP_NAME} — Биржа фриланса для IT-специалистов`,
  description: APP_DESCRIPTION,
};

const STATS = [
  { value: '5 000+', label: 'Исполнителей', icon: Users },
  { value: '12 000+', label: 'Проектов завершено', icon: FolderKanban },
  { value: '50+', label: 'Категорий услуг', icon: BarChart3 },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Опубликуйте проект',
    description: 'Опишите задачу, укажите бюджет и сроки. Это бесплатно и занимает 5 минут.',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Получите отклики',
    description: 'Просмотрите предложения от проверенных специалистов и выберите лучшего.',
    icon: Users,
  },
  {
    step: 3,
    title: 'Безопасная сделка',
    description: 'Оплата через систему эскроу — средства переводятся только после приёмки работы.',
    icon: Shield,
  },
  {
    step: 4,
    title: 'Получите результат',
    description: 'Примите выполненную работу и оставьте отзыв. Гарантия качества.',
    icon: CheckCircle,
  },
] as const;

const CATEGORIES_SHOWCASE = [
  { label: 'Веб-разработка', icon: Globe, count: 1240 },
  { label: 'Мобильная разработка', icon: Smartphone, count: 520 },
  { label: 'Дизайн', icon: Palette, count: 890 },
  { label: 'DevOps', icon: Server, count: 310 },
  { label: 'Маркетинг и SMM', icon: BarChart3, count: 670 },
  { label: 'Копирайтинг', icon: FileText, count: 430 },
] as const;

const FEATURES = [
  {
    title: 'Безопасные платежи',
    description: 'Система эскроу гарантирует, что исполнитель получит оплату, а заказчик — качественную работу.',
    icon: Shield,
  },
  {
    title: 'Проверенные специалисты',
    description: 'Рейтинги, отзывы и верификация помогают найти надёжных исполнителей.',
    icon: Star,
  },
  {
    title: 'Быстрый старт',
    description: 'Публикация проекта за 5 минут. Первые отклики — уже в течение часа.',
    icon: Zap,
  },
] as const;

/**
 * Главная страница VibeCoding Freelance.
 * Hero-секция, статистика, "Как это работает", категории, преимущества.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero секция */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Найдите лучших{' '}
              <span className="text-indigo-600">IT-специалистов</span>{' '}
              для вашего проекта
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              VibeCoding Freelance — безопасная платформа для фриланса с системой
              эскроу, рейтингами и гарантией качества работы
            </p>

            {/* Поиск */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Какой проект вам нужен?"
                  className="w-full pl-12 pr-4 py-3.5 text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
              <Link
                href={ROUTES.PROJECTS}
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Найти
              </Link>
            </div>

            {/* CTA кнопки */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={ROUTES.FREELANCERS}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Найти исполнителя
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.CREATE_PROJECT}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Разместить проект
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-3">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Как это работает</h2>
            <p className="mt-4 text-lg text-gray-600">
              Простой и безопасный процесс от публикации до результата
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS_STEPS.map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl mb-4 shadow-lg shadow-indigo-200">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-indigo-100 text-indigo-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Популярные категории */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Популярные категории</h2>
              <p className="mt-2 text-gray-600">Найдите специалиста в нужном направлении</p>
            </div>
            <Link
              href={ROUTES.FREELANCERS}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Все категории
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES_SHOWCASE.map(({ label, icon: Icon, count }) => (
              <Link
                key={label}
                href={ROUTES.FREELANCERS}
                className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{label}</h3>
                  <p className="text-sm text-gray-500">{count} специалистов</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Почему VibeCoding Freelance?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Мы создаём лучший опыт для заказчиков и исполнителей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-5">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Готовы начать?
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Присоединяйтесь к тысячам профессионалов на VibeCoding Freelance
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={ROUTES.REGISTER}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Зарегистрироваться бесплатно
              </Link>
              <Link
                href={ROUTES.PROJECTS}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white border-2 border-indigo-400 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Смотреть проекты
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
