import {
  Users, Briefcase, DollarSign, AlertTriangle,
  TrendingUp, Activity,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui';
import { getPlatformStats } from '@/api/admin';

/**
 * Главная страница админ-панели — обзор статистики платформы.
 */
export default async function AdminDashboardPage() {
  const stats = await getPlatformStats();

  const cards = [
    {
      title: 'Пользователи',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Проекты',
      value: stats?.totalProjects ?? 0,
      icon: Briefcase,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Активные проекты',
      value: stats?.activeProjects ?? 0,
      icon: Activity,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Транзакции',
      value: stats?.totalTransactions ?? 0,
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Доход',
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Открытые споры',
      value: stats?.openDisputes ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Обзор платформы</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!stats && (
        <div className="mt-8 text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступа</h3>
          <p className="text-gray-500">
            Эта страница доступна только администраторам платформы.
          </p>
        </div>
      )}
    </div>
  );
}
