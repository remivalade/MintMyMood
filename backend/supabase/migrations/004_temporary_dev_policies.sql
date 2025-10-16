-- =====================================================
-- TEMPORARY DEV POLICIES
-- =====================================================
-- These policies allow operations without JWT authentication
-- for development/testing purposes
--
-- TODO: Remove these and implement proper SIWE authentication
-- before production deployment
-- =====================================================

-- Allow anonymous users to insert thoughts (development only)
CREATE POLICY "Dev: Allow anonymous inserts"
    ON thoughts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to view all thoughts (development only)
CREATE POLICY "Dev: Allow anonymous reads"
    ON thoughts
    FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous users to update thoughts (development only)
CREATE POLICY "Dev: Allow anonymous updates"
    ON thoughts
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to delete unminted thoughts (development only)
CREATE POLICY "Dev: Allow anonymous deletes of unminted"
    ON thoughts
    FOR DELETE
    TO anon
    USING (is_minted = FALSE);

-- Allow anonymous users to insert users (development only)
CREATE POLICY "Dev: Allow anonymous user creation"
    ON users
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to view users (development only)
CREATE POLICY "Dev: Allow anonymous user reads"
    ON users
    FOR SELECT
    TO anon
    USING (true);

-- =====================================================
-- WARNING COMMENTS
-- =====================================================

COMMENT ON POLICY "Dev: Allow anonymous inserts" ON thoughts IS
    'DEVELOPMENT ONLY - Remove before production! Allows inserts without authentication.';

COMMENT ON POLICY "Dev: Allow anonymous reads" ON thoughts IS
    'DEVELOPMENT ONLY - Remove before production! Allows reads without authentication.';

COMMENT ON POLICY "Dev: Allow anonymous updates" ON thoughts IS
    'DEVELOPMENT ONLY - Remove before production! Allows updates without authentication.';

COMMENT ON POLICY "Dev: Allow anonymous deletes of unminted" ON thoughts IS
    'DEVELOPMENT ONLY - Remove before production! Allows deletes without authentication.';

COMMENT ON POLICY "Dev: Allow anonymous user creation" ON users IS
    'DEVELOPMENT ONLY - Remove before production! Allows user creation without authentication.';

COMMENT ON POLICY "Dev: Allow anonymous user reads" ON users IS
    'DEVELOPMENT ONLY - Remove before production! Allows user reads without authentication.';
