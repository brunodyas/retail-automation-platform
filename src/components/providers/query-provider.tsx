'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const STALE_TIME_MS = 60_000; // 1 минута
const GC_TIME_MS = 300_000; // 5 минут

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Провайдер React Query с настроенным клиентом.
 * Оборачивает приложение для кэширования API-запросов.
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            gcTime: GC_TIME_MS,
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
