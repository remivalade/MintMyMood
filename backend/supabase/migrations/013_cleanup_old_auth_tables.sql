-- Migration: 013_cleanup_old_auth_tables.sql
-- Description: Remove old custom auth tables (users, auth_nonces)
-- Sprint: 3.3 (SIWE Native Migration)
-- Date: 2025-11-04
-- WARNING: This is a destructive migration. Only run in development!

-- =====================================================
-- DROP OLD AUTH TABLES
-- =====================================================

-- Drop auth_nonces table (used for custom SIWE nonce management)
-- No longer needed - Supabase manages nonces internally
DROP TABLE IF EXISTS public.auth_nonces CASCADE;

-- Drop users table (replaced by auth.users + profiles)
-- CASCADE will drop any remaining foreign keys
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- DROP OLD TRIGGERS & FUNCTIONS
-- =====================================================

-- Drop any remaining triggers related to old users table
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;

-- Drop old update function if it's no longer used
-- Note: We keep update_updated_at_column() as it's still used by thoughts table
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- VERIFY CLEANUP
-- =====================================================

-- Log what was removed
DO $$
BEGIN
  RAISE NOTICE '🗑️  Dropped table: public.auth_nonces';
  RAISE NOTICE '🗑️  Dropped table: public.users';
  RAISE NOTICE '✅ Cleanup complete - old custom auth tables removed';
  RAISE NOTICE '📝 New architecture uses:';
  RAISE NOTICE '   - auth.users (Supabase managed)';
  RAISE NOTICE '   - public.profiles (wallet addresses)';
  RAISE NOTICE '   - public.thoughts (linked to auth.users via user_id)';
END $$;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================

-- This migration removes:
-- 1. auth_nonces table - Nonce management now handled by Supabase
-- 2. users table - Replaced by auth.users (managed) + profiles (public data)

-- After this migration:
-- ✅ Authentication uses Supabase signInWithWeb3()
-- ✅ User identity stored in auth.users (secured)
-- ✅ Public metadata in profiles table (wallet_address, ens_name)
-- ✅ RLS policies use auth.uid() (simple and secure)

-- Migration order is important:
-- 1. 011_create_profiles_table.sql (create new table)
-- 2. 012_update_thoughts_user_id.sql (update foreign keys)
-- 3. 013_cleanup_old_auth_tables.sql (THIS FILE - remove old tables)
-- 4. 014_update_rls_policies.sql (update security policies)
