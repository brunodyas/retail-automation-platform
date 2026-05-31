'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus, X, Save, AlertCircle, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import {
  Button, Input, Textarea, Select, Badge, Card, CardTitle,
} from '@/components/ui';
import { createProjectSchema, type CreateProjectFormData } from '@/utils/validation';
import { ROUTES, LIMITS, EXPERIENCE_LEVELS } from '@/constants';
import { CATEGORIES } from '@/constants/categories';
import { POPULAR_SKILLS } from '@/constants/skills';
import { createProject } from '@/api/projects';

const BUDGET_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Фиксированная цена' },
  { value: 'hourly', label: 'Почасовая оплата' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Публичный' },
  { value: 'invite_only', label: 'Только по приглашению' },
] as const;

/**
 * Страница создания нового проекта.
 * Форма с валидацией, отправляет данные через server action.
 */
export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      budgetType: 'fixed',
      experienceLevel: 'any',
      skills: [],
    },
  });

  const budgetType = watch('budgetType');
  const descValue = watch('description') || '';

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed) && selectedSkills.length < LIMITS.MAX_SKILLS_COUNT) {
      const updated = [...selectedSkills, trimmed];
      setSelectedSkills(updated);
      setValue('skills', updated, { shouldValidate: true });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    const updated = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updated);
    setValue('skills', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { id, error } = await createProject({
        title: data.title,
        category: data.category,
        description: data.description,
        skills: data.skills,
        budgetType: data.budgetType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        deadline: data.deadline,
        experienceLevel: data.experienceLevel || 'any',
        visibility: data.visibility,
        hasNda: data.hasNda,
      });

      if (error) {
        setFormError(error);
      } else if (id) {
        router.push(`/projects/${id}`);
      }
    } catch {
      setFormError('Произошла ошибка при создании проекта');
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedSkills = POPULAR_SKILLS
    .filter((s) => !selectedSkills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href={ROUTES.PROJECTS} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        К каталогу проектов
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Создать проект</h1>
      <p className="text-gray-500 mb-8">Опишите задачу, чтобы получить предложения от специалистов</p>

      {formError && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Основная информация */}
        <Card>
          <CardTitle>Основная информация</CardTitle>
          <div className="mt-4 space-y-5">
            <Input
              label="Название проекта"
              placeholder="Например: Разработка интернет-магазина на Next.js"
              error={errors.title?.message}
              {...register('title')}
            />

            <Select
              label="Категория"
              options={[
                { value: '', label: 'Выберите категорию' },
                ...CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
              ]}
              error={errors.category?.message}
              {...register('category')}
            />

            <Textarea
              label="Описание задачи"
              placeholder="Подробно опишите задачу, требования, ожидаемый результат..."
              maxLength={LIMITS.MAX_PROJECT_DESCRIPTION_LENGTH}
              currentLength={descValue.length}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </Card>

        {/* Навыки */}
        <Card>
          <CardTitle>Необходимые навыки</CardTitle>
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Введите навык и нажмите Enter..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
              error={errors.skills?.message}
              hint={`${selectedSkills.length}/${LIMITS.MAX_SKILLS_COUNT}`}
            />

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="info" size="md">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-600" aria-label={`Удалить ${skill}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {skillInput && suggestedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestedSkills.map((skill) => (
                  <button key={skill} type="button" onClick={() => addSkill(skill)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-50 text-gray-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <Plus className="h-3 w-3" />{skill}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Бюджет и сроки */}
        <Card>
          <CardTitle>Бюджет и сроки</CardTitle>
          <div className="mt-4 space-y-5">
            <Select
              label="Тип оплаты"
              options={BUDGET_TYPE_OPTIONS.map(({ value, label }) => ({ value, label }))}
              {...register('budgetType')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={budgetType === 'hourly' ? 'Ставка от ($/час)' : 'Бюджет от ($)'}
                type="number"
                placeholder="500"
                error={errors.budgetMin?.message}
                {...register('budgetMin', { valueAsNumber: true })}
              />
              <Input
                label={budgetType === 'hourly' ? 'Ставка до ($/час)' : 'Бюджет до ($)'}
                type="number"
                placeholder="2000"
                error={errors.budgetMax?.message}
                {...register('budgetMax', { valueAsNumber: true })}
              />
            </div>

            <Input
              label="Дедлайн"
              type="date"
              error={errors.deadline?.message}
              {...register('deadline')}
            />

            <Select
              label="Уровень исполнителя"
              options={Object.entries(EXPERIENCE_LEVELS).map(([value, label]) => ({ value, label }))}
              {...register('experienceLevel')}
            />
          </div>
        </Card>

        {/* Дополнительно */}
        <Card>
          <CardTitle>Дополнительные настройки</CardTitle>
          <div className="mt-4 space-y-4">
            <Select
              label="Видимость"
              options={VISIBILITY_OPTIONS.map(({ value, label }) => ({ value, label }))}
              {...register('visibility')}
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" {...register('hasNda')} />
              <span className="text-sm text-gray-700">Требуется NDA (соглашение о неразглашении)</span>
            </label>
          </div>
        </Card>

        {/* Кнопки */}
        <div className="flex gap-3 justify-end">
          <Link href={ROUTES.PROJECTS}>
            <Button variant="outline" type="button">Отмена</Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />} size="lg">
            Опубликовать проект
          </Button>
        </div>
      </form>
    </div>
  );
}
