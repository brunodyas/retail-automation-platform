export type { 
  UserRole, 
  AvailabilityStatus, 
  LanguageLevel, 
  VerificationStatus,
  IUser, 
  IFreelancerProfile, 
  IClientProfile, 
  IFreelancerStats, 
  IClientStats,
  IPortfolioItem,
  ILanguageSkill,
  IProfileLinks,
} from './user';

export type { 
  ProjectStatus, 
  BudgetType, 
  ExperienceLevel, 
  ProjectVisibility,
  IProject, 
  IProjectCard, 
  IMilestone, 
  IAttachment,
} from './project';

export type { 
  ProposalStatus, 
  IProposal, 
  IProposalWithFreelancer, 
  IProposalAttachment,
} from './proposal';

export type { 
  MessageDeliveryStatus, 
  MessageAttachmentType,
  IChat, 
  IChatParticipant, 
  IMessage, 
  IMessageAttachment,
} from './message';

export type { 
  TransactionStatus, 
  TransactionType, 
  PaymentMethod,
  ITransaction, 
  IUserBalance, 
  ICommissionTier,
} from './payment';

export type { 
  ReviewAuthorRole,
  IReviewCategories,
  IReview, 
  IBadge,
} from './review';

export type { 
  NotificationType, 
  NotificationChannel,
  INotification, 
  INotificationSettings,
} from './notification';

export type {
  DisputeStatus,
  DisputeResolution,
  IDispute,
  IDisputeAttachment,
  IDisputeMessage,
} from './dispute';

/** Общий формат API-ответа */
export interface IApiResponse<T> {
  data: T | null;
  error: IApiError | null;
  message?: string;
}

/** Формат ошибки API */
export interface IApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Параметры пагинации */
export interface IPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Ответ с пагинацией */
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
