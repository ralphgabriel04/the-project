-- ============================================
-- Migration: Allow athletes to view coaches with pending invitations
-- Problem: Athletes can't see coach profile for pending invitations
-- ============================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Athletes can view their coaches profiles" ON profiles;

-- Recreate with pending status included
CREATE POLICY "Athletes can view their coaches profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_athletes
      WHERE athlete_id = auth.uid()
        AND coach_id = profiles.id
        AND status IN ('accepted', 'pending')
        AND is_deleted = FALSE
    )
  );

