-- ============================================
-- THE PROJECT - Row Level Security Policies
-- ============================================
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Coaches can view their athletes' profiles
CREATE POLICY "Coaches can view their athletes profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_athletes
      WHERE coach_id = auth.uid()
        AND athlete_id = profiles.id
        AND status = 'accepted'
        AND is_deleted = FALSE
    )
  );

-- Athletes can view their coaches' profiles
CREATE POLICY "Athletes can view their coaches profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_athletes
      WHERE athlete_id = auth.uid()
        AND coach_id = profiles.id
        AND status = 'accepted'
        AND is_deleted = FALSE
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. COACH_ATHLETES POLICIES
-- ============================================

-- Coaches can view their athlete relationships
CREATE POLICY "Coaches can view their relationships"
  ON coach_athletes FOR SELECT
  USING (coach_id = auth.uid() AND is_deleted = FALSE);

-- Athletes can view their coach relationships
CREATE POLICY "Athletes can view their relationships"
  ON coach_athletes FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can create invitations
CREATE POLICY "Coaches can invite athletes"
  ON coach_athletes FOR INSERT
  WITH CHECK (
    coach_id = auth.uid() 
    AND is_coach(auth.uid())
  );

-- Athletes can update (accept/reject) their invitations
CREATE POLICY "Athletes can respond to invitations"
  ON coach_athletes FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Coaches can update their relationships
CREATE POLICY "Coaches can update their relationships"
  ON coach_athletes FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- ============================================
-- 4. PROGRAMS POLICIES
-- ============================================

-- Coaches can view their own programs
CREATE POLICY "Coaches can view own programs"
  ON programs FOR SELECT
  USING (coach_id = auth.uid() AND is_deleted = FALSE);

-- Athletes can view programs assigned to them
CREATE POLICY "Athletes can view assigned programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_assignments
      WHERE program_id = programs.id
        AND athlete_id = auth.uid()
        AND is_deleted = FALSE
    )
    AND is_deleted = FALSE
  );

-- Coaches can create programs
CREATE POLICY "Coaches can create programs"
  ON programs FOR INSERT
  WITH CHECK (
    coach_id = auth.uid() 
    AND is_coach(auth.uid())
  );

-- Coaches can update their own programs
CREATE POLICY "Coaches can update own programs"
  ON programs FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Coaches can delete (soft) their own programs
CREATE POLICY "Coaches can delete own programs"
  ON programs FOR DELETE
  USING (coach_id = auth.uid());

-- ============================================
-- 5. PROGRAM_ASSIGNMENTS POLICIES
-- ============================================

-- Coaches can view their program assignments
CREATE POLICY "Coaches can view program assignments"
  ON program_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_assignments.program_id
        AND programs.coach_id = auth.uid()
    )
    AND is_deleted = FALSE
  );

-- Athletes can view their assignments
CREATE POLICY "Athletes can view own assignments"
  ON program_assignments FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can assign programs to their athletes
CREATE POLICY "Coaches can assign programs"
  ON program_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_assignments.program_id
        AND programs.coach_id = auth.uid()
    )
    AND is_athlete_coach(auth.uid(), athlete_id)
  );

-- Coaches can update assignments
CREATE POLICY "Coaches can update assignments"
  ON program_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_assignments.program_id
        AND programs.coach_id = auth.uid()
    )
  );

-- ============================================
-- 6. SESSIONS POLICIES
-- ============================================

-- Coaches can view sessions in their programs
CREATE POLICY "Coaches can view own sessions"
  ON sessions FOR SELECT
  USING (
    get_program_coach(program_id) = auth.uid()
    AND is_deleted = FALSE
  );

-- Athletes can view sessions in their assigned programs
CREATE POLICY "Athletes can view assigned sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_assignments
      WHERE program_assignments.program_id = sessions.program_id
        AND program_assignments.athlete_id = auth.uid()
        AND program_assignments.is_deleted = FALSE
    )
    AND is_deleted = FALSE
  );

