-- Create waitlist_subscribers table for Issue #39
-- Sprint 2 — Cadence Landing Page Teasing

CREATE TABLE IF NOT EXISTS public.waitlist_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing_page',
  referral_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT FALSE
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_email ON public.waitlist_subscribers(email);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_created_at ON public.waitlist_subscribers(created_at);

-- Enable Row Level Security
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only allow inserts via authenticated service role
-- No direct client access (all operations go through API route)
CREATE POLICY "Service role can insert subscribers"
  ON public.waitlist_subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can select subscribers"
  ON public.waitlist_subscribers
  FOR SELECT
  TO service_role
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.waitlist_subscribers IS 'Waitlist email subscribers for Cadence landing page teasing (Issue #39)';
COMMENT ON COLUMN public.waitlist_subscribers.source IS 'Where the subscriber signed up from (e.g., landing_page, social, referral)';
COMMENT ON COLUMN public.waitlist_subscribers.referral_code IS 'Optional referral code for viral loop tracking';
COMMENT ON COLUMN public.waitlist_subscribers.confirmed IS 'Whether the email has been confirmed (for future double opt-in)';
