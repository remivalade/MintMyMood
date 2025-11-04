-- =====================================================
-- REMOVE USER CREATION TRIGGER (No Longer Needed)
-- =====================================================
-- Users are now created during SIWE authentication (backend handles it)
-- This trigger is redundant and causes RLS issues
-- =====================================================

-- Drop the trigger and function
DROP TRIGGER IF EXISTS trigger_create_user ON thoughts;
DROP FUNCTION IF EXISTS create_user_if_not_exists() CASCADE;

-- Make user_id nullable since it's set by the backend during auth
-- (It's already nullable in the schema, but let's be explicit)
ALTER TABLE thoughts ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining the new flow
COMMENT ON COLUMN thoughts.user_id IS
  'Reference to users table. Set automatically during authentication, not by trigger.';

-- Update table comment
COMMENT ON TABLE users IS
  'User accounts created during SIWE authentication. No auto-creation trigger needed.';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'User creation trigger removed. Users are now created during SIWE authentication.';
END $$;
