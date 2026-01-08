-- ============================================
-- THE PROJECT - Athlete Programs Support
-- ============================================
-- Allows athletes to create their own programs
-- Run this AFTER 006_fix_athletes_view_pending_coaches.sql
-- ============================================

-- ============================================
-- 1. SCHEMA CHANGES
-- ============================================

-- Add created_by to identify program creator (coach or athlete)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Update existing programs: set created_by = coach_id for existing programs
UPDATE programs SET created_by = coach_id WHERE created_by IS NULL;

-- Make coach_id nullable for athlete-created programs
ALTER TABLE programs ALTER COLUMN coach_id DROP NOT NULL;

-- Add index for created_by queries
CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by) WHERE is_deleted = FALSE;

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

-- Check if user is an athlete
CREATE OR REPLACE FUNCTION is_athlete(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'athlete' AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get program creator
CREATE OR REPLACE FUNCTION get_program_creator(program_uuid UUID)
RETURNS UUID AS $$
DECLARE
  creator UUID;
BEGIN
  SELECT created_by INTO creator FROM programs WHERE id = program_uuid;
  RETURN creator;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. PROGRAMS POLICIES FOR ATHLETES
-- ============================================

-- Athletes can create their own programs
CREATE POLICY "Athletes can create own programs"
  ON programs FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND is_athlete(auth.uid())
    AND coach_id IS NULL
  );

-- Athletes can view their own created programs
CREATE POLICY "Athletes can view own created programs"
  ON programs FOR SELECT
  USING (
    created_by = auth.uid()
    AND is_deleted = FALSE
  );

-- Athletes can update their own programs
CREATE POLICY "Athletes can update own programs"
  ON programs FOR UPDATE
  USING (created_by = auth.uid() AND coach_id IS NULL)
  WITH CHECK (created_by = auth.uid() AND coach_id IS NULL);

-- Athletes can delete (soft) their own programs
CREATE POLICY "Athletes can delete own programs"
  ON programs FOR DELETE
  USING (created_by = auth.uid() AND coach_id IS NULL);

-- ============================================
-- 4. SESSIONS POLICIES FOR ATHLETES
-- ============================================

-- Athletes can view sessions in their own programs
CREATE POLICY "Athletes can view own program sessions"
  ON sessions FOR SELECT
  USING (
    get_program_creator(program_id) = auth.uid()
    AND is_deleted = FALSE
  );

-- Athletes can create sessions in their own programs
CREATE POLICY "Athletes can create own sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    get_program_creator(program_id) = auth.uid()
    AND is_athlete(auth.uid())
  );

-- Athletes can update sessions in their own programs
CREATE POLICY "Athletes can update own sessions"
  ON sessions FOR UPDATE
  USING (get_program_creator(program_id) = auth.uid());

-- Athletes can delete sessions in their own programs
CREATE POLICY "Athletes can delete own sessions"
  ON sessions FOR DELETE
  USING (get_program_creator(program_id) = auth.uid());

-- ============================================
-- 5. EXERCISES POLICIES FOR ATHLETES
-- ============================================

-- Athletes can view exercises in their own programs
CREATE POLICY "Athletes can view own program exercises"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.created_by = auth.uid()
    )
    AND is_deleted = FALSE
  );

-- Athletes can create exercises in their own sessions
CREATE POLICY "Athletes can create own exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.created_by = auth.uid()
        AND programs.coach_id IS NULL
    )
  );

-- Athletes can update exercises in their own sessions
CREATE POLICY "Athletes can update own exercises"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.created_by = auth.uid()
        AND programs.coach_id IS NULL
    )
  );

-- Athletes can delete exercises in their own sessions
CREATE POLICY "Athletes can delete own exercises"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.created_by = auth.uid()
        AND programs.coach_id IS NULL
    )
  );

-- ============================================
-- 6. PROGRAM ASSIGNMENTS FOR ATHLETE SELF-ASSIGN
-- ============================================

-- Athletes can assign themselves to their own programs
CREATE POLICY "Athletes can self-assign to own programs"
  ON program_assignments FOR INSERT
  WITH CHECK (
    athlete_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_assignments.program_id
        AND programs.created_by = auth.uid()
    )
  );

-- Athletes can view their self-assignments
CREATE POLICY "Athletes can view self-assignments"
  ON program_assignments FOR SELECT
  USING (
    athlete_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_assignments.program_id
        AND programs.created_by = auth.uid()
    )
    AND is_deleted = FALSE
  );
