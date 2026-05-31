'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/constants';

const NO_SUPABASE_ERROR = 'Supabase не настроен. Добавьте переменные в .env.local';

/**
 * Хук для управления аутентификацией на клиенте.
 */
export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const supabase = createClient();
      if (!supabase) return { error: NO_SUPABASE_ERROR };

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: mapAuthError(error.message) };

      router.push(ROUTES.DASHBOARD);
      router.refresh();
      return { error: null };
    },
    [router]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { name: string; role: string }
    ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
      const supabase = createClient();
      if (!supabase) return { error: NO_SUPABASE_ERROR, needsConfirmation: false };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { error: mapAuthError(error.message), needsConfirmation: false };

      const needsConfirmation = !data.session;
      if (data.session) {
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      }

      return { error: null, needsConfirmation };
    },
    [router]
  );

  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'github'): Promise<{ error: string | null }> => {
      const supabase = createClient();
      if (!supabase) return { error: NO_SUPABASE_ERROR };

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) return { error: mapAuthError(error.message) };
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push(ROUTES.HOME);
    router.refresh();
  }, [router]);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const supabase = createClient();
      if (!supabase) return { error: NO_SUPABASE_ERROR };

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) return { error: mapAuthError(error.message) };
      return { error: null };
    },
    []
  );

  return { user, isAuthenticated, isLoading, signIn, signUp, signOut, signInWithOAuth, resetPassword };
};

function mapAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Неверный email или пароль',
    'Email not confirmed': 'Email не подтверждён. Проверьте почту.',
    'User already registered': 'Пользователь с таким email уже зарегистрирован',
    'Password should be at least 6 characters': 'Пароль должен быть минимум 6 символов',
    'Email rate limit exceeded': 'Слишком много запросов. Попробуйте позже.',
  };
  return errorMap[message] || 'Произошла ошибка. Попробуйте позже.';
}
