'use server';

import { createClient } from '@/lib/supabase/server';
import type { IReview } from '@/types/review';

/**
 * Создать отзыв.
 */
export async function createReview(data: {
  projectId: string;
  targetUserId: string;
  rating: number;
  comment: string;
  categories?: {
    quality?: number;
    communication?: number;
    deadlines?: number;
    professionalism?: number;
  };
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { id: null, error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { id: null, error: 'Не авторизован' };

  // Проверить что нет повторного отзыва
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('project_id', data.projectId)
    .eq('reviewer_id', user.id)
    .maybeSingle();

  if (existing) {
    return { id: null, error: 'Вы уже оставили отзыв на этот проект' };
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      project_id: data.projectId,
      reviewer_id: user.id,
      target_user_id: data.targetUserId,
      rating: data.rating,
      comment: data.comment,
      quality_rating: data.categories?.quality,
      communication_rating: data.categories?.communication,
      deadlines_rating: data.categories?.deadlines,
      professionalism_rating: data.categories?.professionalism,
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };

  return { id: review.id, error: null };
}

/**
 * Получить отзывы пользователя.
 */
export async function getUserReviews(
  userId: string,
  page = 1,
  limit = 10
): Promise<{ data: IReview[]; total: number }> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0 };
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles!reviews_reviewer_id_fkey (name, avatar_url),
      projects!reviews_project_id_fkey (title)
    `, { count: 'exact' })
    .eq('target_user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return { data: [], total: 0 };

  const reviews: IReview[] = data.map((row: Record<string, unknown>) => {
    const reviewer = row.profiles as Record<string, unknown> | null;
    const project = row.projects as Record<string, unknown> | null;

    return {
      id: row.id as string,
      projectId: row.project_id as string,
      projectTitle: (project?.title as string) || '',
      reviewerId: row.reviewer_id as string,
      reviewerName: (reviewer?.name as string) || 'Пользователь',
      reviewerAvatarUrl: (reviewer?.avatar_url as string) || undefined,
      targetUserId: row.target_user_id as string,
      rating: Number(row.rating),
      comment: row.comment as string,
      categories: {
        quality: row.quality_rating ? Number(row.quality_rating) : undefined,
        communication: row.communication_rating ? Number(row.communication_rating) : undefined,
        deadlines: row.deadlines_rating ? Number(row.deadlines_rating) : undefined,
        professionalism: row.professionalism_rating ? Number(row.professionalism_rating) : undefined,
      },
      createdAt: row.created_at as string,
    };
  });

  return { data: reviews, total: count || 0 };
}
