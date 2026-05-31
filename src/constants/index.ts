/** Название приложения */
export const APP_NAME = 'VibeCoding Freelance';

/** Описание для SEO */
export const APP_DESCRIPTION =
  'VibeCoding Freelance — онлайн-биржа фриланса для IT-специалистов, дизайнеров и digital-профессий с безопасными сделками через эскроу';

/** Лимиты */
export const LIMITS = {
  MAX_FILE_SIZE_MB: 25,
  MAX_AVATAR_SIZE_MB: 5,
  MAX_SKILLS_COUNT: 20,
  MAX_CATEGORIES_COUNT: 5,
  MAX_BIO_LENGTH: 1500,
  MAX_PROJECT_DESCRIPTION_LENGTH: 10000,
  MAX_COVER_LETTER_LENGTH: 3000,
  MAX_PORTFOLIO_ITEMS: 50,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,
  PROPOSALS_PER_PAGE: 20,
  PROJECTS_PER_PAGE: 20,
  FREELANCERS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
} as const;

/** Маршруты приложения */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}`,
  CREATE_PROJECT: '/projects/create',
  FREELANCERS: '/freelancers',
  FREELANCER_DETAIL: (id: string) => `/freelancers/${id}`,
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  DASHBOARD: '/dashboard',
  DASHBOARD_PROJECTS: '/dashboard/projects',
  DASHBOARD_PROPOSALS: '/dashboard/proposals',
  DASHBOARD_FINANCES: '/dashboard/finances',
  DASHBOARD_MESSAGES: '/dashboard/messages',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  ADMIN: '/admin',
} as const;

/** Прогрессивная шкала комиссий (в процентах) */
export const COMMISSION_TIERS = [
  { minAmount: 0, maxAmount: 5000, rate: 15 },
  { minAmount: 5000, maxAmount: 25000, rate: 10 },
  { minAmount: 25000, maxAmount: Infinity, rate: 5 },
] as const;

/** Поддерживаемые валюты */
export const SUPPORTED_CURRENCIES = ['BYN', 'USD', 'EUR', 'RUB'] as const;

/** Уровни опыта с лейблами */
export const EXPERIENCE_LEVELS = {
  junior: 'Junior (0-2 года)',
  middle: 'Middle (2-5 лет)',
  senior: 'Senior (5+ лет)',
  any: 'Любой уровень',
} as const;

/** Статусы проекта с лейблами */
export const PROJECT_STATUS_LABELS = {
  draft: 'Черновик',
  open: 'Открыт',
  performer_selected: 'Исполнитель выбран',
  in_progress: 'В работе',
  under_review: 'На проверке',
  revision: 'Доработка',
  completed: 'Завершен',
  cancelled: 'Отменен',
  disputed: 'В споре',
} as const;

/** Цвета статусов проекта */
export const PROJECT_STATUS_COLORS = {
  draft: 'gray',
  open: 'green',
  performer_selected: 'blue',
  in_progress: 'indigo',
  under_review: 'yellow',
  revision: 'orange',
  completed: 'emerald',
  cancelled: 'red',
  disputed: 'rose',
} as const;
