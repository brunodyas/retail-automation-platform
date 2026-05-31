/** Тип отзыва (от кого) */
export type ReviewAuthorRole = 'client' | 'freelancer';

/** Критерии оценки */
export interface IReviewCategories {
  quality?: number;
  communication?: number;
  deadlines?: number;
  professionalism?: number;
}

/** Отзыв */
export interface IReview {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  targetUserId: string;
  rating: number;
  comment: string;
  categories: IReviewCategories;
  createdAt: string;
}

/** Бейдж пользователя */
export interface IBadge {
  id: string;
  type: 'top_performer' | 'reliable_client' | 'pro' | 'veteran' | 'rising_star';
  label: string;
  icon: string;
  earnedAt: string;
}
