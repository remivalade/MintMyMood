-- ============================================================================
-- MintMyMood - Database Setup (Production-Ready)
-- ============================================================================
-- This SQL file creates the EXACT schema from the test database
-- Verified against test database (hkzvnpksjpxfsyiqyhpk.supabase.co) on 2025-12-26
--
-- All fields have been verified to match what's used in the codebase
-- Documentation: docs/DATABASE_SETUP.md
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Table: profiles
-- Links Supabase auth.users to wallet addresses
-- Currently only wallet_address is actively used; ens_name is resolved on-the-fly
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE NOT NULL,
    ens_name TEXT, -- Currently unused (ENS resolved via wagmi), kept for future use
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT wallet_address_lowercase CHECK (wallet_address = LOWER(wallet_address))
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase auth.users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.wallet_address IS 'Lowercase Ethereum address (actively used)';
COMMENT ON COLUMN public.profiles.ens_name IS 'ENS name - currently unused, available for future caching';


-- Table: thoughts
-- All columns are actively used except bridge-related fields (V2 feature)
CREATE TABLE IF NOT EXISTS public.thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    text TEXT NOT NULL CHECK (LENGTH(text) > 0 AND LENGTH(text) <= 1000),
    mood TEXT NOT NULL CHECK (LENGTH(mood) > 0 AND LENGTH(mood) <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL for minted, set for ephemeral (7 days)
    is_minted BOOLEAN DEFAULT FALSE,
    origin_chain_id INTEGER, -- Chain where NFT was first minted
    current_chain_id INTEGER, -- Current chain (same as origin until bridging implemented)
    token_id TEXT, -- NFT token ID from contract
    contract_address TEXT, -- Lowercase contract address
    tx_hash TEXT, -- Minting transaction hash
    block_number TEXT, -- Block number where NFT was minted
    last_bridge_tx TEXT, -- V2 feature: Last bridge transaction (currently unused)
    bridge_count INTEGER DEFAULT 0, -- V2 feature: Number of bridges (currently unused)
    nft_metadata JSONB, -- Currently: { styleId: 0|1 }, future: additional metadata
    CONSTRAINT wallet_address_lowercase CHECK (wallet_address = LOWER(wallet_address)),
    CONSTRAINT contract_address_lowercase CHECK (contract_address IS NULL OR contract_address = LOWER(contract_address))
);

COMMENT ON TABLE public.thoughts IS 'All thoughts (ephemeral and minted NFTs)';
COMMENT ON COLUMN public.thoughts.user_id IS 'References auth.users.id (auto-populated by trigger)';
COMMENT ON COLUMN public.thoughts.nft_metadata IS 'JSONB: { styleId: 0|1 } - Classic vs Chain Native style';
COMMENT ON COLUMN public.thoughts.last_bridge_tx IS 'V2 feature - LayerZero bridging (not yet implemented)';
COMMENT ON COLUMN public.thoughts.bridge_count IS 'V2 feature - Cross-chain bridge count (not yet implemented)';


-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================

-- Profiles table policies
-- Note: auth.uid() wrapped in SELECT for performance (evaluated once vs per-row)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);


-- Thoughts table policies
-- Note: auth.uid() wrapped in SELECT for performance (evaluated once vs per-row)
DROP POLICY IF EXISTS "Users can view own thoughts" ON public.thoughts;
CREATE POLICY "Users can view own thoughts"
ON public.thoughts FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own thoughts" ON public.thoughts;
CREATE POLICY "Users can insert own thoughts"
ON public.thoughts FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own thoughts" ON public.thoughts;
CREATE POLICY "Users can update own thoughts"
ON public.thoughts FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own thoughts" ON public.thoughts;
CREATE POLICY "Users can delete own thoughts"
ON public.thoughts FOR DELETE
USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- 4. DATABASE FUNCTIONS
-- ============================================================================

