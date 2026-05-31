import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback route.
 * Supabase редиректит сюда после OAuth/email-подтверждения.
 * Обменивает code на сессию и перенаправляет пользователя.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Если это recovery (сброс пароля) — перенаправить на страницу смены пароля
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Ошибка — перенаправить на логин с сообщением
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
