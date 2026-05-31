'use server';

import { createClient } from '@/lib/supabase/server';
import type { IProject, IProjectCard } from '@/types';
import { LIMITS } from '@/constants';
import { MOCK_PROJECTS } from '@/lib/mock-data';

/** Параметры фильтрации и поиска проектов */
interface ProjectFilters {
  query?: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel?: string;
  skills?: string[];
  status?: string;
  sortBy?: 'newest' | 'budget_desc' | 'budget_asc' | 'popular';
  page?: number;
  limit?: number;
}

/** Результат листинга с пагинацией */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Получить список проектов с фильтрацией и пагинацией.
 */
export async function getProjects(
  filters: ProjectFilters = {}
): Promise<PaginatedResult<IProjectCard>> {
  const supabase = await createClient();
  const page = filters.page || 1;
  const limit = filters.limit || LIMITS.PROJECTS_PER_PAGE;

  if (!supabase) {
    // Mock-режим: фильтрация и пагинация по mock-данным
    let filtered = [...MOCK_PROJECTS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }
    if (filters.budgetMin) {
      filtered = filtered.filter((p) => p.budgetMin >= (filters.budgetMin || 0));
    }
    if (filters.budgetMax) {
      filtered = filtered.filter((p) => (p.budgetMax || p.budgetMin) <= (filters.budgetMax || Infinity));
    }
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { data: paged, total: filtered.length, page, totalPages: Math.ceil(filtered.length / limit) };
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from('projects')
    .select(`
      id, title, slug, category, description, skills,
      budget_type, budget_min, budget_max, status, proposal_count,
      created_at,
      profiles!projects_client_id_fkey (name, avatar_url)
    `, { count: 'exact' })
    .eq('status', filters.status || 'open');

  // Поиск по тексту
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  // Фильтр по категории
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  // Фильтр по бюджету
  if (filters.budgetMin) {
    query = query.gte('budget_min', filters.budgetMin);
  }
  if (filters.budgetMax) {
    query = query.lte('budget_max', filters.budgetMax);
  }

  // Фильтр по уровню
  if (filters.experienceLevel && filters.experienceLevel !== 'any') {
    query = query.eq('experience_level', filters.experienceLevel);
  }

  // Фильтр по навыкам
  if (filters.skills && filters.skills.length > 0) {
    query = query.overlaps('skills', filters.skills);
  }

  // Сортировка
  switch (filters.sortBy) {
    case 'budget_desc':
      query = query.order('budget_min', { ascending: false });
      break;
    case 'budget_asc':
      query = query.order('budget_min', { ascending: true });
      break;
    case 'popular':
      query = query.order('proposal_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return { data: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const projects: IProjectCard[] = (data || []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      category: row.category as string,
      description: row.description as string,
      skills: (row.skills as string[]) || [],
      budgetType: row.budget_type as IProjectCard['budgetType'],
      budgetMin: Number(row.budget_min),
      budgetMax: row.budget_max ? Number(row.budget_max) : undefined,
      status: row.status as IProjectCard['status'],
      proposalCount: (row.proposal_count as number) || 0,
      clientName: (profile?.name as string) || 'Заказчик',
      clientAvatarUrl: (profile?.avatar_url as string) || undefined,
      clientRating: 0,
      createdAt: row.created_at as string,
    };
  });

  return { data: projects, total, page, totalPages };
}

/**
 * Получить проект по ID (полная информация).
 */
