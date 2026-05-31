'use server';

import { createClient } from '@/lib/supabase/server';

/** Статистика платформы */
interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTransactions: number;
  totalRevenue: number;
  openDisputes: number;
}

/** Пользователь для админ-списка */
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

/** Проект для админ-списка */
interface AdminProject {
  id: string;
  title: string;
  clientName: string;
  status: string;
  budgetMin: number;
  proposalCount: number;
  createdAt: string;
}

/** Спор для админ-списка */
interface AdminDispute {
  id: string;
  projectTitle: string;
  initiatorName: string;
  respondentName: string;
  status: string;
  reason: string;
  createdAt: string;
}

/**
 * Проверить что пользователь — администратор.
 */
async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    return null;
  }

  return { userId: user.id };
}

/**
 * Получить статистику платформы.
 */
export async function getPlatformStats(): Promise<PlatformStats | null> {
  const admin = await requireAdmin();
  if (!admin) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const [users, projects, activeProjects, transactions, disputes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('transactions').select('id', { count: 'exact', head: true }),
    supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  return {
    totalUsers: users.count || 0,
    totalProjects: projects.count || 0,
    activeProjects: activeProjects.count || 0,
    totalTransactions: transactions.count || 0,
    totalRevenue: 0, // Требуется отдельный RPC для суммы
    openDisputes: disputes.count || 0,
  };
}

/**
 * Получить список пользователей (для админки).
 */
export async function getAdminUsers(
  page = 1,
  limit = 20,
  search?: string
): Promise<{ data: AdminUser[]; total: number }> {
  const admin = await requireAdmin();
  if (!admin) return { data: [], total: 0 };

  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0 };
  const offset = (page - 1) * limit;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error || !data) return { data: [], total: 0 };

  const users: AdminUser[] = data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as string,
    isVerified: row.is_verified as boolean,
    createdAt: row.created_at as string,
    lastActiveAt: (row.last_active_at as string) || undefined,
  }));

  return { data: users, total: count || 0 };
}

/**
 * Получить список проектов (для админки).
 */
export async function getAdminProjects(
  page = 1,
  limit = 20,
  status?: string
): Promise<{ data: AdminProject[]; total: number }> {
  const admin = await requireAdmin();
  if (!admin) return { data: [], total: 0 };

  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0 };
  const offset = (page - 1) * limit;

  let query = supabase
    .from('projects')
    .select(`
      id, title, status, budget_min, proposal_count, created_at,
      profiles!projects_client_id_fkey (name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error || !data) return { data: [], total: 0 };

  const projects: AdminProject[] = data.map((row: Record<string, unknown>) => {
    const client = row.profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      title: row.title as string,
      clientName: (client?.name as string) || 'Неизвестен',
      status: row.status as string,
      budgetMin: Number(row.budget_min),
      proposalCount: (row.proposal_count as number) || 0,
      createdAt: row.created_at as string,
    };
  });

  return { data: projects, total: count || 0 };
}

/**
 * Получить список споров (для админки).
 */
export async function getAdminDisputes(
  page = 1,
  limit = 20
): Promise<{ data: AdminDispute[]; total: number }> {
  const admin = await requireAdmin();
  if (!admin) return { data: [], total: 0 };

  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0 };
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('disputes')
    .select(`
      *,
      projects!disputes_project_id_fkey (title),
      initiator:profiles!disputes_initiator_id_fkey (name),
      respondent:profiles!disputes_respondent_id_fkey (name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return { data: [], total: 0 };

  const disputes: AdminDispute[] = data.map((row: Record<string, unknown>) => {
    const project = row.projects as Record<string, unknown> | null;
    const initiator = row.initiator as Record<string, unknown> | null;
    const respondent = row.respondent as Record<string, unknown> | null;

    return {
      id: row.id as string,
      projectTitle: (project?.title as string) || '',
      initiatorName: (initiator?.name as string) || '',
      respondentName: (respondent?.name as string) || '',
      status: row.status as string,
      reason: (row.reason as string) || '',
      createdAt: row.created_at as string,
    };
  });

  return { data: disputes, total: count || 0 };
}

/**
 * Забанить / разбанить пользователя.
 */
export async function toggleUserBan(
  userId: string,
  banned: boolean
): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Нет прав' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };

  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: banned })
    .eq('id', userId);

  if (error) return { error: error.message };

  return { error: null };
}
