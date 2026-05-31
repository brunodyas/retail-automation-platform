# VibeCoding Freelance — Биржа фриланса для IT-специалистов

Онлайн-платформа для поиска фрилансеров и проектов в IT и digital с безопасными сделками через эскроу.

## Технологии

- **Frontend:** Next.js 16, React 19, TypeScript
- **Стилизация:** Tailwind CSS 4, Framer Motion
- **Backend/БД:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Состояние:** Zustand (клиент), React Query (сервер), React Hook Form (формы)
- **Валидация:** Zod
- **i18n:** next-intl (русский + английский)
- **Тестирование:** Vitest + Testing Library
- **Иконки:** Lucide React

## Быстрый старт

```bash
# Клонировать репозиторий
git clone <repo-url>
cd vibecoding-freelance

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env.local
# Заполнить значения в .env.local

# Запустить dev-сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Настройка Supabase

1. **Создайте проект** в [Supabase Dashboard](https://supabase.com/dashboard), скопируйте **Project URL** и **anon key** (в разделе «API» или «Подключитесь к вашему проекту»). В `.env.local` укажите:
   - `NEXT_PUBLIC_SUPABASE_URL` — URL проекта
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **Anon key (Legacy)** в формате JWT (`eyJ...`). Если в дашборде указан только «Издательский ключ» (`sb_publishable_...`), откройте **Настройки → API** и скопируйте полный **anon (public)** ключ.

2. **Применить миграции:** в дашборде Supabase откройте **SQL Editor** и по очереди выполните скрипты из папки `supabase/migrations/` (сначала `00001_initial_schema.sql`, затем `00002_messages_and_rls.sql`). Это создаст таблицы, триггеры и RLS.

3. **Storage для аватаров:** в разделе **Storage** создайте bucket с именем `user-files`, сделайте его **Public**. В **Policies** для этого bucket добавьте политику: разрешить **INSERT** и **UPDATE** для `auth.uid() IS NOT NULL` (путь префикс `avatars/`) и **SELECT** для всех.

После этого регистрация, проекты, чаты и админка будут работать с реальной БД.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Продакшен-сборка |
| `npm run start` | Запуск продакшен-сервера |
| `npm run lint` | Проверка линтером |
| `npm run test` | Запуск тестов (watch mode) |
| `npm run test:run` | Однократный запуск тестов |
| `npm run test:coverage` | Тесты с покрытием |

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Страницы авторизации
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/             # Основные страницы
│   │   ├── projects/       # Каталог и детали проектов
│   │   ├── freelancers/    # Каталог исполнителей
│   │   ├── dashboard/      # Личный кабинет
│   │   └── profile/        # Профиль пользователя
│   ├── (admin)/            # Админ-панель
│   └── api/                # API Route Handlers
├── components/
│   ├── ui/                 # Базовые UI-компоненты
│   ├── layout/             # Layout (Header, Footer, Sidebar)
│   ├── cards/              # Карточки (проекты, фрилансеры)
│   ├── forms/              # Формы
│   ├── modals/             # Модальные окна
│   └── providers/          # Провайдеры (Query, Auth)
├── hooks/                  # Кастомные хуки
├── stores/                 # Zustand stores
├── types/                  # TypeScript типы
├── utils/                  # Утилиты
├── lib/                    # Библиотеки (Supabase)
├── constants/              # Константы, категории, навыки
├── i18n/                   # Локализация
│   └── messages/           # JSON-переводы (ru, en)
└── tests/                  # Настройки тестов
```

## Этапы разработки

- [x] **Этап 1:** Фундамент — структура, компоненты, типы, конфигурация
- [ ] **Этап 2:** Авторизация и профили (Supabase Auth, OAuth, KYC)
- [ ] **Этап 3:** Проекты и заказы (CRUD, жизненный цикл, отклики)
- [ ] **Этап 4:** Мессенджер и уведомления (Realtime, push)
- [ ] **Этап 5:** Платежи и эскроу (Stripe, внутренний баланс)
- [ ] **Этап 6:** Отзывы, рейтинги, споры
- [ ] **Этап 7:** Админ-панель
- [ ] **Этап 8:** Оптимизация, SEO, PWA, деплой

## Лицензия

Проприетарный. Все права защищены.
