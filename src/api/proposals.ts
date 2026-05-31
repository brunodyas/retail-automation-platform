'use server';

import { createClient } from '@/lib/supabase/server';
import type { IProposal, IProposalWithFreelancer } from '@/types';
import { LIMITS } from '@/constants';

/** Результат с пагинацией */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Подать заявку на проект.
 */
export async function submitProposal(data: {
  projectId: string;
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { id: null, error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { id: null, error: 'Не авторизован' };

  // Проверить что ещё не подавал заявку
  const { data: existing } = await supabase
    .from('proposals')
    .select('id')
    .eq('project_id', data.projectId)
    .eq('freelancer_id', user.id)
    .maybeSingle();

  if (existing) {
    return { id: null, error: 'Вы уже подали заявку на этот проект' };
  }

  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert({
      project_id: data.projectId,
      freelancer_id: user.id,
      cover_letter: data.coverLetter,
      proposed_price: data.proposedPrice,
      estimated_days: data.estimatedDays,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };

  // Увеличить счётчик заявок
  await supabase.rpc('increment_proposal_count', { project_id: data.projectId });

  return { id: proposal.id, error: null };
}

/**
 * Получить заявки на проект (для заказчика).
 */
export async function getProjectProposals(
  projectId: string,
  page = 1
): Promise<PaginatedResult<IProposalWithFreelancer>> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0, page, totalPages: 0 };
  const limit = LIMITS.PROPOSALS_PER_PAGE;
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles!proposals_freelancer_id_fkey (
        name, avatar_url
      ),
      freelancer_profiles!proposals_freelancer_id_fkey (
        title, rating, completed_projects
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching proposals:', error);
    return { data: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const proposals: IProposalWithFreelancer[] = (data || []).map(
    (row: Record<string, unknown>) => {
      const profile = row.profiles as Record<string, unknown> | null;
      const freelancerProfile = row.freelancer_profiles as Record<string, unknown> | null;

      return {
        id: row.id as string,
        projectId: row.project_id as string,
        freelancerId: row.freelancer_id as string,
        coverLetter: row.cover_letter as string,
        proposedPrice: Number(row.proposed_price),
        estimatedDays: row.estimated_days as number,
        status: row.status as IProposal['status'],
        attachments: [],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        freelancerName: (profile?.name as string) || 'Фрилансер',
        freelancerAvatarUrl: (profile?.avatar_url as string) || undefined,
        freelancerTitle: (freelancerProfile?.title as string) || '',
        freelancerRating: Number(freelancerProfile?.rating) || 0,
        freelancerCompletedProjects: (freelancerProfile?.completed_projects as number) || 0,
      };
    }
  );

  return { data: proposals, total, page, totalPages };
}

/**
 * Получить заявки текущего исполнителя (для дашборда).
 */
export async function getMyProposals(
  status?: string,
  page = 1
): Promise<PaginatedResult<IProposal & { projectTitle: string; projectSlug: string }>> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0, page, totalPages: 0 };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0, page, totalPages: 0 };

  const limit = LIMITS.PROPOSALS_PER_PAGE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('proposals')
    .select(`
      *,
      projects!proposals_project_id_fkey (title, slug)
    `, { count: 'exact' })
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) return { data: [], total: 0, page, totalPages: 0 };

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const proposals = (data || []).map((row: Record<string, unknown>) => {
    const project = row.projects as Record<string, unknown> | null;
    return {
      id: row.id as string,
      projectId: row.project_id as string,
      freelancerId: row.freelancer_id as string,
      coverLetter: row.cover_letter as string,
      proposedPrice: Number(row.proposed_price),
      estimatedDays: row.estimated_days as number,
      status: row.status as IProposal['status'],
      attachments: [],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      projectTitle: (project?.title as string) || '',
      projectSlug: (project?.slug as string) || '',
    };
  });

  return { data: proposals, total, page, totalPages };
}

/**
 * Принять заявку (для заказчика).
 */
export async function acceptProposal(
  proposalId: string,
  projectId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  // Принять выбранную заявку
  const { error: acceptError } = await supabase
    .from('proposals')
    .update({ status: 'accepted' })
    .eq('id', proposalId);

  if (acceptError) return { error: acceptError.message };

  // Отклонить остальные заявки
  await supabase
    .from('proposals')
    .update({ status: 'rejected' })
    .eq('project_id', projectId)
    .neq('id', proposalId)
    .eq('status', 'pending');

  // Обновить статус проекта и выбранного исполнителя
  const { data: proposal } = await supabase
    .from('proposals')
    .select('freelancer_id')
    .eq('id', proposalId)
    .single();

  if (proposal) {
    await supabase
      .from('projects')
      .update({
        status: 'performer_selected',
        selected_freelancer_id: proposal.freelancer_id,
      })
      .eq('id', projectId);
  }

  return { error: null };
}

/**
 * Отозвать свою заявку.
 */
export async function withdrawProposal(proposalId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('proposals')
    .update({ status: 'withdrawn' })
    .eq('id', proposalId)
    .eq('freelancer_id', user.id);

  if (error) return { error: error.message };

  return { error: null };
}
