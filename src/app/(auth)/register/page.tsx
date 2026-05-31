'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, User, Users, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/use-auth';

const ROLE_OPTIONS = [
  { value: 'freelancer' as const, label: 'Исполнитель', icon: User },
  { value: 'client' as const, label: 'Заказчик', icon: Briefcase },
  { value: 'both' as const, label: 'Оба варианта', icon: Users },
] as const;

/**
 * Страница регистрации с валидацией, выбором роли и OAuth.
 */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const { signUp, signInWithOAuth } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'freelancer',
      agreeToTerms: undefined as unknown as true,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { error, needsConfirmation } = await signUp(
        data.email,
        data.password,
        { name: data.name, role: data.role }
      );
      if (error) {
        setFormError(error);
      } else if (needsConfirmation) {
        setEmailSent(true);
      }
    } catch {
      setFormError('Произошла непредвиденная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setFormError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) setFormError(error);
  };

  // Успешная регистрация — нужно подтвердить email
  if (emailSent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Проверьте почту</h1>
        <p className="text-gray-500 mb-8">
          Мы отправили письмо для подтверждения аккаунта. Перейдите по ссылке в письме, чтобы
          завершить регистрацию. Проверьте папку «Спам».
        </p>
        <Link href={ROUTES.LOGIN}>
          <Button variant="outline" fullWidth>Перейти ко входу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Создать аккаунт</h1>
        <p className="mt-2 text-sm text-gray-500">Присоединяйтесь к VibeCoding Freelance бесплатно</p>
      </div>

      {formError && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Выбор роли */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Я хочу быть</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value, { shouldValidate: true })}
                className={cn(
                  'flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center',
                  selectedRole === value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-1', selectedRole === value ? 'text-indigo-600' : 'text-gray-400')} />
                <span className={cn('text-xs font-medium', selectedRole === value ? 'text-indigo-700' : 'text-gray-700')}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
        </div>

        <Input label="Имя" type="text" placeholder="Иван Иванов" leftIcon={<User className="h-4 w-4" />} error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="your@email.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />

        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="Минимум 8 символов"
          error={errors.password?.message}
          hint="Заглавная буква, строчная буква и цифра"
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={showPassword ? 'Скрыть' : 'Показать'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <Input label="Подтвердите пароль" type="password" placeholder="Повторите пароль" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" {...register('agreeToTerms')} />
            <span className="text-sm text-gray-600">
              Я принимаю{' '}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 underline" target="_blank">условия использования</Link>{' '}
              и <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline" target="_blank">политику конфиденциальности</Link>
            </span>
          </label>
          {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>}
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">Зарегистрироваться</Button>
      </form>

      {/* OAuth */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Или продолжить через</span></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Google</button>
          <button type="button" onClick={() => handleOAuth('github')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-800 transition-colors">GitHub</button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Уже есть аккаунт?{' '}
        <Link href={ROUTES.LOGIN} className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Войти</Link>
      </p>
    </div>
  );
}
