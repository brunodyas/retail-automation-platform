'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Briefcase } from 'lucide-react';
import { Input, Select, Button, Pagination } from '@/components/ui';
import { ProjectCard } from '@/components/cards/project-card';
import { CATEGORIES } from '@/constants/categories';
import { EXPERIENCE_LEVELS } from '@/constants';
import type { IProjectCard } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новые' },
  { value: 'budget_desc', label: 'Бюджет ↓' },
  { value: 'budget_asc', label: 'Бюджет ↑' },
  { value: 'popular', label: 'Популярные' },
] as const;

interface ProjectsContentProps {
  initialProjects: IProjectCard[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: Record<string, string | undefined>;
}

/**
 * Клиентская часть каталога проектов с фильтрами.
 */
export const ProjectsContent = ({
  initialProjects,
  total,
  currentPage,
  totalPages,
  filters,
}: ProjectsContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || '');

  /** Обновить URL с параметрами фильтров */
  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // При изменении фильтров сбрасываем страницу
      if (!('page' in updates)) {
        params.delete('page');
      }

      router.push(`/projects?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = () => {
    updateFilters({ query: searchQuery || undefined });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    router.push('/projects');
  };

  const hasActiveFilters = !!(
    filters.query || filters.category || filters.budgetMin ||
    filters.budgetMax || filters.experienceLevel
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Проекты</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0 ? `Найдено ${total} проектов` : 'Проектов пока нет'}
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

      {/* Поиск + сортировка */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Input
            placeholder="Поиск проектов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button onClick={handleSearch}>Найти</Button>
        <Select
          options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
          value={filters.sortBy || 'newest'}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
        />
      </div>

      {/* Фильтры */}
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
              label="Уровень"
              options={[
                { value: '', label: 'Любой уровень' },
                ...Object.entries(EXPERIENCE_LEVELS).map(([value, label]) => ({ value, label })),
              ]}
              value={filters.experienceLevel || ''}
              onChange={(e) => updateFilters({ experienceLevel: e.target.value || undefined })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Бюджет от"
                type="number"
                placeholder="$"
                value={filters.budgetMin || ''}
                onChange={(e) => updateFilters({ budgetMin: e.target.value || undefined })}
              />
              <Input
                label="Бюджет до"
                type="number"
                placeholder="$"
                value={filters.budgetMax || ''}
                onChange={(e) => updateFilters({ budgetMax: e.target.value || undefined })}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {/* Список проектов */}
      {initialProjects.length > 0 ? (
        <div className="space-y-4">
          {initialProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Проектов не найдено</h3>
          <p className="text-gray-500">
            Попробуйте изменить параметры поиска или сбросить фильтры.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}

      {/* Пагинация */}
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
