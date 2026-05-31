import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vibecoding.com';

/**
 * Генерирует sitemap.xml для SEO.
 * Обновляется при билде, содержит статические маршруты.
 * Динамические (проекты, профили) добавляются в Этапе 3.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/projects',
    '/freelancers',
    '/login',
    '/register',
  ];

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
