# Database Setup Guide

Complete guide for setting up the Supabase database for MintMyMood.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Setup](#quick-setup)
3. [Database Schema](#database-schema)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Database Functions](#database-functions)
6. [Triggers](#triggers)
7. [Indexes](#indexes)
8. [Web3 Authentication Setup](#web3-authentication-setup)
9. [Verification](#verification)
10. [Troubleshooting](#troubleshooting)

---

## Overview

MintMyMood uses **Supabase** (PostgreSQL) with:
- **Native Web3 Authentication** (Sign-In with Ethereum / SIWE)
- **Row Level Security (RLS)** for per-wallet data isolation
- **Automatic profile creation** via triggers
- **JSONB columns** for flexible metadata storage

**Note**: This documentation is based on the verified test database schema (`hkzvnpksjpxfsyiqyhpk.supabase.co`) as of 2025-12-26. All fields have been verified against the codebase.

---

## Quick Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it!)
5. Wait for project to initialize (~2 minutes)

### Step 2: Get Connection Details

From your project dashboard:
- **Project URL**: `https://[project-ref].supabase.co`
- **Anon Key**: Settings → API → Project API keys → `anon` key
- **Service Role Key**: Settings → API → Project API keys → `service_role` key (keep secret!)

### Step 3: Run Setup SQL

Go to **SQL Editor** → New Query and paste the complete schema below.

---

## Database Schema

Run this SQL in your Supabase SQL Editor (in order):

### 1. Create Tables

```sql
-- ============================================================================
-- Table: profiles
-- ============================================================================
-- Links Supabase auth.users to wallet addresses
-- Note: ens_name currently unused (ENS resolved on-the-fly), kept for future

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE NOT NULL,
    ens_name TEXT, -- Currently unused, available for future caching
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT wallet_address_lowercase CHECK (wallet_address = LOWER(wallet_address))
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase auth.users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.wallet_address IS 'Lowercase Ethereum address (actively used)';
COMMENT ON COLUMN public.profiles.ens_name IS 'ENS name - currently unused, available for future caching';


-- ============================================================================
-- Table: thoughts
-- ============================================================================
-- Stores all thoughts (ephemeral and minted)
-- All columns actively used except bridge fields (V2 feature)

CREATE TABLE IF NOT EXISTS public.thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,

    -- Thought content
    text TEXT NOT NULL CHECK (LENGTH(text) > 0 AND LENGTH(text) <= 1000),
    mood TEXT NOT NULL CHECK (LENGTH(mood) > 0 AND LENGTH(mood) <= 100),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL for minted, set for ephemeral (7 days)

    -- Minting status
    is_minted BOOLEAN DEFAULT FALSE,
    origin_chain_id INTEGER, -- Chain where NFT was first minted
    current_chain_id INTEGER, -- Current chain (same as origin until bridging)
    token_id TEXT, -- NFT token ID from contract
    contract_address TEXT, -- Contract address (lowercase)
    tx_hash TEXT, -- Minting transaction hash

    -- Bridging (V2 feature - currently unused)
    last_bridge_tx TEXT, -- Last bridge transaction hash
    bridge_count INTEGER DEFAULT 0, -- Number of times bridged

    -- NFT metadata
    nft_metadata JSONB, -- Currently: { styleId: 0|1 }

    CONSTRAINT wallet_address_lowercase CHECK (wallet_address = LOWER(wallet_address)),
    CONSTRAINT contract_address_lowercase CHECK (contract_address IS NULL OR contract_address = LOWER(contract_address))
);

COMMENT ON TABLE public.thoughts IS 'All thoughts (ephemeral and minted NFTs)';
COMMENT ON COLUMN public.thoughts.user_id IS 'References auth.users.id (auto-populated by trigger)';
COMMENT ON COLUMN public.thoughts.expires_at IS '7 days from creation for ephemeral, NULL for minted';
COMMENT ON COLUMN public.thoughts.nft_metadata IS 'JSONB: { styleId: 0|1 } - Classic vs Chain Native style';
COMMENT ON COLUMN public.thoughts.last_bridge_tx IS 'V2 feature - not yet implemented';
COMMENT ON COLUMN public.thoughts.bridge_count IS 'V2 feature - not yet implemented';


```

**Note**: The `bridge_transactions` table is NOT created in this setup. It's a V2 feature for LayerZero cross-chain bridging that hasn't been implemented yet. The code has placeholders for it, but the table doesn't exist in the current test database.

---

## Row Level Security (RLS)

Enable RLS and create policies to ensure users can only access their own data:

```sql
-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- RLS Policies: profiles table
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile (via trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ============================================================================
-- RLS Policies: thoughts table
-- ============================================================================

-- Users can view their own thoughts
CREATE POLICY "Users can view own thoughts"
ON public.thoughts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own thoughts
CREATE POLICY "Users can insert own thoughts"
ON public.thoughts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own thoughts
CREATE POLICY "Users can update own thoughts"
ON public.thoughts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own thoughts
CREATE POLICY "Users can delete own thoughts"
ON public.thoughts
FOR DELETE
USING (auth.uid() = user_id);


```

---

## Database Functions

### 1. Update Thought After Mint

```sql
-- ============================================================================
-- Function: update_thought_after_mint
-- ============================================================================
-- Updates thought record after successful on-chain minting

CREATE OR REPLACE FUNCTION public.update_thought_after_mint(
    thought_id UUID,
    p_origin_chain_id INTEGER,
    p_token_id TEXT,
    p_contract_address TEXT,
    p_tx_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.thoughts
    SET
        is_minted = TRUE,
        origin_chain_id = p_origin_chain_id,
        current_chain_id = p_origin_chain_id,
        token_id = p_token_id,
        contract_address = LOWER(p_contract_address),
        tx_hash = p_tx_hash,
        expires_at = NULL, -- Minted thoughts don't expire
        updated_at = NOW()
    WHERE id = thought_id
    AND user_id = auth.uid(); -- Security: only update own thoughts
END;
$$;

COMMENT ON FUNCTION public.update_thought_after_mint IS 'Marks thought as minted with on-chain data';
```

### 2. Cleanup Expired Thoughts

**CRITICAL**: This function is required to delete ephemeral thoughts after 7 days.

```sql
-- ============================================================================
-- Function: cleanup_expired_thoughts
-- ============================================================================
-- Deletes ephemeral thoughts past their expiration date
-- Called daily via cron job

CREATE OR REPLACE FUNCTION public.cleanup_expired_thoughts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.thoughts
    WHERE is_minted = FALSE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % expired thoughts', deleted_count;
    RETURN deleted_count;
END;
$$;
```

**Note**: `update_thought_after_bridge` is NOT included (V2 feature for LayerZero bridging).

---

## Triggers

### Auto-create User Profile

```sql
-- ============================================================================
-- Trigger: auto_create_user_profile
-- ============================================================================
-- Automatically creates user profile when first thought is saved

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert profile if doesn't exist
    INSERT INTO public.profiles (id, wallet_address)
    VALUES (auth.uid(), LOWER(NEW.wallet_address))
    ON CONFLICT (wallet_address) DO NOTHING;

    -- Set user_id on the thought
    NEW.user_id := auth.uid();

    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_user_profile
BEFORE INSERT ON public.thoughts
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER auto_create_user_profile ON public.thoughts IS 'Creates user profile on first thought';
```

### Auto-update Timestamps

```sql
-- ============================================================================
-- Trigger: update_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_thoughts_updated_at
BEFORE UPDATE ON public.thoughts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

---

## Indexes

Optimize query performance:

```sql
-- ============================================================================
-- Indexes
-- ============================================================================

-- Profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address
ON public.profiles (wallet_address);

-- Thoughts table
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id
ON public.thoughts (user_id);

CREATE INDEX IF NOT EXISTS idx_thoughts_wallet_address
ON public.thoughts (wallet_address);

CREATE INDEX IF NOT EXISTS idx_thoughts_is_minted
ON public.thoughts (is_minted);

CREATE INDEX IF NOT EXISTS idx_thoughts_expires_at
ON public.thoughts (expires_at)
WHERE is_minted = FALSE; -- Partial index for ephemeral thoughts only

CREATE INDEX IF NOT EXISTS idx_thoughts_current_chain_id
ON public.thoughts (current_chain_id)
WHERE is_minted = TRUE; -- Partial index for minted thoughts

CREATE INDEX IF NOT EXISTS idx_thoughts_nft_metadata_style_id
ON public.thoughts ((nft_metadata->>'styleId'));

CREATE INDEX IF NOT EXISTS idx_thoughts_created_at
ON public.thoughts (created_at DESC);
```

---

## Cron Job Setup (CRITICAL)

**Required**: Set up automatic cleanup of expired thoughts after creating the database.

### Step 1: Enable pg_cron Extension

In Supabase **SQL Editor**, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Step 2: Schedule the Cleanup Job

In Supabase **SQL Editor**, run:

```sql
SELECT cron.schedule(
  'cleanup-expired-thoughts',           -- Job name
  '0 2 * * *',                          -- Schedule: Daily at 2 AM UTC
  $$ SELECT cleanup_expired_thoughts(); $$  -- SQL to execute
);
```

### Step 3: Verify the Job Was Created

Check your scheduled jobs:

```sql
SELECT jobid, schedule, command, active, jobname FROM cron.job;
```

You should see `cleanup-expired-thoughts` listed with schedule `0 2 * * *`.

### Monitoring Job Runs

To see job execution history:

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'cleanup-expired-thoughts'
ORDER BY start_time DESC
LIMIT 10;
```

### Manual Testing

Test the cleanup function manually:

```sql
SELECT cleanup_expired_thoughts();
-- Returns: number of deleted thoughts
```

### To Unschedule (if needed)

```sql
SELECT cron.unschedule('cleanup-expired-thoughts');
```

**Note**: The `cron` schema is protected in Supabase. You cannot access it directly via the dashboard, but you can use the `cron.schedule()` function via SQL Editor.

---

## Web3 Authentication Setup

MintMyMood uses **Supabase native Web3 authentication** (SIWE - Sign-In with Ethereum).

### Enable Web3 Auth in Supabase

1. Go to **Authentication → Providers**
2. Enable **"Web3"** provider
3. Configuration is automatic - no additional setup needed!

### How It Works

1. User connects wallet (MetaMask, Rabby, etc.)
2. Frontend calls `supabase.auth.signInWithWeb3({ address, signature })`
3. Supabase validates SIWE signature
4. Session created with `auth.uid()` = user UUID
5. RLS policies use `auth.uid()` to filter data

No custom backend auth needed! ✨

---

## Verification

### Test Database Setup

```sql
-- Check tables exist (should show: profiles, thoughts)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### Test CRUD Operations

After setting up Web3 auth and connecting with your wallet:

```sql
-- Insert test thought (via authenticated user)
INSERT INTO public.thoughts (wallet_address, text, mood)
VALUES ('0x742d35cc6634c0532925a3b844bc9e7595f0beb', 'Test thought', '😊');

-- Query should return only your thoughts
SELECT * FROM public.thoughts;
```

---

## Troubleshooting

### RLS Denies All Access

**Problem**: Can't insert/read data even when authenticated.

**Solution**:
1. Ensure Web3 auth provider is enabled
2. Verify `auth.uid()` returns a value: `SELECT auth.uid();`
3. Check user exists in `auth.users` table

### "Column nft_metadata does not exist"

**Problem**: Old database missing new columns.

**Solution**: This column is now included in `database-setup.sql`. If upgrading an existing database:
```sql
ALTER TABLE thoughts
ADD COLUMN IF NOT EXISTS nft_metadata JSONB DEFAULT NULL;
```

### Expired Thoughts Not Deleting

**Problem**: Ephemeral thoughts not being deleted after 7 days.

**Solution**: Ensure the cron job is set up correctly (see [Cron Job Setup](#cron-job-setup-critical) above).

To manually trigger cleanup:
```sql
SELECT cleanup_expired_thoughts();
```

To check for expired thoughts that should be deleted:
```sql
SELECT id, text, created_at, expires_at
FROM thoughts
WHERE is_minted = FALSE
AND expires_at < NOW();
```

---

## Production Checklist

### Database Setup
- [ ] Supabase project created
- [ ] `database-setup.sql` executed successfully in SQL Editor
- [ ] Tables created: `profiles`, `thoughts`
- [ ] RLS enabled on both tables
- [ ] RLS policies active
- [ ] Functions created: `update_thought_after_mint`, `cleanup_expired_thoughts`
- [ ] Triggers created (auto-profile, timestamps)
- [ ] Indexes created for performance
- [ ] Verify nft_metadata column exists

### Cron Job Setup (CRITICAL!)
- [ ] pg_cron extension enabled: `CREATE EXTENSION IF NOT EXISTS pg_cron;`
- [ ] Cron job scheduled: `SELECT cron.schedule('cleanup-expired-thoughts', '0 2 * * *', $$ SELECT cleanup_expired_thoughts(); $$);`
- [ ] Verify job exists: `SELECT * FROM cron.job;`
- [ ] Test cleanup function: `SELECT cleanup_expired_thoughts();`

### Authentication & Testing
- [ ] Web3 authentication enabled (Authentication → Providers → Web3)
- [ ] Test CRUD operations work
- [ ] Connection strings saved in `.env`
- [ ] Verify RLS policies by testing with different wallets

---

## Next Steps

- **Frontend Setup**: See [GETTING_STARTED.md](GETTING_STARTED.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Development**: See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

**Questions?** Check [CLAUDE.md](../CLAUDE.md) for project context.
