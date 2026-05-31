'use server';

import { createClient } from '@/lib/supabase/server';
import { LIMITS } from '@/constants';
import { MOCK_FREELANCERS } from '@/lib/mock-data';

/** Карточка фрилансера для списка */
interface FreelancerCard {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  skills: string[];
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  availability: string;
  country?: string;
  city?: string;
}

/** Параметры фильтрации */
interface FreelancerFilters {
  query?: string;
  category?: string;
  skills?: string[];
  rateMin?: number;
  rateMax?: number;
  ratingMin?: number;
  availability?: string;
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'projects' | 'newest';
  page?: number;
  limit?: number;
}

/** Результат с пагинацией */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Получить список фрилансеров с фильтрацией и пагинацией.
 */
export async function getFreelancers(
  filters: FreelancerFilters = {}
): Promise<PaginatedResult<FreelancerCard>> {
  const supabase = await createClient();
  const page = filters.page || 1;
  const limit = filters.limit || LIMITS.FREELANCERS_PER_PAGE;

  if (!supabase) {
    // Mock-режим
    let filtered = [...MOCK_FREELANCERS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.category) {
      filtered = filtered.filter((f) =>
        f.skills.some((s) => s.toLowerCase().includes(filters.category!.toLowerCase()))
      );
    }
    if (filters.rateMin) {
      filtered = filtered.filter((f) => (f.hourlyRate || 0) >= (filters.rateMin || 0));
    }
    if (filters.rateMax) {
      filtered = filtered.filter((f) => (f.hourlyRate || 0) <= (filters.rateMax || Infinity));
    }
    if (filters.ratingMin) {
      filtered = filtered.filter((f) => f.rating >= (filters.ratingMin || 0));
    }
    if (filters.availability && filters.availability !== 'any') {
      filtered = filtered.filter((f) => f.availability === filters.availability);
    }
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return {
      data: paged,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
  const offset = (page - 1) * limit;

  let query = supabase
    .from('freelancer_profiles')
    .select(`
      id, title, skills, hourly_rate, rating, review_count,
      completed_projects, availability, categories,
      profiles!freelancer_profiles_id_fkey (name, avatar_url, country, city)
    `, { count: 'exact' });

  // Текстовый поиск
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%`);
  }

  // Фильтр по навыкам
  if (filters.skills && filters.skills.length > 0) {
    query = query.overlaps('skills', filters.skills);
  }

  // Фильтр по категории
  if (filters.category) {
    query = query.contains('categories', [filters.category]);
  }

  // Фильтр по ставке
  if (filters.rateMin) {
    query = query.gte('hourly_rate', filters.rateMin);
  }
  if (filters.rateMax) {
    query = query.lte('hourly_rate', filters.rateMax);
  }

  // Фильтр по рейтингу
  if (filters.ratingMin) {
    query = query.gte('rating', filters.ratingMin);
  }

  // Фильтр по доступности
  if (filters.availability) {
    query = query.eq('availability', filters.availability);
  }

  // Сортировка
  switch (filters.sortBy) {
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'price_asc':
      query = query.order('hourly_rate', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('hourly_rate', { ascending: false });
      break;
    case 'projects':
      query = query.order('completed_projects', { ascending: false });
      break;
    default:
      query = query.order('rating', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching freelancers:', error);
    return { data: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const freelancers: FreelancerCard[] = (data || []).map(
    (row: Record<string, unknown>) => {
      const profile = row.profiles as Record<string, unknown> | null;
      return {
        id: row.id as string,
        name: (profile?.name as string) || 'Фрилансер',
        avatarUrl: (profile?.avatar_url as string) || undefined,
        title: (row.title as string) || '',
        skills: (row.skills as string[]) || [],
        hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
        rating: Number(row.rating) || 0,
        reviewCount: (row.review_count as number) || 0,
        completedProjects: (row.completed_projects as number) || 0,
        availability: (row.availability as string) || 'available',
        country: (profile?.country as string) || undefined,
        city: (profile?.city as string) || undefined,
      };
    }
  );

  return { data: freelancers, total, page, totalPages };
}
