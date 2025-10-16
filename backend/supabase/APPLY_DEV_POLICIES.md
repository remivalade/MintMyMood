# Apply Development RLS Policies

## Issue
The app is getting "new row violates row-level security policy" errors because we haven't implemented proper wallet authentication (SIWE) yet.

## Temporary Solution
We need to add development-only RLS policies that allow operations without authentication.

## Steps to Apply

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project: `hkzvnpksjpxfsyiqyhpk`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the SQL Below**
   - Copy the entire SQL from `004_temporary_dev_policies.sql`
   - Paste it into the SQL editor

4. **Run the Query**
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for "Success" message

## The SQL to Run

```sql
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
```

## Verification

After running the SQL:

1. **Check Policies**
   - In Supabase Dashboard, go to "Authentication" → "Policies"
   - You should see new policies with "Dev: " prefix

2. **Test the App**
   - Refresh http://localhost:3000
   - Try saving a thought
   - Should work now!

## Important Notes

⚠️ **These policies bypass authentication!**
- Only use for development
- Remove before production deployment
- We'll implement proper SIWE authentication in a future sprint

## What's Next

Once this works, we'll implement proper authentication using:
- **SIWE (Sign-In with Ethereum)** for wallet-based authentication
- Proper JWT tokens with wallet address in claims
- Remove these dev policies

---

**File Location**: `backend/supabase/migrations/004_temporary_dev_policies.sql`
