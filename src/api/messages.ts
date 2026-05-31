'use server';

import { createClient } from '@/lib/supabase/server';
import type { IChat, IMessage } from '@/types/message';
import { LIMITS } from '@/constants';

/** Результат с пагинацией */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Получить список чатов текущего пользователя.
 */
export async function getMyChats(): Promise<IChat[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Получаем чаты в которых участвует пользователь
  const { data: participantRows } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', user.id);

  if (!participantRows || participantRows.length === 0) return [];

  const chatIds = participantRows.map((r) => r.chat_id);

  const { data: chats } = await supabase
    .from('chats')
    .select(`
      *,
      chat_participants (
        user_id,
        profiles!chat_participants_user_id_fkey (name, avatar_url)
      ),
      messages (
        id, content, sender_id, created_at, is_read
      )
    `)
    .in('id', chatIds)
    .order('updated_at', { ascending: false });

  if (!chats) return [];

  return chats.map((chat: Record<string, unknown>) => {
    const participants = (chat.chat_participants as Array<Record<string, unknown>>) || [];
    const messages = (chat.messages as Array<Record<string, unknown>>) || [];

    // Другой участник чата
    const otherParticipant = participants.find(
      (p) => p.user_id !== user.id
    );
    const otherProfile = otherParticipant?.profiles as Record<string, unknown> | undefined;

    // Последнее сообщение
    const lastMsg = messages.length > 0
      ? messages.sort(
          (a, b) =>
            new Date(b.created_at as string).getTime() -
            new Date(a.created_at as string).getTime()
        )[0]
      : null;

    // Непрочитанные
    const unreadCount = messages.filter(
      (m) => m.sender_id !== user.id && !m.is_read
    ).length;

    return {
      id: chat.id as string,
      projectId: (chat.project_id as string) || undefined,
      participantName: (otherProfile?.name as string) || 'Пользователь',
      participantAvatarUrl: (otherProfile?.avatar_url as string) || undefined,
      participantId: (otherParticipant?.user_id as string) || '',
      lastMessage: lastMsg
        ? {
            content: lastMsg.content as string,
            senderId: lastMsg.sender_id as string,
            createdAt: lastMsg.created_at as string,
          }
        : undefined,
      unreadCount,
      updatedAt: chat.updated_at as string,
    };
  });
}

/**
 * Получить или создать чат между двумя пользователями.
 */
export async function getOrCreateChat(
  otherUserId: string,
  projectId?: string
): Promise<{ chatId: string | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { chatId: null, error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { chatId: null, error: 'Не авторизован' };

  // Поиск существующего чата
  const { data: myChats } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', user.id);

  if (myChats && myChats.length > 0) {
    const chatIds = myChats.map((c) => c.chat_id);

    const { data: otherChats } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', otherUserId)
      .in('chat_id', chatIds);

    if (otherChats && otherChats.length > 0) {
      return { chatId: otherChats[0].chat_id, error: null };
    }
  }

  // Создаём новый чат
  const { data: newChat, error: chatError } = await supabase
    .from('chats')
    .insert({
      project_id: projectId || null,
    })
    .select('id')
    .single();

  if (chatError || !newChat) {
    return { chatId: null, error: chatError?.message || 'Ошибка создания чата' };
  }

  // Добавляем участников
  const { error: participantsError } = await supabase
    .from('chat_participants')
    .insert([
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: otherUserId },
    ]);

  if (participantsError) {
    return { chatId: null, error: participantsError.message };
  }

  return { chatId: newChat.id, error: null };
}

/**
 * Получить сообщения чата с пагинацией.
 */
export async function getChatMessages(
  chatId: string,
  page = 1
): Promise<PaginatedResult<IMessage>> {
  const supabase = await createClient();
  if (!supabase) return { data: [], total: 0, page, totalPages: 0 };
  const limit = LIMITS.MESSAGES_PER_PAGE;
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('messages')
    .select(`
      id, chat_id, sender_id, content, is_read, created_at,
      profiles!messages_sender_id_fkey (name, avatar_url)
    `, { count: 'exact' })
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { data: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const messages: IMessage[] = (data || []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      chatId: row.chat_id as string,
      senderId: row.sender_id as string,
      senderName: (profile?.name as string) || '',
      senderAvatarUrl: (profile?.avatar_url as string) || undefined,
      content: row.content as string,
      isRead: row.is_read as boolean,
      attachments: [],
      createdAt: row.created_at as string,
    };
  });

  // Возвращаем в хронологическом порядке
  messages.reverse();

  return { data: messages, total, page, totalPages };
}

/**
 * Отправить сообщение.
 */
export async function sendMessage(
  chatId: string,
  content: string
): Promise<{ message: IMessage | null; error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { message: null, error: 'Supabase не настроен' };
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { message: null, error: 'Не авторизован' };

  const trimmed = content.trim();
  if (!trimmed) return { message: null, error: 'Пустое сообщение' };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      content: trimmed,
    })
    .select('id, chat_id, sender_id, content, is_read, created_at')
    .single();

  if (error || !data) {
    return { message: null, error: error?.message || 'Ошибка отправки' };
  }

  // Обновить timestamp чата
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);

  return {
    message: {
      id: data.id,
      chatId: data.chat_id,
      senderId: data.sender_id,
      senderName: '',
      content: data.content,
      isRead: false,
      attachments: [],
      createdAt: data.created_at,
    },
    error: null,
  };
}

/**
 * Отметить сообщения как прочитанные.
 */
export async function markMessagesAsRead(chatId: string): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('chat_id', chatId)
    .neq('sender_id', user.id)
    .eq('is_read', false);
}
