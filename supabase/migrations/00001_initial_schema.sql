-- ============================================================================
-- VibeCoding — Начальная схема базы данных
-- ============================================================================
-- Миграция: 00001_initial_schema
-- Описание: Создание всех основных таблиц платформы
-- ============================================================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Для полнотекстового поиска

-- ============================================================================
-- ENUM ТИПЫ
-- ============================================================================

CREATE TYPE user_role AS ENUM ('freelancer', 'client', 'both', 'admin', 'moderator');
CREATE TYPE availability_status AS ENUM ('available', 'partially_busy', 'not_available');
CREATE TYPE verification_status AS ENUM ('none', 'email', 'phone', 'kyc', 'full');
CREATE TYPE language_level AS ENUM ('beginner', 'intermediate', 'advanced', 'native');

CREATE TYPE project_status AS ENUM (
  'draft', 'open', 'performer_selected', 'in_progress',
  'under_review', 'revision', 'completed', 'cancelled', 'disputed'
);
CREATE TYPE budget_type AS ENUM ('fixed', 'hourly');
CREATE TYPE experience_level AS ENUM ('junior', 'middle', 'senior', 'any');
CREATE TYPE project_visibility AS ENUM ('public', 'invite_only', 'pro_only');

CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TYPE message_delivery_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE message_attachment_type AS ENUM ('image', 'document', 'archive', 'other');

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'frozen');
CREATE TYPE transaction_type AS ENUM (
  'deposit', 'withdrawal', 'escrow_lock', 'escrow_release', 'escrow_refund', 'commission'
);
CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'bank_transfer', 'ewallet');

CREATE TYPE review_author_role AS ENUM ('client', 'freelancer');

CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE dispute_resolution AS ENUM (
  'pay_freelancer', 'refund_client', 'split', 'require_revision', 'none'
);

CREATE TYPE notification_type AS ENUM (
  'new_proposal', 'project_invitation', 'new_message', 'status_change',
  'payment_received', 'payment_error', 'review_received',
  'dispute_opened', 'dispute_resolved', 'system'
);

CREATE TYPE badge_type AS ENUM ('top_performer', 'reliable_client', 'pro', 'veteran', 'rising_star');

-- ============================================================================
-- ТАБЛИЦА: profiles (расширение auth.users Supabase)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'freelancer',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status verification_status NOT NULL DEFAULT 'none',
  country TEXT,
  city TEXT,
  timezone TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_country ON profiles(country);
CREATE INDEX idx_profiles_name_trgm ON profiles USING gin(name gin_trgm_ops);

-- ============================================================================
-- ТАБЛИЦА: freelancer_profiles
-- ============================================================================

CREATE TABLE freelancer_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  experience_years SMALLINT DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  fixed_rate_min DECIMAL(10,2),
  fixed_rate_max DECIMAL(10,2),
  availability availability_status NOT NULL DEFAULT 'available',
  languages JSONB NOT NULL DEFAULT '[]',
  links JSONB NOT NULL DEFAULT '{}',
  -- Статистика (денормализована для производительности)
  completed_projects INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  avg_project_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  avg_response_time INTEGER NOT NULL DEFAULT 0, -- в минутах
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для поиска и фильтрации
CREATE INDEX idx_freelancer_skills ON freelancer_profiles USING gin(skills);
CREATE INDEX idx_freelancer_categories ON freelancer_profiles USING gin(categories);
CREATE INDEX idx_freelancer_availability ON freelancer_profiles(availability);
CREATE INDEX idx_freelancer_rating ON freelancer_profiles(rating DESC);
CREATE INDEX idx_freelancer_hourly_rate ON freelancer_profiles(hourly_rate);

-- ============================================================================
-- ТАБЛИЦА: client_profiles
-- ============================================================================

CREATE TABLE client_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  description TEXT,
  website TEXT,
  -- Статистика
  published_projects INTEGER NOT NULL DEFAULT 0,
  completed_projects INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
  avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ТАБЛИЦА: portfolio_items
-- ============================================================================

CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  link_url TEXT,
  platform_project_id UUID, -- Связь с проектом VibeCoding
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_user ON portfolio_items(user_id);

-- ============================================================================
-- ТАБЛИЦА: projects (заказы)
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  budget_type budget_type NOT NULL DEFAULT 'fixed',
  budget_min DECIMAL(10,2) NOT NULL DEFAULT 0,
  budget_max DECIMAL(10,2),
  estimated_hours INTEGER,
  deadline DATE,
  experience_level experience_level NOT NULL DEFAULT 'any',
  status project_status NOT NULL DEFAULT 'draft',
  visibility project_visibility NOT NULL DEFAULT 'public',
  has_nda BOOLEAN NOT NULL DEFAULT FALSE,
  selected_freelancer_id UUID REFERENCES profiles(id),
  proposal_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_skills ON projects USING gin(skills);
CREATE INDEX idx_projects_budget ON projects(budget_min, budget_max);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_title_trgm ON projects USING gin(title gin_trgm_ops);

-- ============================================================================
-- ТАБЛИЦА: milestones (этапы проекта)
-- ============================================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'paid')),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON milestones(project_id);

-- ============================================================================
-- ТАБЛИЦА: project_attachments
-- ============================================================================

CREATE TABLE project_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_project ON project_attachments(project_id);

-- ============================================================================
-- ТАБЛИЦА: proposals (отклики)
-- ============================================================================

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  proposed_price DECIMAL(10,2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  status proposal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Один отклик от одного фрилансера на один проект
  UNIQUE (project_id, freelancer_id)
);

