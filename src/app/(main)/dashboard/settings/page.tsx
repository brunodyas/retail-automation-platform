'use client';

import { Card, CardTitle, Button, Input } from '@/components/ui';

/**
 * Страница настроек аккаунта.
 * Изменение пароля, email-уведомления, удаление аккаунта.
 */
export default function DashboardSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      {/* Безопасность */}
      <Card>
        <CardTitle>Безопасность</CardTitle>
        <div className="mt-4 space-y-4 max-w-md">
          <Input
            label="Текущий пароль"
            type="password"
            placeholder="Введите текущий пароль"
          />
          <Input
            label="Новый пароль"
            type="password"
            placeholder="Минимум 8 символов"
          />
          <Input
            label="Подтвердите новый пароль"
            type="password"
            placeholder="Повторите пароль"
          />
          <Button>Изменить пароль</Button>
        </div>
      </Card>

      {/* Уведомления */}
      <Card>
        <CardTitle>Уведомления</CardTitle>
        <div className="mt-4 space-y-4">
          {[
            { label: 'Новые отклики на проект', key: 'proposals' },
            { label: 'Новые сообщения', key: 'messages' },
            { label: 'Изменение статуса проекта', key: 'status' },
            { label: 'Зачисление и списание средств', key: 'payments' },
            { label: 'Маркетинговые рассылки', key: 'marketing' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Push
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Опасная зона */}
      <Card className="border-red-200">
        <CardTitle className="text-red-600">Опасная зона</CardTitle>
        <p className="text-sm text-gray-500 mt-2 mb-4">
          Удаление аккаунта необратимо. Все данные будут удалены навсегда.
        </p>
        <Button variant="danger">
          Удалить аккаунт
        </Button>
      </Card>
    </div>
  );
}
