/** Статус спора */
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

/** Решение по спору */
export type DisputeResolution =
  | 'pay_freelancer'   // Полная выплата исполнителю
  | 'refund_client'    // Полный возврат заказчику
  | 'split'            // Разделение суммы
  | 'require_revision' // Требуется доработка
  | 'none';            // Нет решения (пока)

/** Спор */
export interface IDispute {
  id: string;
  projectId: string;
  milestoneId?: string;
  openedByUserId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution: DisputeResolution;
  resolvedByModeratorId?: string;
  moderatorComment?: string;
  attachments: IDisputeAttachment[];
  messages: IDisputeMessage[];
  createdAt: string;
  resolvedAt?: string;
}

/** Вложение к спору */
export interface IDisputeAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedByUserId: string;
  uploadedAt: string;
}

/** Сообщение в споре */
export interface IDisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  text: string;
  isModeratorMessage: boolean;
  createdAt: string;
}
