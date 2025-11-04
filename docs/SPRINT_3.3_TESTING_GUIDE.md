# Sprint 3.3 Testing Guide - Supabase Native SIWE Migration

## ✅ What's Been Completed

### Phase 1: Database Migration (COMPLETE)
- [x] Created `profiles` table with `auth.users` foreign key
- [x] Updated `thoughts` table to reference `auth.users(id)` via `user_id`
- [x] Updated all RLS policies to use `auth.uid()`
- [x] Removed old `users` and `auth_nonces` tables
- [x] **All migrations applied to Supabase database successfully**

### Phase 2: Backend Refactoring (COMPLETE)
- [x] Removed custom SIWE auth endpoints (`/api/auth/nonce`, `/api/auth/verify`)
- [x] Removed unused dependencies (siwe, jsonwebtoken, uuid, @supabase/supabase-js)
- [x] **Preserved ENS signature service** (`/api/ens-signature`) for minting
- [x] Backend now only handles ENS signatures (~300 lines of auth code removed)

### Phase 3: Frontend Migration (COMPLETE)
- [x] Rewrote `src/hooks/useAuth.ts` - Now uses `supabase.auth.signInWithWeb3()`
- [x] Created `src/store/useAuthStore.ts` with `onAuthStateChange` listener
- [x] Simplified `src/lib/supabase.ts` (removed all custom JWT helpers)
- [x] Updated `src/components/ConnectButton.tsx` (simplified auth trigger)
- [x] Updated `src/App.tsx` (initialize auth store on mount)
- [x] Updated `src/store/useThoughtStore.ts` (RLS-based filtering)
- [x] Updated `src/lib/supabaseHelper.ts` (Supabase native auth error handling)

---

## 🧪 Testing Instructions

### Prerequisites
1. **Install Dependencies** (backend dependencies changed):
   ```bash
   cd backend/api
   npm install
   cd ../..
   ```

2. **Start Backend** (ENS signature service only):
   ```bash
   cd backend/api
   npm start
   ```

   Expected output:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MintMyMood - Backend API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Server running on port 3001
     Signer address: 0xEd171c759450B7358e9238567b1e23b4d82f3a64
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Endpoints:
     GET  http://localhost:3001/api/health
     POST http://localhost:3001/api/ens-signature

   Note: SIWE authentication now handled by Supabase native Web3 auth
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```

---

## Test 1: First-Time Authentication ⭐ **CRITICAL**

**Goal**: Verify wallet can authenticate and create profile

### Steps:
1. Open http://localhost:3000
2. Click "Connect Wallet" button (top right)
3. Select a wallet (Rabby, MetaMask, etc.)
4. Click "Connect" in wallet popup
5. **Wait for SIWE signature request** (should appear automatically)
6. Click "Sign" in wallet to sign the SIWE message

### Expected Behavior:
- ✅ Wallet connects successfully
- ✅ SIWE signature popup appears automatically
- ✅ After signing, you see "Successfully authenticated!" toast
- ✅ "Authenticated" badge appears in ConnectButton (green)
- ✅ **Console logs**:
  ```
  [useAuth] Starting SIWE authentication for 0x...
  [useAuth] Received SIWE message from Supabase
  [useAuth] Signature received
  [useAuth] Verifying signature with Supabase...
  [useAuth] ✅ Signature verified! User ID: <uuid>
  [useAuth] Creating profile in public.profiles...
  [useAuth] ✅ Profile created/updated
  [useAuthStore] Auth event: SIGNED_IN
  [useAuthStore] User authenticated: <uuid>
  [useAuthStore] State updated. Wallet: 0x...
  ```

### Database Verification:
```sql
-- Check auth.users table
SELECT id, email, created_at FROM auth.users;
-- Should see 1 row with email like "0x...@wallet.local"