export async function getProjectById(id: string): Promise<IProject | null> {
  const supabase = await createClient();
  if (!supabase) {
    // Mock
    const mock = MOCK_PROJECTS.find((p) => p.id === id);
    if (!mock) return null;
    return {
      id: mock.id,
      clientId: 'mock-client',
      title: mock.title,
      slug: mock.slug,
      category: mock.category,
      description: mock.description,
      skills: mock.skills,
      budgetType: mock.budgetType,
      budgetMin: mock.budgetMin,
      budgetMax: mock.budgetMax,
      experienceLevel: 'any',
      status: mock.status,
      visibility: 'public',
      hasNda: false,
      proposalCount: mock.proposalCount,
      viewCount: 124,
      milestones: [],
      attachments: [],
      createdAt: mock.createdAt,
      updatedAt: mock.createdAt,
    };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      milestones (*),
      project_attachments (*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  // Увеличить view_count
  await supabase
    .from('projects')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id);

  return {
    id: data.id,
    clientId: data.client_id,
    title: data.title,
    slug: data.slug,
    category: data.category,
    description: data.description,
    skills: data.skills || [],
    budgetType: data.budget_type,
    budgetMin: Number(data.budget_min),
    budgetMax: data.budget_max ? Number(data.budget_max) : undefined,
    estimatedHours: data.estimated_hours || undefined,
    deadline: data.deadline || undefined,
    experienceLevel: data.experience_level,
    status: data.status,
    visibility: data.visibility || 'public',
    hasNda: data.has_nda || false,
    selectedFreelancerId: data.selected_freelancer_id || undefined,
    proposalCount: data.proposal_count || 0,
    viewCount: data.view_count || 0,
    milestones: (data.milestones || []).map((m: Record<string, unknown>) => ({
      id: m.id,
      projectId: m.project_id,
      title: m.title,
      description: m.description || '',
      amount: Number(m.amount),
      deadline: m.deadline || undefined,
      status: m.status,
      order: m.sort_order || 0,
    })),
    attachments: (data.project_attachments || []).map((a: Record<string, unknown>) => ({
      id: a.id,
      fileName: a.file_name,
      fileUrl: a.file_url,
      fileSize: Number(a.file_size),
      mimeType: a.mime_type,
      uploadedAt: a.created_at,
    })),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Создать новый проект.
 */
export async function createProject(data: {
  title: string;
  category: string;
  description: string;
  skills: string[];
  budgetType: string;
  budgetMin: number;
  budgetMax?: number;
  estimatedHours?: number;
  deadline?: string;
  experienceLevel: string;
  visibility?: string;
  hasNda?: boolean;
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { id: null, error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { id: null, error: 'Не авторизован' };

  // Генерация slug
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) + '-' + Date.now().toString(36);

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      client_id: user.id,
      title: data.title,
      slug,
      category: data.category,
      description: data.description,
      skills: data.skills,
      budget_type: data.budgetType,
      budget_min: data.budgetMin,
      budget_max: data.budgetMax || null,
      estimated_hours: data.estimatedHours || null,
      deadline: data.deadline || null,
      experience_level: data.experienceLevel,
      visibility: data.visibility || 'public',
      has_nda: data.hasNda || false,
      status: 'open',
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };

  return { id: project.id, error: null };
}

/**
 * Обновить проект (только владелец).
 */
export async function updateProject(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    skills: string[];
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    status: string;
  }>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('projects')
    .update({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.skills && { skills: data.skills }),
      ...(data.budgetMin && { budget_min: data.budgetMin }),
      ...(data.budgetMax && { budget_max: data.budgetMax }),
      ...(data.deadline && { deadline: data.deadline }),
      ...(data.status && { status: data.status }),
    })
    .eq('id', id)
    .eq('client_id', user.id);

  if (error) return { error: error.message };

  return { error: null };
}

/**
 * Удалить проект (мягкое удаление — смена статуса на cancelled).
 */
export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('projects')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('client_id', user.id);

  if (error) return { error: error.message };

  return { error: null };
}

/**
 * Получить проекты текущего пользователя (для дашборда).
 */
export async function getMyProjects(
  status?: string,
  page = 1
): Promise<PaginatedResult<IProjectCard>> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0, page, totalPages: 0 };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0, page, totalPages: 0 };

  const limit = LIMITS.PROJECTS_PER_PAGE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) return { data: [], total: 0, page, totalPages: 0 };

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const projects: IProjectCard[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as string,
    description: row.description as string,
    skills: (row.skills as string[]) || [],
    budgetType: row.budget_type as IProjectCard['budgetType'],
    budgetMin: Number(row.budget_min),
    budgetMax: row.budget_max ? Number(row.budget_max) : undefined,
    status: row.status as IProjectCard['status'],
    proposalCount: (row.proposal_count as number) || 0,
    clientName: '',
    clientRating: 0,
    createdAt: row.created_at as string,
  }));

  return { data: projects, total, page, totalPages };
}
