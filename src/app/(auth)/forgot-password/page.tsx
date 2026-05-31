'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { emailSchema } from '@/utils/validation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

const forgotPasswordSchema = z.object({ email: emailSchema });
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Страница восстановления пароля.
 * Отправляет ссылку сброса через Supabase.
 */
export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { resetPassword } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        setFormError(error);
      } else {
        setIsEmailSent(true);
      }
    } catch {
      setFormError('Произошла непредвиденная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Письмо отправлено</h1>
        <p className="text-gray-500 mb-8">
          Мы отправили ссылку для сброса пароля на ваш email. Проверьте почту, включая папку «Спам».
        </p>
        <Link href={ROUTES.LOGIN}>
          <Button variant="outline" fullWidth>Вернуться ко входу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <Link href={ROUTES.LOGIN} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Назад ко входу
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Восстановление пароля</h1>
        <p className="mt-2 text-sm text-gray-500">Введите email, и мы отправим ссылку для сброса пароля</p>
      </div>

      {formError && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Email" type="email" placeholder="your@email.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">Отправить ссылку</Button>
      </form>
    </div>
  );
}
