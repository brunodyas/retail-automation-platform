import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProjectCardSkeleton } from '@/components/ui';
import { getProjects } from '@/api/projects';
import { ProjectsContent } from './projects-content';

export const metadata: Metadata = {
  title: 'Каталог проектов',
  description: 'Найдите интересные IT-проекты для фриланса: веб-разработка, дизайн, мобильные приложения и другие заказы.',
};

interface ProjectsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    budgetMin?: string;
    budgetMax?: string;
    experienceLevel?: string;
    sortBy?: string;
    page?: string;
  }>;
}

/**
 * Каталог проектов (Server Component).
 * Загружает данные на сервере, передаёт клиентскому компоненту.
 */
export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;

  const result = await getProjects({
    query: params.query,
    category: params.category,
    budgetMin: params.budgetMin ? Number(params.budgetMin) : undefined,
    budgetMax: params.budgetMax ? Number(params.budgetMax) : undefined,
    experienceLevel: params.experienceLevel,
    sortBy: (params.sortBy as 'newest' | 'budget_desc' | 'budget_asc' | 'popular') || 'newest',
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProjectsContent
        initialProjects={result.data}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        filters={params}
      />
    </Suspense>
  );
}
