-- =====================================================
-- FIX: Add INSERT policy for users table
-- =====================================================
-- Issue: The trigger_create_user trigger tries to auto-create user records
-- when thoughts are inserted, but the users table has no INSERT policy.
-- This causes RLS error: "new row violates row-level security policy for table users"
-- =====================================================

-- Users can insert their own profile (auto-created by trigger)
CREATE POLICY "Users can insert their own profile"
    ON users
    FOR INSERT
    WITH CHECK (wallet_address = auth.jwt()->>'wallet_address');

-- Update table comment
COMMENT ON TABLE users IS
  'User accounts with JWT-based RLS enforcement. SIWE authentication required.';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Users INSERT policy added. Auto-user-creation trigger will now work with production RLS.';
END $$;
