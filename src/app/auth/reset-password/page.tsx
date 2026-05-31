'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { passwordSchema } from '@/utils/validation';
import { ROUTES } from '@/constants';
import { createClient } from '@/lib/supabase/client';

const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type ResetFormData = z.infer<typeof resetSchema>;

/**
 * Страница установки нового пароля (после перехода по ссылке из email).
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const supabase = createClient();
      if (!supabase) {
        setFormError('Supabase не настроен');
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setFormError(error.message);
      } else {
        setIsSuccess(true);
        setTimeout(() => router.push(ROUTES.DASHBOARD), 2000);
      }
    } catch {
      setFormError('Произошла непредвиденная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Пароль обновлён</h1>
          <p className="text-gray-500">Перенаправляем в личный кабинет...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full mb-4">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Новый пароль</h1>
          <p className="mt-2 text-sm text-gray-500">Придумайте надёжный пароль для аккаунта</p>
        </div>

        {formError && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Новый пароль"
            type={showPassword ? 'text' : 'password'}
            placeholder="Минимум 8 символов"
            hint="Заглавная буква, строчная буква и цифра"
            error={errors.password?.message}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={showPassword ? 'Скрыть' : 'Показать'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
          />

          <Input
            label="Подтвердите пароль"
            type="password"
            placeholder="Повторите пароль"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            Установить пароль
          </Button>
        </form>
      </div>
    </div>
  );
}
