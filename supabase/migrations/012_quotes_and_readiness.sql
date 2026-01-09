-- ============================================
-- THE PROJECT - Motivational Quotes & Readiness System
-- ============================================
-- Adds motivational quotes, coach messages, and readiness tracking
-- Run this AFTER 011_fix_messaging_rls.sql
-- ============================================

-- ============================================
-- 1. MOTIVATIONAL QUOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS motivational_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'general', -- 'strength', 'endurance', 'mental', 'general'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. COACH MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  display_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE, -- Optional expiration
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_coach_messages_athlete
  ON coach_messages(athlete_id, display_date)
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_coach_messages_coach
  ON coach_messages(coach_id)
  WHERE is_deleted = FALSE;

-- ============================================
-- 3. READINESS LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS readiness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Manual input scores (1-10)
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  muscle_soreness INTEGER CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10), -- 10 = no soreness
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10), -- 10 = no stress

  -- Calculated overall score
  overall_score DECIMAL(4,2),

  -- Optional notes
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  -- One entry per athlete per day
  CONSTRAINT unique_athlete_date UNIQUE (athlete_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_readiness_logs_athlete_date
  ON readiness_logs(athlete_id, log_date DESC)
  WHERE is_deleted = FALSE;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. MOTIVATIONAL QUOTES POLICIES
-- ============================================

-- Everyone can read active quotes
CREATE POLICY "Anyone can view active quotes"
  ON motivational_quotes FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- 6. COACH MESSAGES POLICIES
-- ============================================

-- Athletes can view messages sent to them
CREATE POLICY "Athletes can view their messages"
  ON coach_messages FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can view messages they sent
CREATE POLICY "Coaches can view sent messages"
  ON coach_messages FOR SELECT
  USING (coach_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can send messages to their athletes
CREATE POLICY "Coaches can send messages to athletes"
  ON coach_messages FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coach_athletes
      WHERE coach_id = auth.uid()
        AND athlete_id = coach_messages.athlete_id
        AND status = 'accepted'
        AND is_deleted = FALSE
    )
  );

-- Athletes can mark their messages as read
CREATE POLICY "Athletes can mark messages as read"
  ON coach_messages FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- ============================================
-- 7. READINESS LOGS POLICIES
-- ============================================

-- Athletes can view their own readiness logs
CREATE POLICY "Athletes can view own readiness"
  ON readiness_logs FOR SELECT
  USING (athlete_id = auth.uid() AND is_deleted = FALSE);

-- Coaches can view their athletes' readiness logs
CREATE POLICY "Coaches can view athletes readiness"
  ON readiness_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_athletes
      WHERE coach_id = auth.uid()
        AND athlete_id = readiness_logs.athlete_id
        AND status = 'accepted'
        AND is_deleted = FALSE
    )
    AND is_deleted = FALSE
  );

-- Athletes can create readiness logs
CREATE POLICY "Athletes can create readiness"
  ON readiness_logs FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Athletes can update their own readiness logs
CREATE POLICY "Athletes can update own readiness"
  ON readiness_logs FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- Update timestamp trigger for readiness_logs
CREATE TRIGGER update_readiness_logs_updated_at
  BEFORE UPDATE ON readiness_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. SEED DATA - FRENCH MOTIVATIONAL QUOTES
-- ============================================

INSERT INTO motivational_quotes (content, author, category) VALUES
('La douleur est temporaire, l''abandon est definitif.', 'Eric Thomas', 'mental'),
('Le succes n''est pas donne. Il se merite.', NULL, 'general'),
('Chaque repetition te rapproche de ton objectif.', NULL, 'strength'),
('Le corps atteint ce que l''esprit croit.', NULL, 'mental'),
('Ne compte pas les jours, fais que les jours comptent.', 'Muhammad Ali', 'general'),
('La seule mauvaise seance est celle que tu n''as pas faite.', NULL, 'general'),
('Tu es plus fort que tu ne le penses.', NULL, 'strength'),
('L''excellence est une habitude, pas un acte isole.', 'Aristote', 'mental'),
('Repousse tes limites chaque jour.', NULL, 'general'),
('Le travail finit toujours par payer.', NULL, 'general'),
('Ton seul adversaire, c''est toi-meme.', NULL, 'mental'),
('Transforme tes excuses en motivation.', NULL, 'general'),
('Chaque jour est une nouvelle chance de progresser.', NULL, 'general'),
('La discipline est le pont entre les objectifs et les resultats.', 'Jim Rohn', 'mental'),
('Sois plus fort que ton excuse la plus forte.', NULL, 'mental'),
('Le talent gagne des matchs, mais le travail d''equipe gagne des championnats.', 'Michael Jordan', 'general'),
('La sueur d''aujourd''hui est le succes de demain.', NULL, 'strength'),
('Impossible n''est pas un fait, c''est une opinion.', 'Muhammad Ali', 'mental'),
('Les champions continuent de jouer jusqu''a ce qu''ils y arrivent.', 'Billie Jean King', 'endurance'),
('La force ne vient pas du physique. Elle vient d''une volonte indomptable.', 'Gandhi', 'strength');
