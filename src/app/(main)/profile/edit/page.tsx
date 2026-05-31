'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, Camera, Plus, X, Save, AlertCircle, CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Textarea, Select, Badge, Card, CardTitle, Avatar } from '@/components/ui';
import { freelancerProfileSchema, type FreelancerProfileFormData } from '@/utils/validation';
import { ROUTES, LIMITS } from '@/constants';
import { CATEGORIES } from '@/constants/categories';
import { POPULAR_SKILLS } from '@/constants/skills';
import { useAuthStore } from '@/stores/auth-store';
import { updateProfile, updateFreelancerProfile, uploadAvatar } from '@/api/profile';
import { cn } from '@/utils/cn';

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Доступен для новых проектов' },
  { value: 'partially_busy', label: 'Частично занят' },
  { value: 'not_available', label: 'Не беру новые проекты' },
] as const;

const LANGUAGE_LEVELS = [
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
  { value: 'native', label: 'Родной' },
] as const;

/**
 * Страница редактирования профиля исполнителя.
 * Многосекционная форма: основная информация, навыки, ставки, ссылки.
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<Array<{ language: string; level: string }>>([
    { language: 'Русский', level: 'native' },
  ]);

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<FreelancerProfileFormData>({
    resolver: zodResolver(freelancerProfileSchema),
    defaultValues: {
      name: user?.name || '',
      availability: 'available',
      skills: [],
    },
  });

  const bioValue = watch('bio') || '';

  /** Загрузка аватара */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Превью
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Загрузка
    const formData = new FormData();
    formData.append('avatar', file);
    const { url, error } = await uploadAvatar(formData);
    if (error) {
      setFormMessage({ type: 'error', text: `Ошибка загрузки аватара: ${error}` });
    } else if (url) {
      setAvatarPreview(url);
    }
  };

  /** Добавить навык */
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed) && selectedSkills.length < LIMITS.MAX_SKILLS_COUNT) {
      const updated = [...selectedSkills, trimmed];
      setSelectedSkills(updated);
      setValue('skills', updated, { shouldValidate: true });
      setSkillInput('');
    }
  };

  /** Удалить навык */
  const removeSkill = (skill: string) => {
    const updated = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updated);
    setValue('skills', updated, { shouldValidate: true });
  };

  /** Добавить язык */
  const addLanguage = () => {
    setLanguages([...languages, { language: '', level: 'beginner' }]);
  };

  /** Удалить язык */
  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  /** Сохранение профиля */
  const onSubmit = async (data: FreelancerProfileFormData) => {
    setIsSaving(true);
    setFormMessage(null);

    try {
      // Обновить базовый профиль
      const profileResult = await updateProfile({
        name: data.name,
        country: data.country,
        city: data.city,
        timezone: data.timezone,
      });

      if (profileResult.error) {
        setFormMessage({ type: 'error', text: profileResult.error });
        return;
      }

      // Обновить профиль исполнителя
      const freelancerResult = await updateFreelancerProfile({
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        experienceYears: data.experienceYears,
        hourlyRate: data.hourlyRate,
        availability: data.availability,
        languages,
        links: data.links ? {
          website: data.links.website || '',
          github: data.links.github || '',
          dribbble: data.links.dribbble || '',
          behance: data.links.behance || '',
          linkedin: data.links.linkedin || '',
        } : undefined,
      });

      if (freelancerResult.error) {
        setFormMessage({ type: 'error', text: freelancerResult.error });
        return;
      }

      setFormMessage({ type: 'success', text: 'Профиль успешно сохранён' });
      router.refresh();
    } catch {
      setFormMessage({ type: 'error', text: 'Произошла ошибка при сохранении' });
    } finally {
      setIsSaving(false);
    }
  };

  const suggestedSkills = POPULAR_SKILLS
    .filter((s) => !selectedSkills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href={ROUTES.PROFILE} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Назад к профилю
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Редактировать профиль</h1>
      <p className="text-gray-500 mb-8">Заполните профиль, чтобы получать больше заказов</p>

      {/* Уведомление */}
      {formMessage && (
        <div className={cn(
          'mb-6 flex items-center gap-2 p-3 rounded-lg border',
          formMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          {formMessage.type === 'success'
            ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          }
          <p className={cn('text-sm', formMessage.type === 'success' ? 'text-green-700' : 'text-red-700')}>
            {formMessage.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Аватар */}
        <Card>
          <CardTitle>Фото профиля</CardTitle>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative">
              <Avatar src={avatarPreview} alt={user?.name || 'Профиль'} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                aria-label="Загрузить фото"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Загрузите фото</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP или GIF. Максимум 5 МБ.</p>
            </div>
          </div>
        </Card>

        {/* Основная информация */}
        <Card>
          <CardTitle>Основная информация</CardTitle>
          <div className="mt-4 space-y-5">
            <Input label="Имя" placeholder="Иван Иванов" error={errors.name?.message} {...register('name')} />

            <Input
              label="Заголовок профиля"
              placeholder="Например: Senior Frontend Developer (React / Next.js)"
              hint="Кратко опишите свою специализацию"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="О себе"
              placeholder="Расскажите о своём опыте, подходе к работе и чём вы можете помочь..."
              maxLength={LIMITS.MAX_BIO_LENGTH}
              currentLength={bioValue.length}
              error={errors.bio?.message}
              {...register('bio')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Страна" placeholder="Беларусь" {...register('country')} />
              <Input label="Город" placeholder="Минск" {...register('city')} />
            </div>

            <Input label="Часовой пояс" placeholder="UTC+3" {...register('timezone')} />
          </div>
        </Card>

        {/* Навыки */}
        <Card>
          <CardTitle>Навыки</CardTitle>
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Введите навык и нажмите Enter..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
              error={errors.skills?.message}
              hint={`${selectedSkills.length}/${LIMITS.MAX_SKILLS_COUNT} навыков`}
            />

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="info" size="md">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-600 transition-colors" aria-label={`Удалить ${skill}`}>
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

        {/* Ставка и опыт */}
        <Card>
          <CardTitle>Ставка и опыт</CardTitle>
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ставка ($/час)"
                type="number"
                placeholder="40"
                error={errors.hourlyRate?.message}
                {...register('hourlyRate', { valueAsNumber: true })}
              />
              <Input
                label="Опыт (лет)"
                type="number"
                placeholder="5"
                error={errors.experienceYears?.message}
                {...register('experienceYears', { valueAsNumber: true })}
              />
            </div>

            <Select
              label="Доступность"
              options={AVAILABILITY_OPTIONS.map(({ value, label }) => ({ value, label }))}
              {...register('availability')}
            />
          </div>
        </Card>

        {/* Языки */}
        <Card>
          <CardTitle>Языки</CardTitle>
          <div className="mt-4 space-y-3">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  placeholder="Язык"
                  value={lang.language}
                  onChange={(e) => {
                    const updated = [...languages];
                    updated[index] = { ...updated[index], language: e.target.value };
                    setLanguages(updated);
                  }}
                />
                <select
                  value={lang.level}
                  onChange={(e) => {
                    const updated = [...languages];
                    updated[index] = { ...updated[index], level: e.target.value };
                    setLanguages(updated);
                  }}
                  className="block w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {LANGUAGE_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                  ))}
                </select>
                {languages.length > 1 && (
                  <button type="button" onClick={() => removeLanguage(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Удалить язык">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLanguage} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
              <Plus className="h-4 w-4" />
              Добавить язык
            </button>
          </div>
        </Card>

        {/* Ссылки */}
        <Card>
          <CardTitle>Ссылки</CardTitle>
          <div className="mt-4 space-y-4">
            <Input label="Сайт / портфолио" placeholder="https://your-site.com" {...register('links.website')} />
            <Input label="GitHub" placeholder="https://github.com/username" {...register('links.github')} />
            <Input label="LinkedIn" placeholder="https://linkedin.com/in/username" {...register('links.linkedin')} />
            <Input label="Dribbble" placeholder="https://dribbble.com/username" {...register('links.dribbble')} />
            <Input label="Behance" placeholder="https://behance.net/username" {...register('links.behance')} />
          </div>
        </Card>

        {/* Кнопки */}
        <div className="flex gap-3 justify-end">
          <Link href={ROUTES.PROFILE}>
            <Button variant="outline" type="button">Отмена</Button>
          </Link>
          <Button type="submit" isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />} size="lg">
            Сохранить профиль
          </Button>
        </div>
      </form>
    </div>
  );
}
