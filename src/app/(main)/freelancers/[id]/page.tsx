import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft, Star, Briefcase, MapPin, Clock, Globe,
  ExternalLink, CheckCircle, MessageSquare,
} from 'lucide-react';
import { Button, Badge, Avatar, Card } from '@/components/ui';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: 'Профиль исполнителя',
  description: 'Профиль фрилансера на VibeCoding Freelance — портфолио, отзывы и статистика',
};

/**
 * Страница публичного профиля исполнителя.
 * Показывает навыки, портфолио, отзывы, статистику.
 */
export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={ROUTES.FREELANCERS}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        К списку исполнителей
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Основная информация */}
        <div className="flex-1 space-y-6">
          {/* Профиль */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar src={null} alt="Исполнитель" size="xl" isOnline />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Иван Разработчик
                  </h1>
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-lg text-gray-600 mb-2">
                  Senior Frontend Developer (React / Next.js)
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Минск, Беларусь
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    UTC+3
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a href="#" className="text-indigo-600 hover:underline">
                      portfolio.dev
                    </a>
                  </span>
                </div>

                {/* Статистика */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-gray-400">(87 отзывов)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>142 проекта</span>
                  </div>
                  <Badge variant="success">Доступен</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* О себе */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">О себе</h2>
            <p className="text-gray-600 leading-relaxed">
              Frontend-разработчик с 7+ годами опыта. Специализируюсь на React, Next.js
              и TypeScript. Создаю производительные, доступные и красивые веб-приложения.
              Имею опыт работы в стартапах и крупных командах. Всегда на связи и
              соблюдаю сроки.
            </p>
          </Card>

          {/* Навыки */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Навыки</h2>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS',
                'Node.js', 'PostgreSQL', 'GraphQL', 'REST API', 'Git',
                'Figma', 'Docker'].map((skill) => (
                <Badge key={skill} variant="outline" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Портфолио */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Портфолио</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-32 bg-gray-200 rounded-lg mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">
                    Проект #{item}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Описание проекта портфолио
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    <Badge variant="outline" size="sm">React</Badge>
                    <Badge variant="outline" size="sm">Next.js</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Отзывы */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Отзывы</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((review) => (
                <div key={review} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar src={null} alt="Заказчик" size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Заказчик #{review}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">2 месяца назад</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Отличный разработчик! Все было сделано качественно и в срок.
                    Рекомендую для любых Frontend-задач.
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Сайдбар */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Card>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Ставка</p>
                <p className="text-2xl font-bold text-gray-900">$40/час</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Успешность</span>
                <span className="font-medium text-green-600">97%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Время ответа</span>
                <span className="font-medium">~2 часа</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">На платформе</span>
                <span className="font-medium">3 года</span>
              </div>
              <Button fullWidth size="lg" leftIcon={<MessageSquare className="h-4 w-4" />}>
                Связаться
              </Button>
              <Button variant="outline" fullWidth>
                Пригласить на проект
              </Button>
            </div>
          </Card>

          {/* Ссылки */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ссылки</h3>
            <div className="space-y-2">
              {[
                { label: 'GitHub', url: '#' },
                { label: 'LinkedIn', url: '#' },
                { label: 'Портфолио', url: '#' },
              ].map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {label}
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