-- Coaches can create sessions
CREATE POLICY "Coaches can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (get_program_coach(program_id) = auth.uid());

-- Coaches can update sessions
CREATE POLICY "Coaches can update sessions"
  ON sessions FOR UPDATE
  USING (get_program_coach(program_id) = auth.uid());

-- Coaches can delete sessions
CREATE POLICY "Coaches can delete sessions"
  ON sessions FOR DELETE
  USING (get_program_coach(program_id) = auth.uid());

-- ============================================
-- 7. EXERCISES POLICIES
-- ============================================

-- Coaches can view exercises in their sessions
CREATE POLICY "Coaches can view own exercises"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.coach_id = auth.uid()
    )
    AND is_deleted = FALSE
  );

-- Athletes can view exercises in assigned sessions
CREATE POLICY "Athletes can view assigned exercises"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN program_assignments ON sessions.program_id = program_assignments.program_id
      WHERE sessions.id = exercises.session_id
        AND program_assignments.athlete_id = auth.uid()
        AND program_assignments.is_deleted = FALSE
    )
    AND is_deleted = FALSE
  );

-- Coaches can manage exercises
CREATE POLICY "Coaches can create exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update exercises"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can delete exercises"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = exercises.session_id
        AND programs.coach_id = auth.uid()
    )
  );

-- ============================================
-- 8. SESSION_LOGS POLICIES
-- ============================================

-- Athletes can view their own session logs
CREATE POLICY "Athletes can view own session logs"
  ON session_logs FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can view their athletes' session logs
CREATE POLICY "Coaches can view athletes session logs"
  ON session_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = session_logs.session_id
        AND programs.coach_id = auth.uid()
    )
    AND is_deleted = FALSE
  );

-- Athletes can create session logs
CREATE POLICY "Athletes can create session logs"
  ON session_logs FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Athletes can update their own session logs
CREATE POLICY "Athletes can update own session logs"
  ON session_logs FOR UPDATE
  USING (athlete_id = auth.uid());

-- Coaches can add notes to session logs
CREATE POLICY "Coaches can add notes to session logs"
  ON session_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN programs ON sessions.program_id = programs.id
      WHERE sessions.id = session_logs.session_id
        AND programs.coach_id = auth.uid()
    )
  );

-- ============================================
-- 9. EXERCISE_LOGS POLICIES
-- ============================================

-- Athletes can view their own exercise logs
CREATE POLICY "Athletes can view own exercise logs"
  ON exercise_logs FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can view their athletes' exercise logs
CREATE POLICY "Coaches can view athletes exercise logs"
  ON exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_logs
      JOIN sessions ON session_logs.session_id = sessions.id
      JOIN programs ON sessions.program_id = programs.id
      WHERE session_logs.id = exercise_logs.session_log_id
        AND programs.coach_id = auth.uid()
    )
    AND is_deleted = FALSE
  );

-- Athletes can create exercise logs
CREATE POLICY "Athletes can create exercise logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Athletes can update their own exercise logs
CREATE POLICY "Athletes can update own exercise logs"
  ON exercise_logs FOR UPDATE
  USING (athlete_id = auth.uid());

-- ============================================
-- 10. SESSION_IMAGES POLICIES
-- ============================================

-- Athletes can view their own images
CREATE POLICY "Athletes can view own images"
  ON session_images FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can view their athletes' images
CREATE POLICY "Coaches can view athletes images"
  ON session_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_logs
      JOIN sessions ON session_logs.session_id = sessions.id
      JOIN programs ON sessions.program_id = programs.id
      WHERE session_logs.id = session_images.session_log_id
        AND programs.coach_id = auth.uid()
    )
    AND is_deleted = FALSE
  );

-- Athletes can upload images
CREATE POLICY "Athletes can upload images"
  ON session_images FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Athletes can delete their own images
CREATE POLICY "Athletes can delete own images"
  ON session_images FOR DELETE
  USING (athlete_id = auth.uid());

