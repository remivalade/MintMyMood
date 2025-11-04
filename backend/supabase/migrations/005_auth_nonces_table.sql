-- =====================================================
-- AUTH NONCES TABLE
-- =====================================================
-- Stores SIWE authentication nonces for Sign-In with Ethereum
-- CTO Decision: Use Supabase instead of Redis for $0 cost
-- =====================================================

CREATE TABLE IF NOT EXISTS public.auth_nonces (
  wallet_address TEXT PRIMARY KEY,
  nonce TEXT NOT NULL CHECK (char_length(nonce) >= 8), -- EIP-4361 minimum
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup query performance
CREATE INDEX idx_nonces_expires_at ON public.auth_nonces (expires_at);

-- Enable RLS (only service role can access)
ALTER TABLE public.auth_nonces ENABLE ROW LEVEL SECURITY;

-- Service role policy (backend API only)
CREATE POLICY "Service role can manage nonces"
  ON public.auth_nonces
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Prevent user access (authentication should not be user-accessible)
CREATE POLICY "Block anonymous access"
  ON public.auth_nonces
  FOR ALL
  TO anon
  USING (false);

-- Set up automatic cleanup with pg_cron
SELECT cron.schedule(
  'cleanup-expired-nonces',
  '0 * * * *', -- Every hour at :00
  $$DELETE FROM public.auth_nonces WHERE expires_at < NOW()$$
);

-- Comments for documentation
COMMENT ON TABLE public.auth_nonces IS
  'SIWE nonces for authentication. Managed by backend only. Auto-cleaned hourly via pg_cron.';

COMMENT ON COLUMN public.auth_nonces.wallet_address IS
  'Primary key. One nonce per wallet at a time (UPSERT on conflict).';

COMMENT ON COLUMN public.auth_nonces.nonce IS
  'Random nonce (min 8 chars per EIP-4361). Single-use for replay protection.';

COMMENT ON COLUMN public.auth_nonces.expires_at IS
  '5-minute expiry from creation. Prevents stale nonce attacks.';
