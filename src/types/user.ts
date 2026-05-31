/** Роль пользователя на платформе */
export type UserRole = 'freelancer' | 'client' | 'both' | 'admin' | 'moderator';

/** Статус доступности исполнителя */
export type AvailabilityStatus = 'available' | 'partially_busy' | 'not_available';

/** Уровень владения языком */
export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'native';

/** Статус верификации */
export type VerificationStatus = 'none' | 'email' | 'phone' | 'kyc' | 'full';

/** Знание языка */
export interface ILanguageSkill {
  language: string;
  level: LanguageLevel;
}

/** Внешние ссылки профиля */
export interface IProfileLinks {
  website?: string;
  github?: string;
  dribbble?: string;
  behance?: string;
  linkedin?: string;
}

/** Базовый профиль пользователя */
export interface IUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  country?: string;
  city?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

/** Профиль исполнителя */
export interface IFreelancerProfile extends IUser {
  title: string;
  bio?: string;
  skills: string[];
  categories: string[];
  experienceYears?: number;
  hourlyRate?: number;
  fixedRateMin?: number;
  fixedRateMax?: number;
  availability: AvailabilityStatus;
  languages: ILanguageSkill[];
  links: IProfileLinks;
  stats: IFreelancerStats;
}

/** Статистика исполнителя */
export interface IFreelancerStats {
  completedProjects: number;
  totalEarnings: number;
  averageProjectPrice: number;
  rating: number;
  reviewCount: number;
  successRate: number;
  averageResponseTime: number; // в минутах
}

/** Профиль заказчика */
export interface IClientProfile extends IUser {
  companyName?: string;
  description?: string;
  website?: string;
  stats: IClientStats;
}

/** Статистика заказчика */
export interface IClientStats {
  publishedProjects: number;
  completedProjects: number;
  totalSpent: number;
  averageRating: number;
  reviewCount: number;
}

/** Элемент портфолио */
export interface IPortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
  linkUrl?: string;
  platformProjectId?: string; // Связь с проектом на VibeCoding Freelance
  createdAt: string;
}
