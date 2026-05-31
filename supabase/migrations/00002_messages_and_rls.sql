-- ============================================================================
-- VibeCoding — Сообщения и доп. RLS
-- ============================================================================
-- Привести таблицу messages к API (content, is_read), добавить недостающие RLS.
-- ============================================================================

-- Сообщения: в API используются content и is_read
ALTER TABLE messages RENAME COLUMN text TO content;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- Споры: автор видит свой спор, админы — все
CREATE POLICY "Users can view own disputes"
  ON disputes FOR SELECT
  USING (opened_by_user_id = auth.uid());

CREATE POLICY "Admins can view all disputes"
  ON disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Заказчик может обновлять заявки по своим проектам (принять/отклонить)
CREATE POLICY "Clients can update proposals for own projects"
  ON proposals FOR UPDATE
  USING (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
  );

-- Создание чатов и участников (авторизованный пользователь)
CREATE POLICY "Authenticated users can create chats"
  ON chats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can create chat participants"
  ON chat_participants FOR INSERT
  WITH CHECK (true);

-- Чтение чатов: участники
CREATE POLICY "Chat participants can view chat"
  ON chats FOR SELECT
  USING (
    id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

-- Обновление чата (updated_at)
CREATE POLICY "Chat participants can update chat"
  ON chats FOR UPDATE
  USING (
    id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

-- Админы видят все профили для админки
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'moderator')
    )
  );

-- Админы видят все проекты
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Вставка в transactions (пополнение, эскроу и т.д. — по необходимости через RPC или service role)
-- Для anon-клиента: только чтение своих (уже есть). INSERT обычно через Edge/backend с service key.
