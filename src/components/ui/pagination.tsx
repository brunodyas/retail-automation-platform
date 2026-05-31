'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

/**
 * Компонент пагинации.
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPages = (): (number | '...')[] => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('...');

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('...');

    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Пагинация">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage <= 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        aria-label="Предыдущая страница"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-1 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage >= totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        aria-label="Следующая страница"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};
