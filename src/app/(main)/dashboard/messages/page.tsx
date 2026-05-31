'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { Avatar, Badge, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { getMyChats, getChatMessages, sendMessage, markMessagesAsRead } from '@/api/messages';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { formatRelativeDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { IChat, IMessage } from '@/types/message';

/**
 * Страница мессенджера (чат-система).
 * Список чатов слева, переписка справа.
 */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<IChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Realtime подписка
  const { newMessages, isConnected, clearNewMessages } = useRealtimeMessages(selectedChatId);

  /** Загрузить чаты */
  useEffect(() => {
    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        const data = await getMyChats();
        setChats(data);
      } catch {
        // Тихая ошибка — чаты пустые
      } finally {
        setIsLoadingChats(false);
      }
    };
    loadChats();
  }, []);

  /** Загрузить сообщения при выборе чата */
  useEffect(() => {
    if (!selectedChatId) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      clearNewMessages();
      try {
        const result = await getChatMessages(selectedChatId);
        setMessages(result.data);
        await markMessagesAsRead(selectedChatId);
      } catch {
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedChatId, clearNewMessages]);

  /** Добавить realtime-сообщения к списку */
  useEffect(() => {
    if (newMessages.length > 0) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = newMessages.filter((m) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [newMessages]);

  /** Прокрутить вниз при новых сообщениях */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Отправить сообщение */
  const handleSend = useCallback(async () => {
    if (!selectedChatId || !messageInput.trim() || isSending) return;

    setIsSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    try {
      const { error } = await sendMessage(selectedChatId, content);
      if (error) {
        setMessageInput(content); // Вернуть текст при ошибке
      }
    } catch {
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  }, [selectedChatId, messageInput, isSending]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Список чатов */}
      <div className={cn(
        'w-full sm:w-80 border-r border-gray-200 flex flex-col shrink-0',
        selectedChatId ? 'hidden sm:flex' : 'flex'
      )}>
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Сообщения</h2>
          {isConnected && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Онлайн
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Нет чатов</p>
              <p className="text-xs text-gray-400 mt-1">
                Начните общение, откликнувшись на проект
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left',
                  selectedChatId === chat.id && 'bg-indigo-50'
                )}
              >
                <Avatar
                  src={chat.participantAvatarUrl}
                  alt={chat.participantName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {chat.participantName}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatRelativeDate(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {chat.lastMessage.senderId === user?.id ? 'Вы: ' : ''}
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <Badge variant="danger" size="sm">{chat.unreadCount}</Badge>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Переписка */}
      <div className={cn(
        'flex-1 flex flex-col',
        !selectedChatId ? 'hidden sm:flex' : 'flex'
      )}>
        {selectedChatId && selectedChat ? (
          <>
            {/* Шапка чата */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setSelectedChatId(null)}
                className="sm:hidden p-1 text-gray-500 hover:text-gray-700"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                src={selectedChat.participantAvatarUrl}
                alt={selectedChat.participantName}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedChat.participantName}
                </p>
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-400">Начните переписку</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2.5',
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={cn(
                            'text-[10px] mt-1',
                            isOwn ? 'text-indigo-200' : 'text-gray-400'
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageInput.trim() || isSending}
                  isLoading={isSending}
                  leftIcon={<Send className="h-4 w-4" />}
                  aria-label="Отправить"
                >
                  <span className="sr-only">Отправить</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
