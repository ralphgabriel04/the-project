-- Add unsubscribe tracking for LCAP compliance.
-- Every commercial email must include a working unsubscribe mechanism,
-- so we store a per-subscriber token and a timestamp when they opt out.

ALTER TABLE public.waitlist_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Backfill existing rows with a random token.
UPDATE public.waitlist_subscribers
SET unsubscribe_token = gen_random_uuid()::text
WHERE unsubscribe_token IS NULL;

-- New rows get one by default.
ALTER TABLE public.waitlist_subscribers
  ALTER COLUMN unsubscribe_token SET DEFAULT gen_random_uuid()::text;

-- Unique lookup index (partial — allow NULL during backfill just in case).
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_unsubscribe_token
  ON public.waitlist_subscribers(unsubscribe_token)
  WHERE unsubscribe_token IS NOT NULL;
