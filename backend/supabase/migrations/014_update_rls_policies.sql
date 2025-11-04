-- Migration: 014_update_rls_policies.sql
-- Description: Update RLS policies to use auth.uid() instead of custom JWT
-- Sprint: 3.3 (SIWE Native Migration)
-- Date: 2025-11-04

-- =====================================================
-- THOUGHTS TABLE: Update RLS Policies
-- =====================================================

-- Drop all old policies on thoughts table
DROP POLICY IF EXISTS "Users can view their own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can insert their own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can update their own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can delete their own unminted thoughts" ON public.thoughts;

-- Drop old dev policies if they exist
DROP POLICY IF EXISTS "Dev: Allow anonymous inserts" ON public.thoughts;
DROP POLICY IF EXISTS "Dev: Allow anonymous reads" ON public.thoughts;
DROP POLICY IF EXISTS "Dev: Allow anonymous updates" ON public.thoughts;
DROP POLICY IF EXISTS "Dev: Allow anonymous deletes of unminted" ON public.thoughts;

-- Create new RLS policies using auth.uid()
-- These policies are simpler and more secure than custom JWT parsing

-- Policy: Users can view their own thoughts
CREATE POLICY "Users can view own thoughts"
  ON public.thoughts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own thoughts
CREATE POLICY "Users can insert own thoughts"
  ON public.thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own thoughts
CREATE POLICY "Users can update own thoughts"
  ON public.thoughts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own thoughts (both minted and unminted)
-- Note: Changed from previous policy that only allowed unminted deletes
CREATE POLICY "Users can delete own thoughts"
  ON public.thoughts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USERS TABLE: Drop old policies (table will be deleted)
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Dev: Allow anonymous user creation" ON public.users;
DROP POLICY IF EXISTS "Dev: Allow anonymous user reads" ON public.users;

-- =====================================================
-- AUTH_NONCES TABLE: Drop policies (table will be deleted)
-- =====================================================

DROP POLICY IF EXISTS "Service role can manage nonces" ON public.auth_nonces;
DROP POLICY IF EXISTS "Block anonymous access" ON public.auth_nonces;

-- =====================================================
-- COMMENTS & LOGGING
-- =====================================================

COMMENT ON TABLE public.thoughts IS
  'Journal entries with RLS using auth.uid() from Supabase native Web3 auth. Updated in Sprint 3.3.';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated to use auth.uid() from Supabase native auth';
  RAISE NOTICE '✅ Old custom JWT policies removed';
  RAISE NOTICE '✅ Development policies removed';
END $$;
