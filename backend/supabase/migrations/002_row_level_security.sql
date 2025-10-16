-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON users
    FOR SELECT
    USING (wallet_address = auth.jwt()->>'wallet_address');

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON users
    FOR UPDATE
    USING (wallet_address = auth.jwt()->>'wallet_address')
    WITH CHECK (wallet_address = auth.jwt()->>'wallet_address');

-- =====================================================
-- THOUGHTS TABLE POLICIES
-- =====================================================

-- Users can view their own thoughts
CREATE POLICY "Users can view their own thoughts"
    ON thoughts
    FOR SELECT
    USING (wallet_address = auth.jwt()->>'wallet_address');

-- Users can insert their own thoughts
CREATE POLICY "Users can insert their own thoughts"
    ON thoughts
    FOR INSERT
    WITH CHECK (wallet_address = auth.jwt()->>'wallet_address');

-- Users can update their own thoughts
-- (Allow updates even after minting for bridge tracking)
CREATE POLICY "Users can update their own thoughts"
    ON thoughts
    FOR UPDATE
    USING (wallet_address = auth.jwt()->>'wallet_address')
    WITH CHECK (wallet_address = auth.jwt()->>'wallet_address');

-- Users can delete their own unminted thoughts
CREATE POLICY "Users can delete their own unminted thoughts"
    ON thoughts
    FOR DELETE
    USING (
        wallet_address = auth.jwt()->>'wallet_address'
        AND is_minted = FALSE
    );

-- =====================================================
-- SERVICE ROLE POLICIES (for backend functions)
-- =====================================================

-- Allow service role to delete expired thoughts
-- (This is used by the cron job)
CREATE POLICY "Service role can delete expired thoughts"
    ON thoughts
    FOR DELETE
    TO service_role
    USING (
        is_minted = FALSE
        AND expires_at < NOW()
    );

-- =====================================================
-- HELPER FUNCTIONS FOR AUTHENTICATION
-- =====================================================

-- Function to verify wallet signature (to be used in Edge Functions)
CREATE OR REPLACE FUNCTION verify_wallet_signature(
    wallet_address TEXT,
    message TEXT,
    signature TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- This is a placeholder - actual signature verification
    -- will be done in the Edge Function using ethers.js
    -- We just validate the format here

    IF wallet_address IS NULL OR signature IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Basic format validation
    IF NOT (wallet_address ~ '^0x[a-fA-F0-9]{40}$') THEN
        RETURN FALSE;
    END IF;

    IF NOT (signature ~ '^0x[a-fA-F0-9]{130}$') THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view their own thoughts" ON thoughts IS
    'Users can only see thoughts from their own wallet address';

COMMENT ON POLICY "Service role can delete expired thoughts" ON thoughts IS
    'Allows the automated cron job to delete expired unminted thoughts';
