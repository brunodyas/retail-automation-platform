'use client';

import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp } from 'lucide-react';
import { Card, CardTitle, Badge, Button } from '@/components/ui';

/**
 * Страница управления финансами в личном кабинете.
 * Баланс, эскроу, история транзакций.
 */
export default function DashboardFinancesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>

      {/* Карточки баланса */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Доступный баланс</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">$2 450</p>
          <Button variant="primary" size="sm" className="mt-3">
            Вывести средства
          </Button>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">В эскроу</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">$1 200</p>
          <p className="text-xs text-gray-400 mt-3">Заблокировано по 2 проектам</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Заработано за всё время</p>
          <p className="text-3xl font-bold text-green-600 mt-1">$24 800</p>
          <p className="text-xs text-green-500 mt-3 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            +12% за месяц
          </p>
        </Card>
      </div>

      {/* История транзакций */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>История транзакций</CardTitle>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>За все время</option>
            <option>За месяц</option>
            <option>За неделю</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            { type: 'income', desc: 'Оплата за "Лендинг SaaS"', amount: 450, date: '10 фев 2026' },
            { type: 'commission', desc: 'Комиссия платформы (10%)', amount: -45, date: '10 фев 2026' },
            { type: 'income', desc: 'Оплата за "UI Kit"', amount: 300, date: '8 фев 2026' },
            { type: 'withdrawal', desc: 'Вывод на карту *4521', amount: -1200, date: '5 фев 2026' },
            { type: 'escrow', desc: 'Депозит эскроу "Мобильное приложение"', amount: 800, date: '3 фев 2026' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  tx.amount > 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.desc}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${
                tx.amount > 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