-- Function: update_thought_after_mint
-- This function EXISTS in production and is used by the frontend
CREATE OR REPLACE FUNCTION public.update_thought_after_mint(
    thought_id UUID,
    p_origin_chain_id INTEGER,
    p_token_id TEXT,
    p_contract_address TEXT,
    p_tx_hash TEXT,
    p_block_number TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
        block_number = p_block_number,
        expires_at = NULL,
        updated_at = NOW()
    WHERE id = thought_id
    AND user_id = auth.uid();
END;
$$;

COMMENT ON FUNCTION public.update_thought_after_mint IS 'Marks thought as minted with on-chain data';


-- Function: cleanup_expired_thoughts
-- Deletes ephemeral thoughts past their expiration date
-- Called daily via cron job (see setup instructions below)
CREATE OR REPLACE FUNCTION public.cleanup_expired_thoughts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.thoughts
    WHERE is_minted = FALSE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Log the cleanup
    RAISE NOTICE 'Cleaned up % expired thoughts', deleted_count;

    RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_thoughts IS 'Deletes expired ephemeral thoughts (run daily via cron)';


-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Trigger function: auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, wallet_address)
    VALUES (auth.uid(), LOWER(NEW.wallet_address))
    ON CONFLICT (wallet_address) DO NOTHING;

    NEW.user_id := auth.uid();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_create_user_profile ON public.thoughts;
CREATE TRIGGER auto_create_user_profile
BEFORE INSERT ON public.thoughts
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- Trigger function: auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_thoughts_updated_at ON public.thoughts;
CREATE TRIGGER update_thoughts_updated_at
BEFORE UPDATE ON public.thoughts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- 6. INDEXES
-- ============================================================================
-- Note: Optimized index set - unused indexes removed for better write performance
-- Removed: idx_profiles_ens_name (ENS resolved on-the-fly)
-- Removed: idx_thoughts_current_chain (old naming)

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address
ON public.profiles (wallet_address);

-- Thoughts table indexes
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id
ON public.thoughts (user_id);

CREATE INDEX IF NOT EXISTS idx_thoughts_wallet_address
ON public.thoughts (wallet_address);

CREATE INDEX IF NOT EXISTS idx_thoughts_is_minted
ON public.thoughts (is_minted);

CREATE INDEX IF NOT EXISTS idx_thoughts_expires_at
ON public.thoughts (expires_at)
WHERE is_minted = FALSE;

CREATE INDEX IF NOT EXISTS idx_thoughts_current_chain_id
ON public.thoughts (current_chain_id)
WHERE is_minted = TRUE;

CREATE INDEX IF NOT EXISTS idx_thoughts_nft_metadata_style_id
ON public.thoughts ((nft_metadata->>'styleId'));

CREATE INDEX IF NOT EXISTS idx_thoughts_created_at
ON public.thoughts (created_at DESC);


-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'CRITICAL: Set up daily cleanup cron job!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Run these commands in SQL Editor:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Enable pg_cron extension:';
    RAISE NOTICE '   CREATE EXTENSION IF NOT EXISTS pg_cron;';
    RAISE NOTICE '';
    RAISE NOTICE '2. Schedule cleanup job:';
    RAISE NOTICE '   SELECT cron.schedule(';
    RAISE NOTICE '     ''cleanup-expired-thoughts'',';
    RAISE NOTICE '     ''0 2 * * *'',';
    RAISE NOTICE '     $$ SELECT cleanup_expired_thoughts(); $$';
    RAISE NOTICE '   );';
    RAISE NOTICE '';
    RAISE NOTICE '3. Verify job created:';
    RAISE NOTICE '   SELECT jobid, schedule, command, jobname FROM cron.job;';
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Other required steps:';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '4. Enable Web3 authentication:';
    RAISE NOTICE '   Go to: Authentication → Providers → Web3';
    RAISE NOTICE '';
    RAISE NOTICE '5. Test database access:';
    RAISE NOTICE '   SELECT * FROM public.thoughts;';
    RAISE NOTICE '';
    RAISE NOTICE 'See docs/DATABASE_SETUP.md for detailed instructions.';
END $$;
