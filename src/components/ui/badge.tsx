import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  /** Содержимое бейджа */
  children: React.ReactNode;
  /** Визуальный стиль */
  variant?: BadgeVariant;
  /** Размер */
  size?: BadgeSize;
  /** Дополнительные классы */
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  outline: 'border border-gray-300 text-gray-700 bg-white',
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

/**
 * Компонент бейджа (тег, статус, метка).
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
    >
      {children}
    </span>
  );
};
