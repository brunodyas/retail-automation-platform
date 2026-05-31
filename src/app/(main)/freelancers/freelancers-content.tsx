'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Users } from 'lucide-react';
import { Input, Select, Button, Pagination } from '@/components/ui';
import { FreelancerCard } from '@/components/cards/freelancer-card';
import { CATEGORIES } from '@/constants/categories';

const SORT_OPTIONS = [
  { value: 'rating', label: 'По рейтингу' },
  { value: 'price_asc', label: 'Ставка ↑' },
  { value: 'price_desc', label: 'Ставка ↓' },
  { value: 'projects', label: 'По проектам' },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Любая' },
  { value: 'available', label: 'Доступен' },
  { value: 'partially_busy', label: 'Частично занят' },
] as const;

interface FreelancerItem {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  skills: string[];
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  availability: string;
  country?: string;
  city?: string;
}

interface FreelancersContentProps {
  initialFreelancers: FreelancerItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: Record<string, string | undefined>;
}

/**
 * Клиентская часть каталога фрилансеров.
 */
export const FreelancersContent = ({
  initialFreelancers,
  total,
  currentPage,
  totalPages,
  filters,
}: FreelancersContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || '');

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!('page' in updates)) params.delete('page');
      router.push(`/freelancers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = () => updateFilters({ query: searchQuery || undefined });

  const handleClearFilters = () => {
    setSearchQuery('');
    router.push('/freelancers');
  };

  const hasActiveFilters = !!(
    filters.query || filters.category || filters.rateMin ||
    filters.rateMax || filters.ratingMin || filters.availability
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Исполнители</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0 ? `Найдено ${total} специалистов` : 'Специалистов пока нет'}
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Фильтры
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Поиск по специализации..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button onClick={handleSearch}>Найти</Button>
        <Select
          options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
          value={filters.sortBy || 'rating'}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
        />
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Категория"
              options={[
                { value: '', label: 'Все категории' },
                ...CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
              ]}
              value={filters.category || ''}
              onChange={(e) => updateFilters({ category: e.target.value || undefined })}
            />
            <Select
              label="Доступность"
              options={AVAILABILITY_OPTIONS.map(({ value, label }) => ({ value, label }))}
              value={filters.availability || ''}
              onChange={(e) => updateFilters({ availability: e.target.value || undefined })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Ставка от"
                type="number"
                placeholder="$/час"
                value={filters.rateMin || ''}
                onChange={(e) => updateFilters({ rateMin: e.target.value || undefined })}
              />
              <Input
                label="Ставка до"
                type="number"
                placeholder="$/час"
                value={filters.rateMax || ''}
                onChange={(e) => updateFilters({ rateMax: e.target.value || undefined })}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <X className="h-3.5 w-3.5" />
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {initialFreelancers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialFreelancers.map((freelancer) => (
            <FreelancerCard
              key={freelancer.id}
              freelancer={{
                id: freelancer.id,
                name: freelancer.name,
                avatarUrl: freelancer.avatarUrl,
                title: freelancer.title,
                skills: freelancer.skills,
                hourlyRate: freelancer.hourlyRate,
                rating: freelancer.rating,
                reviewCount: freelancer.reviewCount,
                completedProjects: freelancer.completedProjects,
                isOnline: freelancer.availability === 'available',
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Специалистов не найдено</h3>
          <p className="text-gray-500">Попробуйте изменить параметры поиска.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateFilters({ page: String(page) })}
          />
        </div>
      )}
    </div>
  );
};
