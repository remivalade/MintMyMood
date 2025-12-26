-- ============================================================================
-- Fix Duplicate RLS Policies
-- ============================================================================
-- Issue: Original policies had periods at the end ("Users can insert own profile.")
-- Our script created new ones without periods, resulting in duplicates
-- This script removes ALL versions and creates clean, optimized policies
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE - Remove ALL duplicate policies
-- ============================================================================

-- Drop ALL versions (with and without periods)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile." ON public.profiles;

-- Create clean, optimized policies (no periods, with SELECT optimization)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);


-- ============================================================================
-- THOUGHTS TABLE - Remove ALL duplicate policies
-- ============================================================================

-- Drop ALL versions (with and without periods)
DROP POLICY IF EXISTS "Users can view own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can view own thoughts." ON public.thoughts;

DROP POLICY IF EXISTS "Users can insert own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can insert own thoughts." ON public.thoughts;

DROP POLICY IF EXISTS "Users can update own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can update own thoughts." ON public.thoughts;

DROP POLICY IF EXISTS "Users can delete own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can delete own thoughts." ON public.thoughts;

-- Create clean, optimized policies (no periods, with SELECT optimization)
CREATE POLICY "Users can view own thoughts"
ON public.thoughts FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own thoughts"
ON public.thoughts FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own thoughts"
ON public.thoughts FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own thoughts"
ON public.thoughts FOR DELETE
USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies on profiles
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles';

    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Duplicate Policies Cleaned!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Profiles table: % policies (expected: 3)', policy_count;

    -- Count policies on thoughts
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'thoughts';

    RAISE NOTICE 'Thoughts table: % policies (expected: 4)', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'All policies now optimized with (SELECT auth.uid())';
    RAISE NOTICE '';
    RAISE NOTICE 'Expected result:';
    RAISE NOTICE '  - 0 "Multiple Permissive Policies" warnings';
    RAISE NOTICE '  - 0 "Auth RLS Initialization Plan" warnings';
    RAISE NOTICE '  - 3 "Unused Index" suggestions (intentionally kept)';
    RAISE NOTICE '';
END $$;
