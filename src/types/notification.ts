/** Тип уведомления */
export type NotificationType =
  | 'new_proposal'
  | 'project_invitation'
  | 'new_message'
  | 'status_change'
  | 'payment_received'
  | 'payment_error'
  | 'review_received'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'system';

/** Канал доставки */
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

/** Уведомление */
export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
  createdAt: string;
  readAt?: string;
}

/** Настройки уведомлений пользователя */
export interface INotificationSettings {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailFrequency: 'instant' | 'hourly' | 'daily';
  mutedTypes: NotificationType[];
}
