'use server';

import { createClient } from '@/lib/supabase/server';

/** Баланс пользователя */
interface UserBalance {
  available: number;
  escrow: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalSpent: number;
}

/** Транзакция */
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'commission' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  projectTitle?: string;
  createdAt: string;
}

/**
 * Получить баланс текущего пользователя.
 */
export async function getMyBalance(): Promise<UserBalance> {
  const supabase = await createClient();
  if (!supabase) return { available: 0, escrow: 0, pendingWithdrawal: 0, totalEarned: 0, totalSpent: 0 };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { available: 0, escrow: 0, pendingWithdrawal: 0, totalEarned: 0, totalSpent: 0 };
  }

  const { data } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!data) {
    return { available: 0, escrow: 0, pendingWithdrawal: 0, totalEarned: 0, totalSpent: 0 };
  }

  return {
    available: Number(data.available_balance) || 0,
    escrow: Number(data.escrow_balance) || 0,
    pendingWithdrawal: Number(data.pending_withdrawal) || 0,
    totalEarned: Number(data.total_earned) || 0,
    totalSpent: Number(data.total_spent) || 0,
  };
}

/**
 * Получить историю транзакций.
 */
export async function getMyTransactions(
  page = 1,
  limit = 20
): Promise<{ data: Transaction[]; total: number }> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0 };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0 };

  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('transactions')
    .select(`
      *,
      projects!transactions_project_id_fkey (title)
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return { data: [], total: 0 };

  const transactions: Transaction[] = data.map((row: Record<string, unknown>) => {
    const project = row.projects as Record<string, unknown> | null;
    return {
      id: row.id as string,
      type: row.type as Transaction['type'],
      amount: Number(row.amount),
      status: row.status as Transaction['status'],
      description: row.description as string,
      projectTitle: (project?.title as string) || undefined,
      createdAt: row.created_at as string,
    };
  });

  return { data: transactions, total: count || 0 };
}

/**
 * Положить средства на эскроу для проекта.
 */
export async function createEscrowHold(data: {
  projectId: string;
  amount: number;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  // Проверить баланс
  const balance = await getMyBalance();
  if (balance.available < data.amount) {
    return { error: 'Недостаточно средств на балансе' };
  }

  // Создать транзакцию
  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    project_id: data.projectId,
    type: 'escrow_hold',
    amount: data.amount,
    status: 'completed',
    description: 'Средства заблокированы на эскроу',
  });

  if (error) return { error: error.message };

  // Обновить баланс
  await supabase.rpc('hold_escrow', {
    p_user_id: user.id,
    p_amount: data.amount,
  });

  return { error: null };
}
