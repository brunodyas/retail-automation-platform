import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Матчим все пути кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico, sitemap.xml, robots.txt
     * - публичные файлы (images, icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons).*)',
  ],
};
