'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';

const NOT_CONFIGURED = 'Supabase не настроен';

/** Результат auth-операции */
interface AuthResult {
  error: string | null;
}

/**
 * Регистрация нового пользователя через email + пароль.
 * Создаёт пользователя в Supabase Auth, профиль создаётся автоматически триггером БД.
 */
export async function signUp(formData: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        role: formData.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

/**
 * Вход по email + пароль.
 */
export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

/**
 * Вход через OAuth-провайдер (Google/GitHub).
 * Возвращает URL для редиректа.
 */
export async function signInWithOAuth(provider: 'google' | 'github'): Promise<{
  url: string | null;
  error: string | null;
}> {
  const supabase = await createClient();
  if (!supabase) return { url: null, error: NOT_CONFIGURED };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { url: null, error: mapAuthError(error.message) };
  }

  return { url: data.url, error: null };
}

/**
 * Выход из системы.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (!supabase) { redirect(ROUTES.HOME); }
  await supabase.auth.signOut();
  redirect(ROUTES.HOME);
}

/**
 * Сброс пароля — отправка email со ссылкой.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

/**
 * Обновление пароля (после получения ссылки для сброса).
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

/**
 * Получить текущего пользователя на сервере.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Маппинг сообщений ошибок Supabase на русский.
 */
function mapAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Неверный email или пароль',
    'Email not confirmed': 'Email не подтверждён. Проверьте почту.',
    'User already registered': 'Пользователь с таким email уже зарегистрирован',
    'Password should be at least 6 characters': 'Пароль должен быть минимум 6 символов',
    'Email rate limit exceeded': 'Слишком много запросов. Попробуйте позже.',
    'For security purposes, you can only request this after 60 seconds':
      'Подождите 60 секунд перед повторным запросом',
    'Signups not allowed for this instance': 'Регистрация временно недоступна',
  };

  return errorMap[message] || 'Произошла ошибка. Попробуйте позже.';
}
