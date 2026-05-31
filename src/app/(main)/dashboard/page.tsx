import type { Metadata } from 'next';
import {
  DollarSign,
  FolderKanban,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardTitle, Badge } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Управляйте проектами, финансами и настройками на VibeCoding Freelance',
};

const STAT_CARDS = [
  {
    title: 'Баланс',
    value: '$2 450',
    change: '+$350',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'В эскроу',
    value: '$1 200',
    change: '2 проекта',
    changeType: 'neutral' as const,
    icon: Clock,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Активных проектов',
    value: '5',
    change: '+2 за месяц',
    changeType: 'positive' as const,
    icon: FolderKanban,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Заработано за месяц',
    value: '$3 800',
    change: '+12%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'bg-purple-50 text-purple-600',
  },
] as const;

const RECENT_ACTIVITY = [
  {
    id: '1',
    type: 'project_completed',
    title: 'Проект "Лендинг SaaS" завершён',
    time: '2 часа назад',
  },
  {
    id: '2',
    type: 'payment_received',
    title: 'Получена оплата: $450',
    time: '5 часов назад',
  },
  {
    id: '3',
    type: 'new_proposal',
    title: 'Новый отклик на "Мобильное приложение"',
    time: 'Вчера',
  },
  {
    id: '4',
    type: 'new_message',
    title: 'Новое сообщение от TechStartup',
    time: 'Вчера',
  },
] as const;

/**
 * Главная страница личного кабинета.
 * Показывает сводку: баланс, проекты, активность.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>
        <p className="text-gray-500 mt-1">Добро пожаловать в личный кабинет</p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ title, value, change, changeType, icon: Icon, color }) => (
          <Card key={title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-sm mt-1 flex items-center gap-0.5">
                  {changeType === 'positive' && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                  )}
                  {changeType === 'neutral' && null}
                  <span className={changeType === 'positive' ? 'text-green-600' : 'text-gray-500'}>
                    {change}
                  </span>
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Последняя активность */}
      <Card>
        <CardTitle>Последняя активность</CardTitle>
        <div className="mt-4 divide-y divide-gray-100">
          {RECENT_ACTIVITY.map(({ id, title, time }) => (
            <div key={id} className="flex items-center justify-between py-3">
              <p className="text-sm text-gray-700">{title}</p>
              <span className="text-xs text-gray-400 shrink-0 ml-4">{time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Активные проекты */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Активные проекты</CardTitle>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
            Все проекты
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Проект #{i}: Разработка веб-приложения
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Дедлайн: 15 марта 2026
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Badge variant={i === 1 ? 'warning' : 'info'} size="sm">
                  {i === 1 ? 'На проверке' : 'В работе'}
                </Badge>
                <span className="text-sm font-medium text-gray-900">
                  ${i * 500}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
