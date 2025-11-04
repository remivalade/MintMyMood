-- =====================================================
-- FIX: Make user creation trigger bypass RLS
-- =====================================================
-- Issue: The trigger function runs with the permissions of the calling user,
-- so RLS blocks the INSERT into users table even with an INSERT policy.
-- Solution: Add SECURITY DEFINER to the trigger function so it runs with
-- the permissions of the function owner (postgres superuser).
-- =====================================================

-- Drop the old trigger function
DROP FUNCTION IF EXISTS create_user_if_not_exists() CASCADE;

-- Recreate with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION create_user_if_not_exists()
RETURNS TRIGGER
SECURITY DEFINER  -- This makes it run with elevated permissions
SET search_path = public
AS $$
BEGIN
    -- Insert user if not exists (this now bypasses RLS)
    INSERT INTO users (wallet_address)
    VALUES (NEW.wallet_address)
    ON CONFLICT (wallet_address) DO NOTHING;

    -- Set user_id from users table
    SELECT id INTO NEW.user_id
    FROM users
    WHERE wallet_address = NEW.wallet_address;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_create_user
    BEFORE INSERT ON thoughts
    FOR EACH ROW
    EXECUTE FUNCTION create_user_if_not_exists();

-- We can now drop the INSERT policy we added in migration 007
-- since the trigger bypasses RLS
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Update comment
COMMENT ON FUNCTION create_user_if_not_exists() IS
  'Auto-creates user records when thoughts are inserted. Runs with SECURITY DEFINER to bypass RLS.';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Trigger function updated with SECURITY DEFINER. User auto-creation now bypasses RLS.';
END $$;
