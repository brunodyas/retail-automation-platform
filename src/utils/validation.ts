import { z } from 'zod';

/** Минимальная длина пароля */
const MIN_PASSWORD_LENGTH = 8;
/** Максимальная длина описания профиля */
const MAX_BIO_LENGTH = 1500;
/** Максимальное количество навыков */
const MAX_SKILLS_COUNT = 20;

/**
 * Схема валидации email.
 */
export const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .email('Некорректный email');

/**
 * Схема валидации пароля.
 */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Минимум ${MIN_PASSWORD_LENGTH} символов`)
  .regex(/[A-Z]/, 'Должна быть хотя бы одна заглавная буква')
  .regex(/[a-z]/, 'Должна быть хотя бы одна строчная буква')
  .regex(/[0-9]/, 'Должна быть хотя бы одна цифра');

/**
 * Схема регистрации.
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
    name: z.string().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
    role: z.enum(['freelancer', 'client', 'both'], {
      message: 'Выберите роль',
    }),
    agreeToTerms: z.literal(true, {
      message: 'Необходимо принять условия',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

/**
 * Схема входа.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
});

/**
 * Схема профиля исполнителя.
 */
export const freelancerProfileSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(100),
  title: z.string().min(5, 'Минимум 5 символов').max(200),
  bio: z.string().max(MAX_BIO_LENGTH, `Максимум ${MAX_BIO_LENGTH} символов`).optional(),
  skills: z
    .array(z.string())
    .min(1, 'Добавьте хотя бы один навык')
    .max(MAX_SKILLS_COUNT, `Максимум ${MAX_SKILLS_COUNT} навыков`),
  hourlyRate: z.number().min(0, 'Ставка не может быть отрицательной').optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  availability: z.enum(['available', 'partially_busy', 'not_available']).optional(),
  languages: z
    .array(
      z.object({
        language: z.string(),
        level: z.enum(['beginner', 'intermediate', 'advanced', 'native']),
      })
    )
    .optional(),
  links: z
    .object({
      website: z.string().url().optional().or(z.literal('')),
      github: z.string().url().optional().or(z.literal('')),
      dribbble: z.string().url().optional().or(z.literal('')),
      behance: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
});

/**
 * Схема создания проекта.
 */
export const createProjectSchema = z.object({
  title: z.string().min(10, 'Минимум 10 символов').max(200, 'Максимум 200 символов'),
  category: z.string().min(1, 'Выберите категорию'),
  description: z.string().min(50, 'Минимум 50 символов'),
  skills: z.array(z.string()).min(1, 'Добавьте хотя бы один навык'),
  budgetType: z.enum(['fixed', 'hourly']),
  budgetMin: z.number().min(0, 'Бюджет не может быть отрицательным'),
  budgetMax: z.number().min(0).optional(),
  estimatedHours: z.number().min(1).optional(),
  deadline: z.string().optional(),
  experienceLevel: z.enum(['junior', 'middle', 'senior', 'any']).optional(),
  visibility: z.enum(['public', 'invite_only', 'pro_only']).optional(),
  isPrivate: z.boolean().optional(),
  hasNda: z.boolean().optional(),
});

/**
 * Схема отклика на проект.
 */
export const proposalSchema = z.object({
  coverLetter: z.string().min(30, 'Минимум 30 символов').max(3000),
  proposedPrice: z.number().min(1, 'Укажите цену'),
  estimatedDays: z.number().min(1, 'Укажите срок').max(365),
});

/** Inferred types из Zod-схем */
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type FreelancerProfileFormData = z.infer<typeof freelancerProfileSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type ProposalFormData = z.infer<typeof proposalSchema>;