CREATE INDEX idx_proposals_project ON proposals(project_id);
CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- ============================================================================
-- ТАБЛИЦА: chats
-- ============================================================================

CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chats_project ON chats(project_id);

-- ============================================================================
-- ТАБЛИЦА: chat_participants
-- ============================================================================

CREATE TABLE chat_participants (
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);

-- ============================================================================
-- ТАБЛИЦА: messages
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  delivery_status message_delivery_status NOT NULL DEFAULT 'sent',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================================
-- ТАБЛИЦА: message_attachments
-- ============================================================================

CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  type message_attachment_type NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  thumbnail_url TEXT
);

CREATE INDEX idx_msg_attachments_message ON message_attachments(message_id);

-- ============================================================================
-- ТАБЛИЦА: transactions (финансы)
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status transaction_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  project_id UUID REFERENCES projects(id),
  milestone_id UUID REFERENCES milestones(id),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ============================================================================
-- ТАБЛИЦА: user_balances
-- ============================================================================

CREATE TABLE user_balances (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  available DECIMAL(12,2) NOT NULL DEFAULT 0,
  in_escrow DECIMAL(12,2) NOT NULL DEFAULT 0,
  pending_withdrawal DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ТАБЛИЦА: reviews (отзывы)
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_role review_author_role NOT NULL,
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  criteria JSONB NOT NULL DEFAULT '{}',
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  -- Один отзыв от одного участника на один проект
  UNIQUE (project_id, author_id)
);

CREATE INDEX idx_reviews_target ON reviews(target_id);
CREATE INDEX idx_reviews_project ON reviews(project_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating DESC);

-- ============================================================================
-- ТАБЛИЦА: user_badges
-- ============================================================================

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type badge_type NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, type)
);

CREATE INDEX idx_badges_user ON user_badges(user_id);

-- ============================================================================
-- ТАБЛИЦА: disputes (споры)
-- ============================================================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id),
  opened_by_user_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution dispute_resolution NOT NULL DEFAULT 'none',
  resolved_by_moderator_id UUID REFERENCES profiles(id),
  moderator_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_project ON disputes(project_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- ============================================================================
-- ТАБЛИЦА: dispute_messages
-- ============================================================================

CREATE TABLE dispute_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  is_moderator_message BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);

-- ============================================================================
-- ТАБЛИЦА: notifications
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- ТАБЛИЦА: notification_settings
-- ============================================================================

CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  email_frequency TEXT NOT NULL DEFAULT 'instant'
    CHECK (email_frequency IN ('instant', 'hourly', 'daily')),
  muted_types notification_type[] NOT NULL DEFAULT '{}'
);

-- ============================================================================
-- ТАБЛИЦА: favorites (избранные исполнители)
-- ============================================================================

CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, freelancer_id)
);

-- ============================================================================
-- ФУНКЦИЯ: автообновление updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_freelancer_profiles_updated_at
  BEFORE UPDATE ON freelancer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_proposals_updated_at
  BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_chats_updated_at
  BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ФУНКЦИЯ: автосоздание профиля при регистрации
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'freelancer')
  );

  -- Создаём профиль исполнителя если роль freelancer или both
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer') IN ('freelancer', 'both') THEN
    INSERT INTO freelancer_profiles (id) VALUES (NEW.id);
  END IF;

  -- Создаём профиль заказчика если роль client или both
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer') IN ('client', 'both') THEN
    INSERT INTO client_profiles (id) VALUES (NEW.id);
  END IF;

  -- Баланс
  INSERT INTO user_balances (user_id) VALUES (NEW.id);

  -- Настройки уведомлений
  INSERT INTO notification_settings (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер на создание пользователя
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- RLS (Row Level Security) — базовые политики
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: публичное чтение, редактирование только своего
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Freelancer profiles: публичное чтение
CREATE POLICY "Freelancer profiles are viewable by everyone"
  ON freelancer_profiles FOR SELECT USING (true);

CREATE POLICY "Freelancers can update own profile"
  ON freelancer_profiles FOR UPDATE USING (auth.uid() = id);

-- Client profiles: публичное чтение
CREATE POLICY "Client profiles are viewable by everyone"
  ON client_profiles FOR SELECT USING (true);

CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: публичное чтение открытых, автор видит все свои
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT USING (
    status != 'draft' OR client_id = auth.uid()
  );

CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own projects"
  ON projects FOR UPDATE USING (client_id = auth.uid());

-- Proposals: автор и заказчик проекта видят
CREATE POLICY "Proposals viewable by author and project owner"
  ON proposals FOR SELECT USING (
    freelancer_id = auth.uid()
    OR project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
  );

CREATE POLICY "Freelancers can create proposals"
  ON proposals FOR INSERT WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can update own proposals"
  ON proposals FOR UPDATE USING (freelancer_id = auth.uid());

-- Messages: участники чата
CREATE POLICY "Messages viewable by chat participants"
  ON messages FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Chat participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND chat_id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

-- Transactions: только свои
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (user_id = auth.uid());

-- Balances: только свои
CREATE POLICY "Users can view own balance"
  ON user_balances FOR SELECT USING (user_id = auth.uid());

-- Reviews: публичное чтение
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT WITH CHECK (author_id = auth.uid());

-- Notifications: только свои
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Favorites: только свои
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE USING (user_id = auth.uid());
