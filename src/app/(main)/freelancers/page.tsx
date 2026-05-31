import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FreelancerCardSkeleton } from '@/components/ui';
import { getFreelancers } from '@/api/freelancers';
import { FreelancersContent } from './freelancers-content';

export const metadata: Metadata = {
  title: 'Каталог исполнителей',
  description: 'Найдите лучших IT-фрилансеров: разработчики, дизайнеры, маркетологи и другие специалисты.',
};

interface FreelancersPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    rateMin?: string;
    rateMax?: string;
    ratingMin?: string;
    availability?: string;
    sortBy?: string;
    page?: string;
  }>;
}

/**
 * Каталог исполнителей (Server Component).
 */
export default async function FreelancersPage({ searchParams }: FreelancersPageProps) {
  const params = await searchParams;

  const result = await getFreelancers({
    query: params.query,
    category: params.category,
    rateMin: params.rateMin ? Number(params.rateMin) : undefined,
    rateMax: params.rateMax ? Number(params.rateMax) : undefined,
    ratingMin: params.ratingMin ? Number(params.ratingMin) : undefined,
    availability: params.availability,
    sortBy: (params.sortBy as 'rating' | 'price_asc' | 'price_desc' | 'projects') || 'rating',
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <FreelancerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <FreelancersContent
        initialFreelancers={result.data}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        filters={params}
      />
    </Suspense>
  );
}
