# Supabase JWT Signing Keys Migration Guide

## Sprint 3.3: Modern JWT Setup (HS256 Shared Secret)

Following Supabase's official migration path for custom authentication providers.

---

## ✅ The Modern Approach

Supabase has moved from "Legacy JWT Secret" to "JWT Signing Keys" system. This guide shows you how to properly import your custom HS256 secret into the new system.

### Why This Approach?

- ✅ **Officially supported** by Supabase for custom auth providers
- ✅ **No code changes** required in your backend
- ✅ **Future-proof** - uses modern JWT Signing Keys system
- ✅ **Same security** - HS256 with strong secret is perfectly secure

---

## 📋 Step-by-Step Instructions

### Step 1: Generate a Strong JWT Secret

Run this command in your terminal:

```bash
openssl rand -base64 32
```

**Generated secret for you:**
```
6+9rRHNNu9U2+48YNJio3Sd+PZRaoG+BAZ235yGfYMc=
```

⚠️ **Security Note:** This secret was generated for you. Keep it secure and never commit it to git.

---

### Step 2: Update Your Backend `.env` File

Edit `backend/api/.env` and update the JWT_SECRET:

```bash
JWT_SECRET=6+9rRHNNu9U2+48YNJio3Sd+PZRaoG+BAZ235yGfYMc=
```

---

### Step 3: Import Secret into Supabase Dashboard

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/hkzvnpksjpxfsyiqyhpk/settings/auth

2. **Navigate to JWT Signing Keys:**
   - Click on "Settings" in left sidebar
   - Click on "Auth"
   - Scroll down to "JWT Signing Keys" section

3. **Create Standby Key:**
   - Click the **"Create Standby Key"** button

4. **Import Your Custom Secret:**
   - In the "Algorithm" dropdown, select **"HS256 (Shared Secret)"**
   - You'll see an option: **"Import an existing secret"** - SELECT THIS
   - In the text box, paste your JWT_SECRET: `6+9rRHNNu9U2+48YNJio3Sd+PZRaoG+BAZ235yGfYMc=`
   - Click **"Create standby key"**

5. **Rotate Keys to Activate:**
   - You'll now see your imported key listed as "Standby Key"
   - Click the **"Rotate keys"** button
   - Confirm the rotation (check any required boxes)
   - Your imported HS256 key is now the **"Current Key"** ✅

---

### Step 4: Restart Backend Server

```bash
# Stop the current server (Ctrl+C or kill process)
lsof -ti:3001 | xargs kill -9

# Start fresh
cd backend/api && npm start
```

You should see:
```
✓ Signer wallet initialized: 0xEd171c759450B7358e9238567b1e23b4d82f3a64
Server running on port 3001
```

---

### Step 5: Test Authentication Flow

1. Open your app: http://localhost:3000
2. Connect your wallet
3. Sign the SIWE message
4. Create a new thought
5. Verify:
   - ✅ No 401 errors in browser console
   - ✅ Thought appears in the gallery
   - ✅ Thought is in Supabase Dashboard (public.thoughts table)

---

## 🎉 What You Just Accomplished

- ✅ Migrated from "Legacy JWT Secret" to modern "JWT Signing Keys" system
- ✅ Imported your custom HS256 secret (official Supabase method)
- ✅ No backend code changes required
- ✅ Your SIWE authentication now works with Supabase RLS

---

## 🔍 Troubleshooting

**Still seeing 401 errors?**

1. Verify JWT_SECRET in `backend/api/.env` matches the imported secret
2. Check that you rotated keys (standby → current)
3. Restart backend server
4. Clear browser localStorage and re-authenticate

**Backend won't start?**

1. Check that JWT_SECRET is set in `.env`
2. No syntax errors in `.env` file
3. Port 3001 is available

---

## 📚 Technical Details

**What Changed:**
- Old: "Legacy JWT Secret" field (deprecated ❌)
- New: "JWT Signing Keys" with imported HS256 (modern ✅)

**How It Works:**
1. Backend signs JWTs with `JWT_SECRET` using HS256
2. Supabase's "JWT Signing Keys" system knows about your imported secret
3. Supabase verifies incoming JWTs against your registered key
4. RLS policies can now trust the JWT claims

**Algorithm:** HS256 (Symmetric shared secret)
**Security:** Same as before - relies on keeping JWT_SECRET secure
**Performance:** No change - verification is instant and local
