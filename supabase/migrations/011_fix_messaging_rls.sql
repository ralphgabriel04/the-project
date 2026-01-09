-- ============================================
-- THE PROJECT - Fix Messaging RLS Policy
-- ============================================
-- Updates the conversation creation policy to check for accepted status
-- Run this AFTER 008_messaging_system.sql
-- ============================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create updated policy with status check
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    (participant_1 = auth.uid() OR participant_2 = auth.uid())
    AND (
      -- Must be an ACCEPTED coach-athlete relationship
      EXISTS (
        SELECT 1 FROM coach_athletes
        WHERE (
          (coach_id = participant_1 AND athlete_id = participant_2)
          OR (coach_id = participant_2 AND athlete_id = participant_1)
        )
        AND status = 'accepted'
        AND is_deleted = FALSE
      )
    )
  );

-- Also update the helper function to verify relationship before creating
CREATE OR REPLACE FUNCTION get_or_create_conversation(user_1 UUID, user_2 UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  p1 UUID;
  p2 UUID;
  has_relationship BOOLEAN;
BEGIN
  -- Verify there's an accepted coach-athlete relationship
  SELECT EXISTS (
    SELECT 1 FROM coach_athletes
    WHERE (
      (coach_id = user_1 AND athlete_id = user_2)
      OR (coach_id = user_2 AND athlete_id = user_1)
    )
    AND status = 'accepted'
    AND is_deleted = FALSE
  ) INTO has_relationship;

  IF NOT has_relationship THEN
    RAISE EXCEPTION 'No accepted coach-athlete relationship exists';
  END IF;

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
