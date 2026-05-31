import Image from 'next/image';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  /** URL изображения */
  src?: string | null;
  /** Альтернативный текст */
  alt: string;
  /** Размер аватара */
  size?: AvatarSize;
  /** Показывать индикатор онлайн */
  isOnline?: boolean;
  /** Дополнительные классы */
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, { container: string; icon: string; pixels: number }> = {
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4', pixels: 32 },
  md: { container: 'h-10 w-10', icon: 'h-5 w-5', pixels: 40 },
  lg: { container: 'h-14 w-14', icon: 'h-7 w-7', pixels: 56 },
  xl: { container: 'h-20 w-20', icon: 'h-10 w-10', pixels: 80 },
};

const ONLINE_INDICATOR_SIZE: Record<AvatarSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
};

/**
 * Компонент аватара пользователя.
 * Отображает изображение или иконку-заглушку. Поддерживает индикатор онлайн.
 */
export const Avatar = ({
  src,
  alt,
  size = 'md',
  isOnline,
  className,
}: AvatarProps) => {
  const { container, icon, pixels } = SIZE_MAP[size];

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gray-100 flex items-center justify-center',
          container
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={pixels}
            height={pixels}
            className="object-cover w-full h-full"
          />
        ) : (
          <User className={cn('text-gray-400', icon)} />
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            ONLINE_INDICATOR_SIZE[size],
            isOnline ? 'bg-green-400' : 'bg-gray-300'
          )}
          aria-label={isOnline ? 'В сети' : 'Не в сети'}
        />
      )}
    </div>
  );
};
