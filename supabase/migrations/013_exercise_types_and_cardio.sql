-- ============================================
-- THE PROJECT - Exercise Types & Cardio Support
-- ============================================
-- Adds exercise types (strength, cardio, flexibility) and cardio tracking fields
-- Run this AFTER 012_quotes_and_readiness.sql
-- ============================================

-- ============================================
-- 1. CUSTOM ENUM FOR EXERCISE TYPES
-- ============================================

DO $$ BEGIN
    CREATE TYPE exercise_type AS ENUM ('strength', 'cardio', 'flexibility');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. CUSTOM ENUM FOR INTENSITY LEVELS
-- ============================================

DO $$ BEGIN
    CREATE TYPE intensity_level AS ENUM ('easy', 'moderate', 'hard', 'very_hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 3. ALTER EXERCISES TABLE - Add type and cardio target fields
-- ============================================

-- Add exercise_type column with default 'strength' for backward compatibility
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS exercise_type exercise_type NOT NULL DEFAULT 'strength';

-- Add target fields for cardio/flexibility exercises
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS target_distance_km DECIMAL(6,2);

ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS target_duration_minutes INTEGER;

ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS target_heart_rate INTEGER;

ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS intensity intensity_level;

-- Index for filtering by exercise type
CREATE INDEX IF NOT EXISTS idx_exercises_type
ON exercises(exercise_type) WHERE is_deleted = FALSE;

-- ============================================
-- 4. ALTER EXERCISE_LOGS TABLE - Add cardio performance fields
-- ============================================

-- Add cardio-specific logging fields
ALTER TABLE exercise_logs
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(6,2);

ALTER TABLE exercise_logs
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

ALTER TABLE exercise_logs
ADD COLUMN IF NOT EXISTS heart_rate_avg INTEGER;

ALTER TABLE exercise_logs
ADD COLUMN IF NOT EXISTS heart_rate_max INTEGER;

ALTER TABLE exercise_logs
ADD COLUMN IF NOT EXISTS pace_per_km_seconds INTEGER;

-- ============================================
-- 5. ALTER SESSIONS TABLE - Add session type
-- ============================================

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS session_type exercise_type NOT NULL DEFAULT 'strength';

CREATE INDEX IF NOT EXISTS idx_sessions_type
ON sessions(session_type) WHERE is_deleted = FALSE;

-- ============================================
-- 6. FUNCTION: Get last performance for an exercise
-- ============================================

CREATE OR REPLACE FUNCTION get_last_exercise_performance(
  p_exercise_id UUID,
  p_athlete_id UUID
)
RETURNS TABLE (
  log_id UUID,
  completed_at TIMESTAMPTZ,
  -- Strength fields
  weight_kg DECIMAL(6,2),
  reps_completed INTEGER,
  rpe INTEGER,
  -- Cardio fields
  distance_km DECIMAL(6,2),
  duration_minutes INTEGER,
  heart_rate_avg INTEGER,
  pace_per_km_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    el.id as log_id,
    sl.completed_at,
    el.weight_kg,
    el.reps_completed,
    el.rpe,
    el.distance_km,
    el.duration_minutes,
    el.heart_rate_avg,
    el.pace_per_km_seconds
  FROM exercise_logs el
  JOIN session_logs sl ON el.session_log_id = sl.id
  WHERE el.exercise_id = p_exercise_id
    AND el.athlete_id = p_athlete_id
    AND el.is_deleted = FALSE
    AND sl.completed_at IS NOT NULL
  ORDER BY sl.completed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FUNCTION: Get exercise history with stats
-- ============================================

CREATE OR REPLACE FUNCTION get_exercise_history(
  p_exercise_id UUID,
  p_athlete_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  log_id UUID,
  completed_at TIMESTAMPTZ,
  exercise_type exercise_type,
  -- Strength
  weight_kg DECIMAL(6,2),
  reps_completed INTEGER,
  rpe INTEGER,
  -- Cardio
  distance_km DECIMAL(6,2),
  duration_minutes INTEGER,
  heart_rate_avg INTEGER,
  pace_per_km_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    el.id as log_id,
    sl.completed_at,
    e.exercise_type,
    el.weight_kg,
    el.reps_completed,
    el.rpe,
    el.distance_km,
    el.duration_minutes,
    el.heart_rate_avg,
    el.pace_per_km_seconds
  FROM exercise_logs el
  JOIN session_logs sl ON el.session_log_id = sl.id
  JOIN exercises e ON el.exercise_id = e.id
  WHERE el.exercise_id = p_exercise_id
    AND el.athlete_id = p_athlete_id
    AND el.is_deleted = FALSE
    AND sl.completed_at IS NOT NULL
  ORDER BY sl.completed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. VIEW: Sessions with workout summary for calendar
-- ============================================

CREATE OR REPLACE VIEW calendar_sessions AS
SELECT
  s.id,
  s.program_id,
  s.name,
  s.session_type,
  s.day_of_week,
  s.estimated_duration_minutes,
  p.name as program_name,
  p.coach_id,
  p.created_by,
  s.is_deleted
FROM sessions s
JOIN programs p ON s.program_id = p.id
WHERE s.is_deleted = FALSE AND p.is_deleted = FALSE;

-- ============================================
-- 9. Helper function to get intensity label in French
-- ============================================

CREATE OR REPLACE FUNCTION get_intensity_label_fr(p_intensity intensity_level)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE p_intensity
    WHEN 'easy' THEN 'Facile'
    WHEN 'moderate' THEN 'Modéré'
    WHEN 'hard' THEN 'Difficile'
    WHEN 'very_hard' THEN 'Très difficile'
    ELSE 'Non défini'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 10. Helper function to get exercise type label in French
-- ============================================

CREATE OR REPLACE FUNCTION get_exercise_type_label_fr(p_type exercise_type)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE p_type
    WHEN 'strength' THEN 'Musculation'
    WHEN 'cardio' THEN 'Cardio'
    WHEN 'flexibility' THEN 'Mobilité'
    ELSE 'Autre'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
