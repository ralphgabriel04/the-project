-- ============================================
-- THE PROJECT - Session Pause Functionality
-- ============================================
-- Allows athletes to pause and resume training sessions
-- Run this AFTER 008_messaging_system.sql
-- ============================================

-- Add pause tracking columns to session_logs
ALTER TABLE session_logs
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_paused_seconds INTEGER DEFAULT 0;

-- Index for finding paused sessions
CREATE INDEX IF NOT EXISTS idx_session_logs_paused
ON session_logs(athlete_id, paused_at)
WHERE paused_at IS NOT NULL AND completed_at IS NULL AND is_deleted = FALSE;
