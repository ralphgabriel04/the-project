-- ============================================
-- Migration: Fix RLS infinite recursion
-- Problem: programs <-> program_assignments circular dependency
-- ============================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Athletes can view assigned programs" ON programs;
DROP POLICY IF EXISTS "Coaches can view program assignments" ON program_assignments;
DROP POLICY IF EXISTS "Coaches can assign programs" ON program_assignments;
DROP POLICY IF EXISTS "Coaches can update assignments" ON program_assignments;

-- ============================================
-- Create helper function to check program ownership
-- Using SECURITY DEFINER to bypass RLS
-- ============================================
CREATE OR REPLACE FUNCTION is_program_coach(p_program_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM programs 
    WHERE id = p_program_id 
      AND coach_id = p_user_id 
      AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create helper function to check athlete assignment
-- Using SECURITY DEFINER to bypass RLS
-- ============================================
CREATE OR REPLACE FUNCTION is_program_assigned_to_athlete(p_program_id UUID, p_athlete_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM program_assignments 
    WHERE program_id = p_program_id 
      AND athlete_id = p_athlete_id 
      AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Recreate PROGRAMS policies without recursion
-- ============================================

-- Athletes can view programs assigned to them (using SECURITY DEFINER function)
CREATE POLICY "Athletes can view assigned programs"
  ON programs FOR SELECT
  USING (
    is_deleted = FALSE
    AND is_program_assigned_to_athlete(id, auth.uid())
  );

-- ============================================
-- Recreate PROGRAM_ASSIGNMENTS policies without recursion
-- ============================================

-- Coaches can view their program assignments (using SECURITY DEFINER function)
CREATE POLICY "Coaches can view program assignments"
  ON program_assignments FOR SELECT
  USING (
    is_program_coach(program_id, auth.uid())
    AND is_deleted = FALSE
  );

-- Coaches can assign programs to their athletes
CREATE POLICY "Coaches can assign programs"
  ON program_assignments FOR INSERT
  WITH CHECK (
    is_program_coach(program_id, auth.uid())
    AND is_athlete_coach(auth.uid(), athlete_id)
  );

-- Coaches can update assignments
CREATE POLICY "Coaches can update assignments"
  ON program_assignments FOR UPDATE
  USING (
    is_program_coach(program_id, auth.uid())
  );








