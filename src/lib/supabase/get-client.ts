import { createClient } from './server';

/**
 * Безопасный серверный клиент Supabase.
 * Выбрасывает исключение если Supabase не настроен
 * (перехватывается в try/catch API-функций).
 */
export async function getServerClient() {
  const client = await createClient();
  if (!client) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  return client;
}
