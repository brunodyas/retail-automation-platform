'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { IMessage } from '@/types/message';

/**
 * Хук для Realtime-подписки на новые сообщения в чате.
 */
export const useRealtimeMessages = (chatId: string | null) => {
  const [newMessages, setNewMessages] = useState<IMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const clearNewMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const message: IMessage = {
            id: row.id as string,
            chatId: row.chat_id as string,
            senderId: row.sender_id as string,
            senderName: '',
            content: row.content as string,
            isRead: row.is_read as boolean,
            attachments: [],
            createdAt: row.created_at as string,
          };
          setNewMessages((prev) => [...prev, message]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [chatId]);

  return { newMessages, isConnected, clearNewMessages };
};
