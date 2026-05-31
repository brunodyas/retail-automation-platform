'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Ban, Loader2 } from 'lucide-react';
import { Input, Button, Badge, Card } from '@/components/ui';
import { getAdminUsers, toggleUserBan } from '@/api/admin';
import { formatDate } from '@/utils/format';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  freelancer: 'Исполнитель',
  client: 'Заказчик',
  both: 'Оба',
  admin: 'Администратор',
  moderator: 'Модератор',
};

/**
 * Страница управления пользователями (админка).
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async (p = 1, q = '') => {
    setIsLoading(true);
    try {
      const result = await getAdminUsers(p, 20, q || undefined);
      setUsers(result.data);
      setTotal(result.total);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page, search);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadUsers(1, search);
  };

  const handleBan = async (userId: string, ban: boolean) => {
    await toggleUserBan(userId, ban);
    loadUsers(page, search);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Пользователи</h2>
          <p className="text-sm text-gray-500 mt-1">Всего: {total}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button onClick={handleSearch}>Найти</Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Пользователей не найдено</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Пользователь</th>
                  <th className="pb-3 font-medium text-gray-500">Роль</th>
                  <th className="pb-3 font-medium text-gray-500">Статус</th>
                  <th className="pb-3 font-medium text-gray-500">Регистрация</th>
                  <th className="pb-3 font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={u.role === 'admin' ? 'danger' : 'default'} size="sm">
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {u.isVerified ? (
                        <Badge variant="success" size="sm">Подтверждён</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Не подтверждён</Badge>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Shield className="h-3.5 w-3.5" />}
                        >
                          Профиль
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Ban className="h-3.5 w-3.5" />}
                          onClick={() => handleBan(u.id, true)}
                        >
                          Бан
                        </Button>
                      </div>
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
