import { create } from 'zustand';

interface UIState {
  /** Открыто ли мобильное меню */
  isMobileMenuOpen: boolean;
  /** Открыта ли боковая панель */
  isSidebarOpen: boolean;
  /** Количество непрочитанных уведомлений */
  unreadNotificationsCount: number;
  /** Количество непрочитанных сообщений */
  unreadMessagesCount: number;
}

interface UIActions {
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSidebar: () => void;
  setUnreadNotifications: (count: number) => void;
  setUnreadMessages: (count: number) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isMobileMenuOpen: false,
  isSidebarOpen: true,
  unreadNotificationsCount: 0,
  unreadMessagesCount: 0,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setUnreadNotifications: (count) =>
    set({ unreadNotificationsCount: count }),

  setUnreadMessages: (count) =>
    set({ unreadMessagesCount: count }),
}));
