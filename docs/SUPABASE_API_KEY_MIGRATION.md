# Supabase API Key Migration Guide

**Migration from Legacy JWT Keys to New API Keys**

**Date:** 2025-12-26
**Status:** Ready to Execute
**Risk Level:** Low (Drop-in replacement, easy rollback)

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Testing](#testing)
5. [Rollback Plan](#rollback-plan)
6. [Cleanup](#cleanup)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Migrate?

1. **Security Incident Response**: Current service role key was exposed in GitHub
2. **Better Security**: Secret keys cannot be used in browsers (automatic protection)
3. **Instant Revocation**: Delete keys immediately without downtime
4. **Zero-Downtime Rotation**: Create new keys before deleting old ones
5. **Future-Proof**: Mandatory by late 2026 anyway

### What Changes?

| Aspect | Before | After |
|--------|--------|-------|
| **Frontend Key** | `anon` JWT (eyJ...) | `sb_publishable_...` |
| **Backend Key** | `service_role` JWT (eyJ...) | `sb_secret_...` |
| **Code Changes** | N/A | **None required!** |
| **Compatibility** | Works with old keys | Works with both old and new |

### Timeline

- **Estimated Time**: 15 minutes
- **Downtime**: None (local testing first)
- **Rollback Time**: < 1 minute

---

## Pre-Migration Checklist

### ✅ Before You Start

- [ ] **Backup current `.env` file**
  ```bash
  cp .env .env.backup
  ```

- [ ] **Verify you have both new keys ready**
  - [ ] Publishable key: `sb_publishable_...` (to be created)
  - [ ] Secret key: `sb_secret_P5txhNGh7TMz9WBPrSf95A_bAXDxDyr` (already created!)

- [ ] **Ensure app is not running**
  ```bash
  # Stop any running dev servers
  # Ctrl+C or close terminal
  ```

- [ ] **Commit current work** (optional but recommended)
  ```bash
  git add .
  git commit -m "Pre-migration checkpoint"
  ```

### ✅ Current State Verification

Run this to verify current setup:
```bash
cat .env | grep -E "VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY"
```

Expected output:
```
VITE_SUPABASE_URL=https://hkzvnpksjpxfsyiqyhpk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  (legacy JWT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  (legacy JWT)
```

---

## Step-by-Step Migration

### Step 1: Create New Publishable Key

1. Go to [Supabase Dashboard → API Settings](https://app.supabase.com/project/hkzvnpksjpxfsyiqyhpk/settings/api)

2. Scroll to **"API Keys"** section (ABOVE the "Project API keys" legacy section)

3. Click **"Create a new publishable key"**

4. **Configure the key:**
   - **Name**: `frontend-publishable`
   - **Description**: `Production frontend key (migrated 2025-12-26)`
   - Click **"Create Key"**

5. **Copy the key** - it will look like:
   ```
   sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

6. **Save it temporarily** (you'll add it to `.env` in Step 2)

### Step 2: Update `.env` File

Open `.env` and update these three lines:

**Find these lines:**
```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrenZucGtzanB4ZnN5aXF5aHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzQxNTQsImV4cCI6MjA3NjE1MDE1NH0.MKXVAKudk_WwLQoDUJKUe44MF8-e4UwzrJ835_YA7_s

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrenZucGtzanB4ZnN5aXF5aHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3NDE1NCwiZXhwIjoyMDc2MTUwMTU0fQ.A2y9JW8mHQrxf1P1lV-YJnL5xBauHriNOsL3vffi-JA
```

**Replace with:**
```bash
VITE_SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# ☝️ Paste the publishable key from Step 1

SUPABASE_SERVICE_ROLE_KEY=sb_secret_P5txhNGh7TMz9WBPrSf95A_bAXDxDyr
# ☝️ This is the secret key you already created
```

**Save the file.**

### Step 3: Verify Environment Variables

Run this command to verify the new keys are in place:

```bash
cat .env | grep -E "VITE_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY"
```

**Expected output:**
```
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_P5txhNGh7TMz9WBPrSf95A_bAXDxDyr
```

✅ Both should start with `sb_publishable_` and `sb_secret_` respectively.

---

## Testing

### Test 1: Local Development Server

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Expected output:**
   ```
   VITE v5.x.x  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

   ✅ **Success indicator:** No errors about missing environment variables

3. **Open browser:** http://localhost:3000

4. **Verify app loads:**
   - ✅ No console errors
   - ✅ UI renders correctly
   - ✅ No Supabase connection errors

### Test 2: Authentication Flow

1. **Click "Connect Wallet"**

2. **Connect your wallet** (MetaMask, Rabby, etc.)

3. **Sign the SIWE message** when prompted

4. **Expected behavior:**
   - ✅ "Signing you in..." message appears
   - ✅ Successfully signed in
   - ✅ Wallet address displayed in header

5. **Check browser console:**
   ```
   [useAuthStore] Auth event: SIGNED_IN, session: <user-id>
   [useAuthStore] Processing session for user: <uuid>
   ```

   ❌ **No errors about "Legacy API keys disabled"**

### Test 3: Database Operations

1. **Save an ephemeral thought:**
   - Navigate to writing interface
   - Type: "Testing new API keys migration"
   - Select mood: 😊
   - Click "Save Draft"

2. **Expected behavior:**
   - ✅ Toast notification: "Draft saved successfully"
   - ✅ No console errors
   - ✅ Thought appears in Gallery

3. **Fetch thoughts:**
   - Navigate to Gallery
   - Verify thought appears in list

4. **Delete the test thought:**
   - Click the thought
   - Click delete
   - Confirm deletion
   - ✅ Thought removed from gallery

### Test 4: Backend Script (Optional)

Test the backfill script with new secret key:

```bash
VITE_SUPABASE_URL=https://hkzvnpksjpxfsyiqyhpk.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=sb_secret_P5txhNGh7TMz9WBPrSf95A_bAXDxDyr \
node backfill-nft-metadata.js
```

**Expected output:**
```
🔍 Fetching all minted NFTs from database...

Found X minted NFTs
```

✅ **Success:** No authentication errors

---

## Rollback Plan

If you encounter any issues during testing:

### Quick Rollback (< 1 minute)

1. **Stop the dev server** (Ctrl+C)

2. **Restore backup:**
   ```bash
   cp .env.backup .env
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Verify app works** with legacy keys

5. **Report the issue** - though based on analysis, this shouldn't be needed!

### What to Check if Rollback Needed

If you had to rollback, check these:

- [ ] Browser console for specific error messages
- [ ] Network tab for failed requests
- [ ] Supabase dashboard logs (Settings → Logs)
- [ ] Verify keys are active in Supabase dashboard

---

## Cleanup

### After Successful Testing

Once you've verified everything works with the new keys:

### Step 1: Delete Legacy Keys (Optional - Recommended)

1. Go to [Supabase Dashboard → API Settings](https://app.supabase.com/project/hkzvnpksjpxfsyiqyhpk/settings/api)

2. Scroll to **"Project API keys"** section (legacy keys)

3. Find the toggle: **"Legacy API keys"**

4. Click **"Disable legacy API keys"**

5. Confirm the action

**⚠️ WARNING**: Only do this AFTER confirming the new keys work perfectly!

### Step 2: Update Documentation

Update these files to reference new key format:

- [ ] `.env.example` - Update example values
- [ ] `docs/GETTING_STARTED.md` - Update setup instructions
- [ ] `docs/DEPLOYMENT.md` - Update deployment instructions
- [ ] `docs/DATABASE_SETUP.md` - Update any references

### Step 3: Delete Backup

Once you're 100% confident:

```bash
rm .env.backup
```

### Step 4: Commit Changes

```bash
git add .env docs/
git commit -m "Security: Migrate to new Supabase API keys (sb_publishable/sb_secret)

- Replace legacy JWT anon key with sb_publishable_...
- Replace legacy JWT service_role with sb_secret_...
- No code changes required (drop-in replacement)
- Tested: Auth flow, database operations, backend scripts
- Security improvement: Secret keys now fail in browser (HTTP 401)

Refs: https://github.com/orgs/supabase/discussions/29260"
```

---

## Troubleshooting

### Issue: "Invalid API key" error

**Symptoms:**
- Console error: `Invalid API key`
- Failed authentication

**Solution:**
1. Verify key format starts with `sb_publishable_` or `sb_secret_`
2. Check for extra spaces/newlines when copying keys
3. Verify keys are active in Supabase dashboard

### Issue: "Legacy API keys are disabled"

**Symptoms:**
- Error message about legacy keys being disabled

**Root Cause:**
- You disabled legacy keys before migrating

**Solution:**
1. Re-enable legacy keys temporarily
2. Complete migration to new keys
3. Disable legacy keys again

### Issue: Browser console shows 401 Unauthorized

**Symptoms:**
- HTTP 401 errors in browser Network tab
- Failed database queries

**Check:**
1. Verify `VITE_SUPABASE_ANON_KEY` is `sb_publishable_...` (NOT `sb_secret_...`)
2. Secret keys will ALWAYS fail in browser - this is intentional security!

**Solution:**
- Frontend should ONLY use `sb_publishable_...` key
- Backend scripts use `sb_secret_...` key

### Issue: Environment variables not updating

**Symptoms:**
- App still using old keys after updating `.env`

**Solution:**
1. Stop dev server completely (Ctrl+C)
2. Restart: `npm run dev`
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Success Criteria

✅ Migration is successful when:

- [ ] Dev server starts without errors
- [ ] Wallet connects and signs in successfully
- [ ] Can save/fetch/delete thoughts
- [ ] No console errors about API keys
- [ ] Backend scripts work with new secret key
- [ ] Browser automatically rejects secret key (if tested)

---

## Additional Resources

- [Supabase API Keys Discussion](https://github.com/orgs/supabase/discussions/29260)
- [New API Keys FAQ](https://github.com/orgs/supabase/discussions/40300)
- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)

---

## Migration Log

Track your migration progress:

- [ ] **Pre-migration backup created**
- [ ] **Publishable key created**: `frontend-publishable`
- [ ] **`.env` updated** with new keys
- [ ] **Test 1 passed**: Dev server starts
- [ ] **Test 2 passed**: Authentication works
- [ ] **Test 3 passed**: Database operations work
- [ ] **Test 4 passed**: Backend script works (optional)
- [ ] **Legacy keys disabled** (optional, after verification)
- [ ] **Documentation updated**
- [ ] **Changes committed**

**Migration Date:** _______________
**Migrated By:** _______________
**Status:** _______________

---

**Questions or issues?** Refer to the [Troubleshooting](#troubleshooting) section above.
