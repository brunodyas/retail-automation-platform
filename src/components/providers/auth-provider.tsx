'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { IUser } from '@/types';

/**
 * Провайдер аутентификации.
 * Graceful fallback: без Supabase просто показывает анонимный UI.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setUser(null);
      return;
    }

    /** Загрузить профиль пользователя из БД */
    const fetchProfile = async (userId: string, email: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data) {
          const user: IUser = {
            id: data.id,
            email: data.email || email,
            name: data.name,
            avatarUrl: data.avatar_url || undefined,
            role: data.role,
            isVerified: data.is_verified,
            verificationStatus: data.verification_status,
            country: data.country || undefined,
            city: data.city || undefined,
            timezone: data.timezone || undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            lastActiveAt: data.last_active_at || undefined,
          };
          setUser(user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    /** Начальная загрузка сессии */
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
    };

    initSession();

    /** Подписка на изменения auth-состояния */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id, session.user.email || '');
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.refresh();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await fetchProfile(session.user.id, session.user.email || '');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, router]);

  return <>{children}</>;
};
