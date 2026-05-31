'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { getAdminDisputes } from '@/api/admin';
import { formatDate } from '@/utils/format';

interface AdminDispute {
  id: string;
  projectTitle: string;
  initiatorName: string;
  respondentName: string;
  status: string;
  reason: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Открыт',
  in_review: 'На рассмотрении',
  resolved: 'Решён',
  closed: 'Закрыт',
};

/**
 * Управление спорами (админка).
 */
export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDisputes = async () => {
      setIsLoading(true);
      try {
        const result = await getAdminDisputes();
        setDisputes(result.data);
        setTotal(result.total);
      } catch {
        setDisputes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDisputes();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Споры</h2>
        <p className="text-sm text-gray-500 mt-1">Всего: {total}</p>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Нет активных споров</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Проект</th>
                  <th className="pb-3 font-medium text-gray-500">Инициатор</th>
                  <th className="pb-3 font-medium text-gray-500">Ответчик</th>
                  <th className="pb-3 font-medium text-gray-500">Статус</th>
                  <th className="pb-3 font-medium text-gray-500">Причина</th>
                  <th className="pb-3 font-medium text-gray-500">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900 max-w-xs truncate">
                      {d.projectTitle}
                    </td>
                    <td className="py-3 text-gray-600">{d.initiatorName}</td>
                    <td className="py-3 text-gray-600">{d.respondentName}</td>
                    <td className="py-3">
                      <Badge
                        variant={d.status === 'open' ? 'danger' : d.status === 'resolved' ? 'success' : 'default'}
                        size="sm"
                      >
                        {STATUS_LABELS[d.status] || d.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500 max-w-xs truncate">{d.reason}</td>
                    <td className="py-3 text-gray-500">{formatDate(d.createdAt)}</td>
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
