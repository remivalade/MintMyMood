-- =====================================================
-- FIX RLS POLICIES FOR USER_METADATA WALLET ADDRESS
-- =====================================================
-- Sprint 3.3: Updated JWT structure to use Supabase-compatible format
-- wallet_address is now in user_metadata, not top-level
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can insert their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can update their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can delete their own unminted thoughts" ON thoughts;

-- Recreate policies with correct JWT path
-- auth.jwt()->>'user_metadata'->>'wallet_address' OR auth.jwt()->'user_metadata'->>'wallet_address'

-- Users can view their own thoughts
CREATE POLICY "Users can view their own thoughts"
    ON thoughts
    FOR SELECT
    USING (wallet_address = (auth.jwt() -> 'user_metadata' ->> 'wallet_address'));

-- Users can insert their own thoughts
CREATE POLICY "Users can insert their own thoughts"
    ON thoughts
    FOR INSERT
    WITH CHECK (wallet_address = (auth.jwt() -> 'user_metadata' ->> 'wallet_address'));

-- Users can update their own thoughts
CREATE POLICY "Users can update their own thoughts"
    ON thoughts
    FOR UPDATE
    USING (wallet_address = (auth.jwt() -> 'user_metadata' ->> 'wallet_address'))
    WITH CHECK (wallet_address = (auth.jwt() -> 'user_metadata' ->> 'wallet_address'));

-- Users can delete their own unminted thoughts
CREATE POLICY "Users can delete their own unminted thoughts"
    ON thoughts
    FOR DELETE
    USING (
        wallet_address = (auth.jwt() -> 'user_metadata' ->> 'wallet_address')
        AND is_minted = FALSE
    );

-- Update table comment
COMMENT ON TABLE thoughts IS
  'Journal entries with JWT-based RLS using user_metadata.wallet_address';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated to use auth.jwt()->user_metadata->wallet_address';
END $$;
