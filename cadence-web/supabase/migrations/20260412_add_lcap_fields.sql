-- LCAP (Loi C-28) compliance fields + referral + position
-- Must store consent proof for 3 years per LCAP

ALTER TABLE public.waitlist_subscribers
  ADD COLUMN IF NOT EXISTS consent_text TEXT,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS consent_ip TEXT,
  ADD COLUMN IF NOT EXISTS position INTEGER,
  ADD COLUMN IF NOT EXISTS referred_by TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Generate referral codes for existing rows that don't have one
UPDATE public.waitlist_subscribers
SET referral_code = encode(gen_random_bytes(6), 'hex')
WHERE referral_code IS NULL;

-- Make referral_code unique and auto-generate for new rows
ALTER TABLE public.waitlist_subscribers
  ALTER COLUMN referral_code SET DEFAULT encode(gen_random_bytes(6), 'hex');

-- Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_referral ON public.waitlist_subscribers(referral_code);

-- Index for position ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON public.waitlist_subscribers(position);
