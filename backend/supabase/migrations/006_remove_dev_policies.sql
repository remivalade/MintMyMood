-- =====================================================
-- REMOVE TEMPORARY DEV POLICIES - ACTIVATE PRODUCTION RLS
-- =====================================================
-- WARNING: This migration makes authentication REQUIRED.
-- Do not run until SIWE implementation is complete and tested.
-- =====================================================

-- Drop temporary dev policies on thoughts table
DROP POLICY IF EXISTS "Dev: Allow anonymous inserts" ON thoughts;
DROP POLICY IF EXISTS "Dev: Allow anonymous reads" ON thoughts;
DROP POLICY IF EXISTS "Dev: Allow anonymous updates" ON thoughts;
DROP POLICY IF EXISTS "Dev: Allow anonymous deletes of unminted" ON thoughts;

-- Drop temporary dev policies on users table
DROP POLICY IF EXISTS "Dev: Allow anonymous user creation" ON users;
DROP POLICY IF EXISTS "Dev: Allow anonymous user reads" ON users;

-- =====================================================
-- PRODUCTION RLS POLICIES NOW ACTIVE
-- =====================================================
-- From migration 002_row_level_security.sql:
--
-- ✅ "Users can view their own thoughts"
--    USING (wallet_address = auth.jwt()->>'wallet_address')
--
-- ✅ "Users can insert their own thoughts"
--    WITH CHECK (wallet_address = auth.jwt()->>'wallet_address')
--
-- ✅ "Users can update their own thoughts"
--    USING (wallet_address = auth.jwt()->>'wallet_address')
--
-- ✅ "Users can delete their own unminted thoughts"
--    USING (wallet_address = auth.jwt()->>'wallet_address' AND is_minted = FALSE)
--
-- ✅ "Service role can delete expired thoughts"
--    FOR DELETE TO service_role (for cron cleanup)
--
-- All policies enforce JWT authentication with wallet_address claim.
-- No anonymous access allowed.
-- =====================================================

-- Update table comments to reflect production status
COMMENT ON TABLE thoughts IS
  'Journal entries with JWT-based RLS enforcement. SIWE authentication required.';

COMMENT ON TABLE users IS
  'User accounts with JWT-based RLS enforcement. SIWE authentication required.';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Production RLS policies now active. Anonymous access disabled.';
  RAISE NOTICE 'SIWE authentication is now REQUIRED for all operations.';
END $$;
