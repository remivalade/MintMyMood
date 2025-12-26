-- ============================================================================
-- Optimize RLS Policies for Performance
-- ============================================================================
-- This script fixes the "Auth RLS Initialization Plan" warnings by wrapping
-- auth.uid() in SELECT subqueries to prevent re-evaluation for each row.
--
-- Performance Impact: Significantly faster queries when scanning many rows
-- Risk: Very low - just optimizing function calls
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE - 2 policies to optimize
-- ============================================================================

-- Fix: Users can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

-- Fix: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);


-- ============================================================================
-- THOUGHTS TABLE - 4 policies to optimize
-- ============================================================================

-- Fix: Users can view own thoughts
DROP POLICY IF EXISTS "Users can view own thoughts" ON public.thoughts;
CREATE POLICY "Users can view own thoughts"
ON public.thoughts FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix: Users can insert own thoughts
DROP POLICY IF EXISTS "Users can insert own thoughts" ON public.thoughts;
CREATE POLICY "Users can insert own thoughts"
ON public.thoughts FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix: Users can update own thoughts
DROP POLICY IF EXISTS "Users can update own thoughts" ON public.thoughts;
CREATE POLICY "Users can update own thoughts"
ON public.thoughts FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix: Users can delete own thoughts
DROP POLICY IF EXISTS "Users can delete own thoughts" ON public.thoughts;
CREATE POLICY "Users can delete own thoughts"
ON public.thoughts FOR DELETE
USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ RLS Policies Optimized!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Updated policies:';
    RAISE NOTICE '  Profiles: 2 policies';
    RAISE NOTICE '  Thoughts: 4 policies';
    RAISE NOTICE '';
    RAISE NOTICE 'Performance improvement:';
    RAISE NOTICE '  - auth.uid() now evaluated once per query';
    RAISE NOTICE '  - Faster queries when scanning many rows';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Verify warnings are gone in Database → Advisors';
END $$;
