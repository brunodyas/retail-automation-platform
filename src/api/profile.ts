'use server';

import { createClient } from '@/lib/supabase/server';
import type { IUser, IFreelancerProfile, IClientProfile } from '@/types';

/** Маппинг snake_case БД → camelCase TypeScript для базового профиля */
function mapProfile(row: Record<string, unknown>): IUser {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    avatarUrl: (row.avatar_url as string) || undefined,
    role: row.role as IUser['role'],
    isVerified: row.is_verified as boolean,
    verificationStatus: row.verification_status as IUser['verificationStatus'],
    country: (row.country as string) || undefined,
    city: (row.city as string) || undefined,
    timezone: (row.timezone as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    lastActiveAt: (row.last_active_at as string) || undefined,
  };
}

/**
 * Получить профиль текущего пользователя.
 */
export async function getMyProfile(): Promise<IUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  return mapProfile(data);
}

/**
 * Получить публичный профиль пользователя по ID.
 */
export async function getProfileById(userId: string): Promise<IUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return mapProfile(data);
}

/**
 * Получить профиль исполнителя с детальной информацией.
 */
export async function getFreelancerProfile(
  userId: string
): Promise<IFreelancerProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: freelancerData } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profileData || !freelancerData) return null;

  const base = mapProfile(profileData);

  return {
    ...base,
    title: freelancerData.title || '',
    bio: freelancerData.bio || undefined,
    skills: freelancerData.skills || [],
    categories: freelancerData.categories || [],
    experienceYears: freelancerData.experience_years || undefined,
    hourlyRate: freelancerData.hourly_rate ? Number(freelancerData.hourly_rate) : undefined,
    fixedRateMin: freelancerData.fixed_rate_min
      ? Number(freelancerData.fixed_rate_min)
      : undefined,
    fixedRateMax: freelancerData.fixed_rate_max
      ? Number(freelancerData.fixed_rate_max)
      : undefined,
    availability: freelancerData.availability || 'available',
    languages: freelancerData.languages || [],
    links: freelancerData.links || {},
    stats: {
      completedProjects: freelancerData.completed_projects || 0,
      totalEarnings: Number(freelancerData.total_earnings) || 0,
      averageProjectPrice: Number(freelancerData.avg_project_price) || 0,
      rating: Number(freelancerData.rating) || 0,
      reviewCount: freelancerData.review_count || 0,
      successRate: Number(freelancerData.success_rate) || 0,
      averageResponseTime: freelancerData.avg_response_time || 0,
    },
  };
}

/**
 * Получить профиль заказчика.
 */
export async function getClientProfile(
  userId: string
): Promise<IClientProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: clientData } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profileData || !clientData) return null;

  const base = mapProfile(profileData);

  return {
    ...base,
    companyName: clientData.company_name || undefined,
    description: clientData.description || undefined,
    website: clientData.website || undefined,
    stats: {
      publishedProjects: clientData.published_projects || 0,
      completedProjects: clientData.completed_projects || 0,
      totalSpent: Number(clientData.total_spent) || 0,
      averageRating: Number(clientData.avg_rating) || 0,
      reviewCount: clientData.review_count || 0,
    },
  };
}

/**
 * Обновить базовый профиль.
 */
export async function updateProfile(data: {
  name?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  timezone?: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      avatar_url: data.avatarUrl,
      country: data.country,
      city: data.city,
      timezone: data.timezone,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  return { error: null };
}

/**
 * Обновить профиль исполнителя.
 */
export async function updateFreelancerProfile(data: {
  title?: string;
  bio?: string;
  skills?: string[];
  categories?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  availability?: string;
  languages?: Array<{ language: string; level: string }>;
  links?: Record<string, string>;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('freelancer_profiles')
    .update({
      title: data.title,
      bio: data.bio,
      skills: data.skills,
      categories: data.categories,
      experience_years: data.experienceYears,
      hourly_rate: data.hourlyRate,
      availability: data.availability,
      languages: data.languages,
      links: data.links,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  return { error: null };
}

/**
 * Обновить профиль заказчика.
 */
export async function updateClientProfile(data: {
  companyName?: string;
  description?: string;
  website?: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('client_profiles')
    .update({
      company_name: data.companyName,
      description: data.description,
      website: data.website,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  return { error: null };
}

/**
 * Загрузить аватар в Supabase Storage и обновить профиль.
 */
export async function uploadAvatar(formData: FormData): Promise<{
  url: string | null;
  error: string | null;
}> {
  const supabase = await createClient();
  if (!supabase) return { url: null, error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { url: null, error: 'Не авторизован' };

  const file = formData.get('avatar') as File;
  if (!file) return { url: null, error: 'Файл не выбран' };

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE_BYTES) {
    return { url: null, error: 'Файл слишком большой (макс. 5 МБ)' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Формат не поддерживается. Используйте JPG, PNG, WebP или GIF.' };
  }

  const extension = file.name.split('.').pop();
  const filePath = `avatars/${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('user-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from('user-files')
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  return { url: avatarUrl, error: null };
}
