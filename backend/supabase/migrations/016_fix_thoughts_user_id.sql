-- Migration: 016_fix_thoughts_user_id.sql
-- Description: Fix thoughts table to auto-populate user_id and set default expires_at
-- Sprint: 3.4 (Post-SIWE Bug Fixes)
-- Date: 2025-11-04

-- 1. Make user_id optional and add default
ALTER TABLE public.thoughts
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Add default for expires_at (7 days from now)
ALTER TABLE public.thoughts
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

-- 3. Create trigger to auto-populate user_id if not provided
CREATE OR REPLACE FUNCTION public.set_thought_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not set, use the authenticated user's ID
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires before insert
DROP TRIGGER IF EXISTS set_thought_user_id_trigger ON public.thoughts;
CREATE TRIGGER set_thought_user_id_trigger
  BEFORE INSERT ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_thought_user_id();

-- 4. Backfill existing thoughts with user_id based on wallet_address
-- Match wallet_address in thoughts to wallet_address in profiles to get user_id
UPDATE public.thoughts t
SET user_id = p.id
FROM public.profiles p
WHERE t.wallet_address = p.wallet_address
  AND t.user_id IS NULL;

-- 5. Now make user_id required again (after backfill)
ALTER TABLE public.thoughts
  ALTER COLUMN user_id SET NOT NULL;

COMMENT ON FUNCTION public.set_thought_user_id() IS 'Automatically sets user_id to auth.uid() if not provided when inserting a thought.';
