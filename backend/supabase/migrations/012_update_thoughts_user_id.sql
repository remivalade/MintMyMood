-- Migration: 012_update_thoughts_user_id.sql
-- Description: Update thoughts table to use auth.users instead of public.users
-- Sprint: 3.3 (SIWE Native Migration)
-- Date: 2025-11-04

-- Step 1: Drop old trigger and function (they reference old users table)
DROP TRIGGER IF EXISTS trigger_create_user ON public.thoughts;
DROP FUNCTION IF EXISTS create_user_if_not_exists();

-- Step 2: Drop old foreign key constraint
ALTER TABLE public.thoughts
  DROP CONSTRAINT IF EXISTS thoughts_user_id_fkey;

-- Step 3: Make user_id nullable temporarily (for data migration safety)
ALTER TABLE public.thoughts
  ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Clear existing data (since we're in development)
-- This is safe because user confirmed: "you can break everything on the database if needed"
TRUNCATE TABLE public.thoughts CASCADE;

-- Step 5: Make user_id NOT NULL again
ALTER TABLE public.thoughts
  ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Add new foreign key constraint to auth.users
ALTER TABLE public.thoughts
  ADD CONSTRAINT thoughts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Step 7: Update wallet_address column comment
COMMENT ON COLUMN public.thoughts.wallet_address IS 'Denormalized wallet address for RLS performance (derived from profiles table)';

-- Step 8: Update table comment
COMMENT ON TABLE public.thoughts IS 'Journal entries (ephemeral or minted as NFTs). Updated in Sprint 3.3 to use auth.users.';

-- Step 9: Create helper function to sync wallet_address from profiles
-- This ensures wallet_address stays in sync with the profile
CREATE OR REPLACE FUNCTION sync_thought_wallet_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate wallet_address from profiles table using user_id
  SELECT wallet_address INTO NEW.wallet_address
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- If no profile found, raise error
  IF NEW.wallet_address IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user_id: %. User must create profile first.', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger to auto-sync wallet_address on INSERT
CREATE TRIGGER trigger_sync_wallet_address
  BEFORE INSERT ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION sync_thought_wallet_address();

-- Note: We keep wallet_address column for:
-- 1. RLS policy performance (avoid JOIN in every query)
-- 2. Backwards compatibility with existing frontend code
-- 3. Immutable record of wallet at time of creation
