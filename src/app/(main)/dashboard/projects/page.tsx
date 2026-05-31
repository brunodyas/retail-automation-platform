'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button, Badge, Card } from '@/components/ui';
import { ROUTES, PROJECT_STATUS_LABELS } from '@/constants';
import type { ProjectStatus } from '@/types';

const TABS = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершенные', value: 'completed' },
  { label: 'Черновики', value: 'draft' },
] as const;

/**
 * Страница списка проектов пользователя в кабинете.
 */
export default function DashboardProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Мои проекты</h1>
        <Link href={ROUTES.CREATE_PROJECT}>
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Новый проект
          </Button>
        </Link>
      </div>

      {/* Табы */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 first:bg-white first:text-gray-900 first:shadow-sm"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Список проектов */}
      <div className="space-y-3">
        {[
          { title: 'Лендинг для SaaS', status: 'in_progress' as ProjectStatus, budget: 800, proposals: 5 },
          { title: 'Мобильное приложение', status: 'open' as ProjectStatus, budget: 3500, proposals: 12 },
          { title: 'Редизайн корпоративного сайта', status: 'under_review' as ProjectStatus, budget: 1500, proposals: 8 },
          { title: 'Интеграция платежной системы', status: 'completed' as ProjectStatus, budget: 600, proposals: 3 },
          { title: 'MVP для стартапа', status: 'draft' as ProjectStatus, budget: 5000, proposals: 0 },
        ].map((project, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
                  <Badge
                    variant={
                      project.status === 'completed' ? 'success' :
                      project.status === 'open' ? 'info' :
                      project.status === 'draft' ? 'default' :
                      'warning'
                    }
                    size="sm"
                  >
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Бюджет: ${project.budget} &middot; Откликов: {project.proposals}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Подробнее
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
