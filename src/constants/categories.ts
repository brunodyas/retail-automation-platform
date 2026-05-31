/** Категории проектов и услуг */
export interface ICategory {
  id: string;
  label: string;
  icon: string;
  subcategories: ISubcategory[];
}

export interface ISubcategory {
  id: string;
  label: string;
}

export const CATEGORIES: ICategory[] = [
  {
    id: 'web-development',
    label: 'Веб-разработка',
    icon: 'Globe',
    subcategories: [
      { id: 'frontend', label: 'Frontend-разработка' },
      { id: 'backend', label: 'Backend-разработка' },
      { id: 'fullstack', label: 'Full-stack разработка' },
      { id: 'cms', label: 'CMS / WordPress / Bitrix' },
      { id: 'ecommerce', label: 'Интернет-магазины' },
      { id: 'landing', label: 'Лендинги' },
    ],
  },
  {
    id: 'mobile-development',
    label: 'Мобильная разработка',
    icon: 'Smartphone',
    subcategories: [
      { id: 'ios', label: 'iOS (Swift)' },
      { id: 'android', label: 'Android (Kotlin)' },
      { id: 'cross-platform', label: 'Кроссплатформенная (React Native / Flutter)' },
    ],
  },
  {
    id: 'design',
    label: 'Дизайн',
    icon: 'Palette',
    subcategories: [
      { id: 'ui-ux', label: 'UI/UX дизайн' },
      { id: 'graphic-design', label: 'Графический дизайн' },
      { id: 'logo-branding', label: 'Логотипы и брендинг' },
      { id: 'illustration', label: 'Иллюстрации' },
      { id: 'motion-design', label: 'Моушн-дизайн' },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps и инфраструктура',
    icon: 'Server',
    subcategories: [
      { id: 'ci-cd', label: 'CI/CD' },
      { id: 'cloud', label: 'Облачные сервисы (AWS/GCP/Azure)' },
      { id: 'docker-k8s', label: 'Docker / Kubernetes' },
      { id: 'monitoring', label: 'Мониторинг и логирование' },
    ],
  },
  {
    id: 'qa',
    label: 'Тестирование (QA)',
    icon: 'Bug',
    subcategories: [
      { id: 'manual-testing', label: 'Ручное тестирование' },
      { id: 'auto-testing', label: 'Автоматизированное тестирование' },
      { id: 'load-testing', label: 'Нагрузочное тестирование' },
    ],
  },
  {
    id: 'marketing',
    label: 'Маркетинг и SMM',
    icon: 'Megaphone',
    subcategories: [
      { id: 'seo', label: 'SEO-продвижение' },
      { id: 'smm', label: 'SMM' },
      { id: 'content-marketing', label: 'Контент-маркетинг' },
      { id: 'ppc', label: 'Контекстная реклама' },
      { id: 'email-marketing', label: 'Email-маркетинг' },
    ],
  },
  {
    id: 'copywriting',
    label: 'Копирайтинг и контент',
    icon: 'FileText',
    subcategories: [
      { id: 'copywriting', label: 'Копирайтинг' },
      { id: 'translation', label: 'Переводы' },
      { id: 'technical-writing', label: 'Техническая документация' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика и данные',
    icon: 'BarChart',
    subcategories: [
      { id: 'business-analytics', label: 'Бизнес-аналитика' },
      { id: 'data-science', label: 'Data Science / ML' },
      { id: 'bi', label: 'BI-системы' },
    ],
  },
];

/** Получить плоский список всех категорий */
export const getAllCategoryIds = (): string[] => {
  return CATEGORIES.flatMap((cat) => [
    cat.id,
    ...cat.subcategories.map((sub) => sub.id),
  ]);
};

/** Найти категорию по id */
export const findCategoryById = (id: string): ICategory | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};
