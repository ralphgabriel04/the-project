-- ============================================
-- THE PROJECT - Messaging System
-- ============================================
-- Simple asynchronous messaging between coaches and athletes
-- Run this AFTER 007_athlete_programs.sql
-- ============================================

-- ============================================
-- 1. CONVERSATIONS TABLE
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  -- Ensure unique conversation per pair (normalized order)
  CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2),
  -- Participants must be different
  CONSTRAINT different_participants CHECK (participant_1 != participant_2)
);

-- Indexes for efficient queries
CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1) WHERE is_deleted = FALSE;
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2) WHERE is_deleted = FALSE;
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC) WHERE is_deleted = FALSE;

-- ============================================
-- 2. MESSAGES TABLE
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for efficient queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_messages_sender ON messages(sender_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_deleted = FALSE AND is_read = FALSE;

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Check if user is participant in conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(user_id UUID, conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conv_id
      AND (participant_1 = user_id OR participant_2 = user_id)
      AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user_1 UUID, user_2 UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  p1 UUID;
  p2 UUID;
BEGIN
  -- Normalize order (smaller UUID first) to avoid duplicates
  IF user_1 < user_2 THEN
    p1 := user_1;
    p2 := user_2;
  ELSE
    p1 := user_2;
    p2 := user_1;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM conversations
  WHERE participant_1 = p1 AND participant_2 = p2 AND is_deleted = FALSE;

  -- Create if not exists
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO count
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  WHERE (c.participant_1 = user_id OR c.participant_2 = user_id)
    AND m.sender_id != user_id
    AND m.is_read = FALSE
    AND m.is_deleted = FALSE
    AND c.is_deleted = FALSE;

  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Update conversation's last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CONVERSATIONS POLICIES
-- ============================================

-- Users can view conversations they are part of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    (participant_1 = auth.uid() OR participant_2 = auth.uid())
    AND is_deleted = FALSE
  );

-- Users can create conversations (handled by function, but policy for direct inserts)
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    (participant_1 = auth.uid() OR participant_2 = auth.uid())
    AND (
      -- Must be coach-athlete relationship
      EXISTS (
        SELECT 1 FROM coach_athletes
        WHERE (
          (coach_id = participant_1 AND athlete_id = participant_2)
          OR (coach_id = participant_2 AND athlete_id = participant_1)
        )
        AND is_deleted = FALSE
      )
    )
  );

-- ============================================
-- 7. MESSAGES POLICIES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    is_conversation_participant(auth.uid(), conversation_id)
    AND is_deleted = FALSE
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND is_conversation_participant(auth.uid(), conversation_id)
  );

-- Users can mark messages as read (only received messages)
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    is_conversation_participant(auth.uid(), conversation_id)
    AND sender_id != auth.uid()
  )
  WITH CHECK (
    is_conversation_participant(auth.uid(), conversation_id)
    AND sender_id != auth.uid()
  );
