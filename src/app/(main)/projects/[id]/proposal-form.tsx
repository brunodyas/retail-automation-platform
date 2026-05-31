'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Textarea, Card, CardTitle } from '@/components/ui';
import { proposalSchema, type ProposalFormData } from '@/utils/validation';
import { LIMITS } from '@/constants';
import { submitProposal } from '@/api/proposals';
import { useAuthStore } from '@/stores/auth-store';

interface ProposalFormProps {
  projectId: string;
}

/**
 * Форма подачи заявки на проект.
 */
export const ProposalForm = ({ projectId }: ProposalFormProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
  });

  const coverLetter = watch('coverLetter') || '';

  const onSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { error } = await submitProposal({
        projectId,
        coverLetter: data.coverLetter,
        proposedPrice: data.proposedPrice,
        estimatedDays: data.estimatedDays,
      });

      if (error) {
        setFormError(error);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setFormError('Произошла ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Не авторизован
  if (!isAuthenticated) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <div className="text-center py-4">
          <p className="text-gray-600 mb-2">Войдите в аккаунт, чтобы подать заявку</p>
          <a href="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Войти
          </a>
        </div>
      </Card>
    );
  }

  // Заказчик не может подавать заявки
  if (user?.role === 'client') {
    return null;
  }

  // Заявка уже подана
  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
          <div>
            <p className="font-medium text-green-800">Заявка отправлена!</p>
            <p className="text-sm text-green-700 mt-1">
              Заказчик рассмотрит вашу заявку и свяжется с вами.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Подать заявку</CardTitle>

      {formError && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
        <Textarea
          label="Сопроводительное письмо"
          placeholder="Расскажите, почему вы подходите для этого проекта. Опишите ваш опыт и подход..."
          maxLength={LIMITS.MAX_COVER_LETTER_LENGTH}
          currentLength={coverLetter.length}
          error={errors.coverLetter?.message}
          {...register('coverLetter')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ваша цена ($)"
            type="number"
            placeholder="1000"
            error={errors.proposedPrice?.message}
            {...register('proposedPrice', { valueAsNumber: true })}
          />
          <Input
            label="Срок (дней)"
            type="number"
            placeholder="14"
            error={errors.estimatedDays?.message}
            {...register('estimatedDays', { valueAsNumber: true })}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          leftIcon={<Send className="h-4 w-4" />}
          size="lg"
        >
          Отправить заявку
        </Button>
      </form>
    </Card>
  );
};
