'use client';

import { Badge, Card, Avatar } from '@/components/ui';

const PROPOSAL_TABS = [
  { label: 'Все', value: 'all', count: 15 },
  { label: 'Ожидают', value: 'pending', count: 5 },
  { label: 'Принятые', value: 'accepted', count: 8 },
  { label: 'Отклоненные', value: 'rejected', count: 2 },
] as const;

/**
 * Страница откликов пользователя.
 */
export default function DashboardProposalsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Отклики</h1>

      {/* Табы */}
      <div className="flex gap-4 border-b border-gray-200">
        {PROPOSAL_TABS.map((tab) => (
          <button
            key={tab.value}
            className="pb-3 text-sm font-medium border-b-2 transition-colors first:border-indigo-600 first:text-indigo-600 border-transparent text-gray-500 hover:text-gray-700"
          >
            {tab.label}
            <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Список откликов */}
      <div className="space-y-4">
        {[
          { project: 'Разработка лендинга', price: 800, status: 'pending', date: '2 дня назад' },
          { project: 'Мобильное приложение', price: 3200, status: 'accepted', date: '5 дней назад' },
          { project: 'Редизайн сайта', price: 1500, status: 'pending', date: '1 неделю назад' },
        ].map((proposal, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {proposal.project}
                </h3>
                <p className="text-xs text-gray-500">Отправлен: {proposal.date}</p>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  ${proposal.price}
                </p>
              </div>
              <Badge
                variant={
                  proposal.status === 'accepted' ? 'success' :
                  proposal.status === 'rejected' ? 'danger' :
                  'warning'
                }
              >
                {proposal.status === 'accepted' ? 'Принят' :
                 proposal.status === 'rejected' ? 'Отклонён' :
                 'Ожидает'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
