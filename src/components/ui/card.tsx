import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Кликабельная карточка */
  hoverable?: boolean;
  /** Без внутренних отступов */
  noPadding?: boolean;
}

/**
 * Базовая карточка-контейнер.
 */
export const Card = ({
  children,
  className,
  hoverable = false,
  noPadding = false,
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        !noPadding && 'p-6',
        hoverable && 'transition-shadow duration-200 hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/** Заголовок карточки */
export const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}

/** Заголовок внутри CardHeader */
export const CardTitle = ({ children, className, as: Tag = 'h3' }: CardTitleProps) => {
  return (
    <Tag className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </Tag>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/** Контент карточки */
export const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={cn('text-gray-600', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/** Футер карточки */
export const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
};
