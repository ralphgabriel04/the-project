-- ============================================
-- THE PROJECT - Athlete CRUD Functions
-- ============================================
-- Allows athletes to delete sessions and exercises in their own programs
-- Run this AFTER 009_session_pause.sql
-- ============================================

-- ============================================
-- 1. SOFT DELETE SESSION FUNCTION
-- ============================================
-- Allows coaches to delete sessions in their programs
-- AND athletes to delete sessions in programs they created

CREATE OR REPLACE FUNCTION soft_delete_session(session_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  program_coach_id UUID;
  program_creator_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Get the program's coach_id and created_by
  SELECT p.coach_id, p.created_by
  INTO program_coach_id, program_creator_id
  FROM sessions s
  JOIN programs p ON s.program_id = p.id
  WHERE s.id = session_uuid;

  -- Check if user is authorized (coach OR creator)
  IF program_coach_id = current_user_id OR program_creator_id = current_user_id THEN
    UPDATE sessions SET is_deleted = TRUE WHERE id = session_uuid;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. SOFT DELETE EXERCISE FUNCTION
-- ============================================
-- Allows coaches to delete exercises in their programs
-- AND athletes to delete exercises in programs they created

CREATE OR REPLACE FUNCTION soft_delete_exercise(exercise_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  program_coach_id UUID;
  program_creator_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Get the program's coach_id and created_by through session
  SELECT p.coach_id, p.created_by
  INTO program_coach_id, program_creator_id
  FROM exercises e
  JOIN sessions s ON e.session_id = s.id
  JOIN programs p ON s.program_id = p.id
  WHERE e.id = exercise_uuid;

  -- Check if user is authorized (coach OR creator)
  IF program_coach_id = current_user_id OR program_creator_id = current_user_id THEN
    UPDATE exercises SET is_deleted = TRUE WHERE id = exercise_uuid;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. SOFT DELETE PROGRAM FUNCTION
-- ============================================
-- Allows coaches to delete their programs
-- AND athletes to delete programs they created

CREATE OR REPLACE FUNCTION soft_delete_program(program_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  program_coach_id UUID;
  program_creator_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Get the program's coach_id and created_by
  SELECT coach_id, created_by
  INTO program_coach_id, program_creator_id
  FROM programs
  WHERE id = program_uuid;

  -- Check if user is authorized (coach OR creator)
  IF program_coach_id = current_user_id OR program_creator_id = current_user_id THEN
    UPDATE programs SET is_deleted = TRUE WHERE id = program_uuid;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
