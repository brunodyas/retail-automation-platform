'use server';

import { createClient } from '@/lib/supabase/server';
import type { INotification } from '@/types/notification';

/**
 * Получить уведомления текущего пользователя.
 */
export async function getMyNotifications(
  page = 1,
  limit = 20
): Promise<{ data: INotification[]; total: number; unreadCount: number }> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0, unreadCount: 0 };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0, unreadCount: 0 };

  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return { data: [], total: 0, unreadCount: 0 };

  // Считаем непрочитанные
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  const notifications: INotification[] = data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as INotification['type'],
    title: row.title as string,
    message: row.message as string,
    linkUrl: (row.link_url as string) || undefined,
    isRead: row.is_read as boolean,
    createdAt: row.created_at as string,
  }));

  return { data: notifications, total: count || 0, unreadCount: unreadCount || 0 };
}

/**
 * Пометить уведомление как прочитанное.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
}

/**
 * Пометить все уведомления как прочитанные.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
}

/**
 * Удалить уведомление.
 */
export async function deleteNotification(id: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from('notifications').delete().eq('id', id);
}