-- Check public.profiles table
SELECT * FROM public.profiles;
-- Should see 1 row linking auth.users.id to wallet_address
```

---

## Test 2: Session Persistence 📝 **CRITICAL**

**Goal**: Verify session persists across page reloads

### Steps:
1. After completing Test 1 (authenticated)
2. **Refresh the page** (Cmd+R or F5)
3. DO NOT disconnect wallet

### Expected Behavior:
- ✅ Page reloads
- ✅ Wallet still connected
- ✅ "Authenticated" badge appears immediately (no signature prompt)
- ✅ No SIWE popup
- ✅ **Console logs**:
  ```
  [useAuthStore] Initializing auth store...
  [useAuthStore] Active session found for user: <uuid>
  [useAuthStore] Session restored. Wallet: 0x...
  ```

---

## Test 3: Thought Creation 💭 **CRITICAL**

**Goal**: Verify thoughts can be created with new schema

### Steps:
1. Ensure you're authenticated (from Test 1)
2. Click "New Entry" or navigate to writing interface
3. Type a thought (e.g., "Testing Supabase native auth!")
4. Click "Continue"
5. Select a mood
6. Click "Save Draft" (do NOT mint yet)

### Expected Behavior:
- ✅ Thought saves successfully
- ✅ Toast: "Draft saved"
- ✅ Thought appears in Gallery
- ✅ **Database verification**:
  ```sql
  SELECT id, user_id, wallet_address, text, is_minted
  FROM thoughts;
  -- Should see 1 row with:
  -- - user_id = auth.users.id (UUID)
  -- - wallet_address = your wallet (lowercase)
  -- - is_minted = false
  ```

---

## Test 4: Gallery Access (RLS) 🔒 **CRITICAL**

**Goal**: Verify RLS policies work with `auth.uid()`

### Steps:
1. Ensure you have at least 1 thought (from Test 3)
2. Navigate to /gallery
3. **Open browser DevTools > Console**
4. Look for database queries

### Expected Behavior:
- ✅ Gallery loads successfully
- ✅ Shows only YOUR thoughts (RLS filtering)
- ✅ No RLS errors in console
- ✅ **Console logs**:
  ```
  [useThoughtStore] Fetching thoughts...
  (No wallet_address filter needed - RLS handles it!)
  ```

---

## Test 5: Sign Out ⏏️

**Goal**: Verify sign out clears session

### Steps:
1. While authenticated, click "Disconnect" in wallet
2. Or use RainbowKit's account modal to disconnect

### Expected Behavior:
- ✅ "Signed out" toast appears
- ✅ "Authenticated" badge disappears
- ✅ Gallery becomes empty (RLS blocks access)
- ✅ **Console logs**:
  ```
  [useAuth] Signing out...
  [useAuth] ✅ Signed out successfully
  [useAuthStore] Auth event: SIGNED_OUT
  [useAuthStore] User signed out
  ```

---

## Test 6: Re-Authentication 🔄

**Goal**: Verify user can sign in again with same wallet

### Steps:
1. After Test 5 (signed out)
2. Click "Connect Wallet" again
3. Connect same wallet
4. Sign SIWE message

### Expected Behavior:
- ✅ Authentication succeeds
- ✅ Profile already exists (no duplicate created)
- ✅ Previous thoughts appear in gallery
- ✅ **Database verification**:
  ```sql
  SELECT COUNT(*) FROM auth.users;
  -- Should still be 1 (no duplicate)

  SELECT COUNT(*) FROM public.profiles;
  -- Should still be 1 (no duplicate)
  ```

---

## Test 7: Wallet Switch 🔀

**Goal**: Verify switching wallets triggers new authentication

### Steps:
1. Authenticated with Wallet A
2. Switch to Wallet B in RainbowKit
3. Connect Wallet B

### Expected Behavior:
- ✅ "Auth mismatch" badge appears
- ✅ Click it to re-authenticate
- ✅ SIWE signature request appears
- ✅ After signing, authenticated with Wallet B
- ✅ Gallery shows Wallet B's thoughts (not Wallet A's)

---

## Test 8: ENS Signature Service (Minting) 🎨 **OPTIONAL**

**Goal**: Verify ENS signature service still works

### Steps:
1. Authenticated and have a thought
2. Click "Mint" on a thought
3. Go through minting flow
4. Sign the minting transaction

### Expected Behavior:
- ✅ Backend `/api/ens-signature` endpoint is called
- ✅ Signature returned successfully
- ✅ Minting transaction submitted
- ✅ Thought marked as minted in database

---

## 🐛 Troubleshooting

### Issue: "No message received from Supabase"
**Cause**: Supabase Web3 auth not enabled
**Fix**: Check Supabase Dashboard > Authentication > Providers > Web3
Enable "Sign in with Ethereum"

### Issue: "Profile creation failed"
**Cause**: RLS policy blocking insert
**Fix**: Verify RLS policy on `profiles` table:
```sql
CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Issue: "Session expired" on every request
**Cause**: Supabase client not initialized
**Fix**: Check `App.tsx` - ensure `useAuthStore.getState().initialize()` is called

### Issue: Thoughts not appearing in gallery
**Cause**: RLS blocking access
**Fix**: Verify you're authenticated and RLS policies exist:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'thoughts';
-- rowsecurity should be 't' (true)

-- Check policies exist
SELECT policyname FROM pg_policies
WHERE tablename = 'thoughts';
-- Should see 4 policies (SELECT, INSERT, UPDATE, DELETE)
```

### Issue: Backend throws "Cannot find module 'siwe'"
**Cause**: Dependencies not updated
**Fix**:
```bash
cd backend/api
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Expected Database State After All Tests

```sql
-- auth.users (Supabase managed)
SELECT id, email, created_at FROM auth.users;
-- 1-2 rows (depending on if you tested wallet switch)

-- public.profiles
SELECT id, wallet_address, created_at FROM public.profiles;
-- 1-2 rows (one per wallet tested)

-- public.thoughts
SELECT id, user_id, wallet_address, text, is_minted FROM thoughts;
-- 1+ rows (your test thoughts)

-- Verify foreign keys
SELECT
  t.id,
  t.user_id,
  u.email,
  p.wallet_address
FROM thoughts t
JOIN auth.users u ON t.user_id = u.id
JOIN profiles p ON u.id = p.id;
-- Should show all thoughts with their user linkage
```

---

## ✅ Success Criteria

Sprint 3.3 is successful if ALL of these pass:

- [ ] Test 1: First-time authentication creates user + profile ✅
- [ ] Test 2: Session persists across page reloads ✅
- [ ] Test 3: Thoughts save with `user_id` (not just `wallet_address`) ✅
- [ ] Test 4: Gallery shows only user's own thoughts (RLS working) ✅
- [ ] Test 5: Sign out clears session properly ✅
- [ ] Test 6: Re-authentication doesn't create duplicates ✅
- [ ] Test 7: Wallet switch triggers re-authentication ✅
- [ ] Test 8: ENS signature service still works (optional) ✅

---

## 🎉 What's Next (Post-Testing)

If all tests pass:
1. Update `docs/todo.md` - Mark Sprint 3.3 as COMPLETE
2. Deploy to testnet URL for beta testing
3. Start Sprint 4 (Beta Testing & Mobile Optimization)

If tests fail:
1. Document the error in GitHub Issues
2. Check console logs and database state
3. Review docs/SIWE_IMPLEMENTATION_PLAN.md for troubleshooting

---

**Good luck! 🚀**

*Generated during Sprint 3.3 - SIWE Native Migration*
