import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Текст для скринридеров */
  label?: string;
}

const SIZE_STYLES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * Индикатор загрузки (спиннер).
 */
export const Spinner = ({
  size = 'md',
  className,
  label = 'Загрузка',
}: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center" role="status">
      <Loader2
        className={cn('animate-spin text-indigo-600', SIZE_STYLES[size], className)}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

/** Полноэкранный спиннер */
export const FullPageSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  );
};
