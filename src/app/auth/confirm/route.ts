import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Email confirmation route.
 * Supabase шлёт ссылку вида /auth/confirm?token_hash=xxx&type=email
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'email' | 'recovery' | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type === 'email' ? 'email' : 'recovery',
    });

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
