import { create } from 'zustand';
import type { IUser } from '@/types';

interface AuthState {
  /** Текущий пользователь */
  user: IUser | null;
  /** Загружается ли сессия */
  isLoading: boolean;
  /** Авторизован ли пользователь */
  isAuthenticated: boolean;
}

interface AuthActions {
  /** Установить пользователя */
  setUser: (user: IUser | null) => void;
  /** Установить состояние загрузки */
  setLoading: (loading: boolean) => void;
  /** Выйти из аккаунта (очистить состояние) */
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
