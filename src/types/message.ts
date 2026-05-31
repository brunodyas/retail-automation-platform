/** Статус доставки сообщения */
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read';

/** Тип вложения в сообщении */
export type MessageAttachmentType = 'image' | 'document' | 'archive' | 'other';

/** Чат — упрощённая карточка для списка */
export interface IChat {
  id: string;
  projectId?: string;
  participantName: string;
  participantAvatarUrl?: string;
  participantId: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

/** Участник чата */
export interface IChatParticipant {
  userId: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

/** Сообщение */
export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  isRead: boolean;
  attachments: IMessageAttachment[];
  createdAt: string;
  editedAt?: string;
}

/** Вложение сообщения */
export interface IMessageAttachment {
  id: string;
  type: MessageAttachmentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  thumbnailUrl?: string;
}
