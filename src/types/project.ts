/** Статус проекта (жизненный цикл) */
export type ProjectStatus =
  | 'draft'
  | 'open'
  | 'performer_selected'
  | 'in_progress'
  | 'under_review'
  | 'revision'
  | 'completed'
  | 'cancelled'
  | 'disputed';

/** Тип оплаты */
export type BudgetType = 'fixed' | 'hourly';

/** Уровень исполнителя */
export type ExperienceLevel = 'junior' | 'middle' | 'senior' | 'any';

/** Тип видимости проекта */
export type ProjectVisibility = 'public' | 'invite_only' | 'pro_only';

/** Проект (заказ) */
export interface IProject {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  skills: string[];
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax?: number;
  estimatedHours?: number;
  deadline?: string;
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  hasNda: boolean;
  selectedFreelancerId?: string;
  proposalCount: number;
  viewCount: number;
  milestones: IMilestone[];
  attachments: IAttachment[];
  createdAt: string;
  updatedAt: string;
}

/** Этап проекта (milestone) */
export interface IMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  order: number;
}

/** Вложение/файл проекта */
export interface IAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

/** Карточка проекта для списка (сокращенная версия) */
export interface IProjectCard {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  skills: string[];
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax?: number;
  status: ProjectStatus;
  proposalCount: number;
  clientName: string;
  clientAvatarUrl?: string;
  clientRating: number;
  createdAt: string;
}
