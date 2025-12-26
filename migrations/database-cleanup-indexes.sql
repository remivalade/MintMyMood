-- ============================================================================
-- Clean Up Unused Indexes
-- ============================================================================
-- This script removes 2 genuinely unused indexes to improve write performance
-- and reduce storage. Keeps indexes that will be used in production.
-- ============================================================================

-- ============================================================================
-- REMOVE: idx_profiles_ens_name
-- ============================================================================
-- Reason: ENS names are resolved on-the-fly via wagmi, never queried from DB
-- Impact: Small storage savings, slightly faster profile writes

DROP INDEX IF EXISTS public.idx_profiles_ens_name;


-- ============================================================================
-- REMOVE: idx_thoughts_current_chain
-- ============================================================================
-- Reason: Old naming - replaced by idx_thoughts_current_chain_id
-- Impact: Removes duplicate index, faster writes

DROP INDEX IF EXISTS public.idx_thoughts_current_chain;


-- ============================================================================
-- KEEP (DO NOT DROP) - These will be used in production:
-- ============================================================================
-- ✅ idx_profiles_wallet_address - Used for wallet lookups
-- ✅ idx_thoughts_nft_metadata_style_id - Used when filtering by style (Classic vs Chain Native)
-- ✅ idx_thoughts_token_id - Used when looking up specific NFTs


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Index Cleanup Complete!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Removed indexes:';
    RAISE NOTICE '  - idx_profiles_ens_name (ENS not used)';
    RAISE NOTICE '  - idx_thoughts_current_chain (old naming)';
    RAISE NOTICE '';
    RAISE NOTICE 'Kept indexes:';
    RAISE NOTICE '  - idx_profiles_wallet_address (wallet lookups)';
    RAISE NOTICE '  - idx_thoughts_nft_metadata_style_id (style filtering)';
    RAISE NOTICE '  - idx_thoughts_token_id (NFT lookups)';
    RAISE NOTICE '';
    RAISE NOTICE 'Benefits:';
    RAISE NOTICE '  - Reduced storage usage';
    RAISE NOTICE '  - Faster INSERT/UPDATE operations';
    RAISE NOTICE '';
END $$;
