'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Текст лейбла */
  label?: string;
  /** Текст ошибки */
  error?: string;
  /** Подсказка */
  hint?: string;
  /** Счетчик символов */
  maxLength?: number;
  /** Текущее значение для счетчика */
  currentLength?: number;
}

/**
 * Компонент многострочного текстового поля.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxLength, currentLength, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm',
            'placeholder:text-gray-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'resize-y min-h-[100px]',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}
            {hint && !error && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </div>
          {maxLength && currentLength !== undefined && (
            <p className={cn(
              'text-sm',
              currentLength > maxLength ? 'text-red-600' : 'text-gray-400'
            )}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
