/** Статус транзакции */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'frozen';

/** Тип транзакции */
export type TransactionType =
  | 'deposit'        // Пополнение баланса
  | 'withdrawal'     // Вывод средств
  | 'escrow_lock'    // Блокировка в эскроу
  | 'escrow_release' // Выплата из эскроу
  | 'escrow_refund'  // Возврат из эскроу
  | 'commission';    // Комиссия платформы

/** Способ оплаты */
export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'ewallet';

/** Транзакция */
export interface ITransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  projectId?: string;
  milestoneId?: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

/** Баланс пользователя */
export interface IUserBalance {
  available: number;
  inEscrow: number;
  pendingWithdrawal: number;
  currency: string;
}

/** Ставка комиссии (прогрессивная шкала) */
export interface ICommissionTier {
  minAmount: number;
  maxAmount: number;
  rate: number; // В процентах (например, 15 для 15%)
}
