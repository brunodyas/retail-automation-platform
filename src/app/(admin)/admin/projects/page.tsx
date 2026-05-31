'use client';

import { useState, useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button, Badge, Card, Select } from '@/components/ui';
import { getAdminProjects } from '@/api/admin';
import { formatDate, formatCurrency } from '@/utils/format';
import { PROJECT_STATUS_LABELS } from '@/constants';

interface AdminProject {
  id: string;
  title: string;
  clientName: string;
  status: string;
  budgetMin: number;
  proposalCount: number;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'open', label: 'Открыт' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
  { value: 'disputed', label: 'В споре' },
] as const;

/**
 * Управление проектами (админка).
 */
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async (status?: string) => {
    setIsLoading(true);
    try {
      const result = await getAdminProjects(1, 50, status || undefined);
      setProjects(result.data);
      setTotal(result.total);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(statusFilter);
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Проекты</h2>
          <p className="text-sm text-gray-500 mt-1">Всего: {total}</p>
        </div>
        <Select
          options={STATUS_OPTIONS.map(({ value, label }) => ({ value, label }))}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Проектов не найдено</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Проект</th>
                  <th className="pb-3 font-medium text-gray-500">Заказчик</th>
                  <th className="pb-3 font-medium text-gray-500">Статус</th>
                  <th className="pb-3 font-medium text-gray-500">Бюджет</th>
                  <th className="pb-3 font-medium text-gray-500">Заявки</th>
                  <th className="pb-3 font-medium text-gray-500">Дата</th>
                  <th className="pb-3 font-medium text-gray-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{p.title}</p>
                    </td>
                    <td className="py-3 text-gray-600">{p.clientName}</td>
                    <td className="py-3">
                      <Badge
                        variant={p.status === 'open' ? 'success' : p.status === 'disputed' ? 'danger' : 'default'}
                        size="sm"
                      >
                        {PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS] || p.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-900 font-medium">
                      {formatCurrency(p.budgetMin)}
                    </td>
                    <td className="py-3 text-gray-600">{p.proposalCount}</td>
                    <td className="py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="py-3">
                      <Link href={`/projects/${p.id}`} target="_blank">
                        <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                          Открыть
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
