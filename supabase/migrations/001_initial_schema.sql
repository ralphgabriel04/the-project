-- ============================================
-- THE PROJECT - Initial Database Schema
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CUSTOM TYPES (ENUMS)
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('coach', 'athlete');

-- Coach-athlete relationship status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');

-- Program status
CREATE TYPE program_status AS ENUM ('draft', 'active', 'archived');

-- ============================================
-- 3. TABLES
-- ============================================

-- ------------------------------------
-- PROFILES (extends auth.users)
-- ------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role) WHERE is_deleted = FALSE;

-- ------------------------------------
-- COACH_ATHLETES (relationships)
-- ------------------------------------
CREATE TABLE coach_athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Prevent duplicate relationships
  CONSTRAINT unique_coach_athlete UNIQUE (coach_id, athlete_id),
  -- Coach and athlete must be different
  CONSTRAINT different_users CHECK (coach_id != athlete_id)
);

CREATE INDEX idx_coach_athletes_coach ON coach_athletes(coach_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_coach_athletes_athlete ON coach_athletes(athlete_id) WHERE is_deleted = FALSE;

-- ------------------------------------
-- PROGRAMS
-- ------------------------------------
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status program_status NOT NULL DEFAULT 'draft',
  duration_weeks INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_programs_coach ON programs(coach_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_programs_status ON programs(status) WHERE is_deleted = FALSE;

-- ------------------------------------
-- PROGRAM_ASSIGNMENTS (program -> athlete)
-- ------------------------------------
CREATE TABLE program_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  
  CONSTRAINT unique_program_athlete UNIQUE (program_id, athlete_id)
);

CREATE INDEX idx_program_assignments_athlete ON program_assignments(athlete_id) WHERE is_deleted = FALSE;

-- ------------------------------------
-- SESSIONS (training sessions in a program)
-- ------------------------------------
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Monday, 7=Sunday
  week_number INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_sessions_program ON sessions(program_id) WHERE is_deleted = FALSE;

-- ------------------------------------
-- EXERCISES (exercises in a session)
-- ------------------------------------
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sets INTEGER,
  reps TEXT, -- Can be "8-12" or "AMRAP"
  rest_seconds INTEGER,
  tempo TEXT, -- e.g., "3-1-2-0"
  notes TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_exercises_session ON exercises(session_id) WHERE is_deleted = FALSE;

-- ------------------------------------
-- SESSION_LOGS (athlete's session completion)
-- ------------------------------------
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  overall_rpe INTEGER CHECK (overall_rpe >= 1 AND overall_rpe <= 10),
  athlete_notes TEXT,
  coach_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_session_logs_athlete ON session_logs(athlete_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_session_logs_session ON session_logs(session_id) WHERE is_deleted = FALSE;

-- ------------------------------------
-- EXERCISE_LOGS (athlete's exercise performance)
-- ------------------------------------
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_log_id UUID NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL(6,2),
  reps_completed INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_exercise_logs_athlete ON exercise_logs(athlete_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_exercise_logs_exercise ON exercise_logs(exercise_id) WHERE is_deleted = FALSE;

-- ------------------------------------
-- SESSION_IMAGES (photos attached to sessions)
-- ------------------------------------
CREATE TABLE session_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_log_id UUID NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_session_images_log ON session_images(session_log_id) WHERE is_deleted = FALSE;

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_coach_athletes_updated_at
  BEFORE UPDATE ON coach_athletes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_program_assignments_updated_at
  BEFORE UPDATE ON program_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_session_logs_updated_at
  BEFORE UPDATE ON session_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exercise_logs_updated_at
  BEFORE UPDATE ON exercise_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Check if user is a coach
CREATE OR REPLACE FUNCTION is_coach(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'coach' AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is athlete's coach
CREATE OR REPLACE FUNCTION is_athlete_coach(coach_user_id UUID, athlete_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM coach_athletes 
    WHERE coach_id = coach_user_id 
      AND athlete_id = athlete_user_id 
      AND status = 'accepted'
      AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get program's coach_id
CREATE OR REPLACE FUNCTION get_program_coach(program_uuid UUID)
RETURNS UUID AS $$
DECLARE
  coach UUID;
BEGIN
  SELECT coach_id INTO coach FROM programs WHERE id = program_uuid;
  RETURN coach;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

