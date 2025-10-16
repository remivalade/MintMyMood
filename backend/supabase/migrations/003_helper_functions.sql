-- =====================================================
-- Helper Functions for Application Logic
-- =====================================================

-- =====================================================
-- GET USER STATS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_stats(user_wallet_address TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_thoughts', COUNT(*),
        'minted_thoughts', COUNT(*) FILTER (WHERE is_minted = TRUE),
        'ephemeral_thoughts', COUNT(*) FILTER (WHERE is_minted = FALSE),
        'total_bridges', COALESCE(SUM(bridge_count), 0),
        'chains_used', COUNT(DISTINCT origin_chain_id) FILTER (WHERE origin_chain_id IS NOT NULL),
        'oldest_thought', MIN(created_at),
        'newest_thought', MAX(created_at)
    ) INTO result
    FROM thoughts
    WHERE wallet_address = user_wallet_address;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET THOUGHTS BY CHAIN
-- =====================================================

CREATE OR REPLACE FUNCTION get_thoughts_by_chain(
    user_wallet_address TEXT,
    chain_id_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    text TEXT,
    mood TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_minted BOOLEAN,
    origin_chain_id INTEGER,
    current_chain_id INTEGER,
    token_id TEXT,
    bridge_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.text,
        t.mood,
        t.created_at,
        t.is_minted,
        t.origin_chain_id,
        t.current_chain_id,
        t.token_id,
        t.bridge_count
    FROM thoughts t
    WHERE t.wallet_address = user_wallet_address
      AND (chain_id_filter IS NULL OR t.current_chain_id = chain_id_filter)
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE THOUGHT AFTER MINTING
-- =====================================================

CREATE OR REPLACE FUNCTION update_thought_after_mint(
    thought_id UUID,
    p_origin_chain_id INTEGER,
    p_token_id TEXT,
    p_contract_address TEXT,
    p_tx_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE thoughts
    SET
        is_minted = TRUE,
        origin_chain_id = p_origin_chain_id,
        current_chain_id = p_origin_chain_id, -- Same as origin initially
        token_id = p_token_id,
        contract_address = p_contract_address,
        tx_hash = p_tx_hash,
        updated_at = NOW()
    WHERE id = thought_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE THOUGHT AFTER BRIDGE
-- =====================================================

CREATE OR REPLACE FUNCTION update_thought_after_bridge(
    thought_id UUID,
    new_chain_id INTEGER,
    new_contract_address TEXT,
    bridge_tx_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE thoughts
    SET
        current_chain_id = new_chain_id,
        contract_address = new_contract_address,
        last_bridge_tx = bridge_tx_hash,
        bridge_count = bridge_count + 1,
        updated_at = NOW()
    WHERE id = thought_id
      AND is_minted = TRUE; -- Only minted thoughts can be bridged

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET EXPIRING SOON THOUGHTS
-- =====================================================

CREATE OR REPLACE FUNCTION get_expiring_soon_thoughts(
    user_wallet_address TEXT,
    hours_threshold INTEGER DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    text TEXT,
    mood TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    hours_remaining NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.text,
        t.mood,
        t.created_at,
        t.expires_at,
        EXTRACT(EPOCH FROM (t.expires_at - NOW())) / 3600 AS hours_remaining
    FROM thoughts t
    WHERE t.wallet_address = user_wallet_address
      AND t.is_minted = FALSE
      AND t.expires_at > NOW()
      AND t.expires_at < (NOW() + INTERVAL '1 hour' * hours_threshold)
    ORDER BY t.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEARCH THOUGHTS (for future feature)
-- =====================================================

CREATE OR REPLACE FUNCTION search_thoughts(
    user_wallet_address TEXT,
    search_term TEXT
)
RETURNS TABLE (
    id UUID,
    text TEXT,
    mood TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_minted BOOLEAN,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.text,
        t.mood,
        t.created_at,
        t.is_minted,
        ts_rank(
            to_tsvector('english', t.text),
            plainto_tsquery('english', search_term)
        ) AS relevance
    FROM thoughts t
    WHERE t.wallet_address = user_wallet_address
      AND to_tsvector('english', t.text) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_user_stats IS 'Get statistics for a user (total thoughts, minted, bridges, etc.)';
COMMENT ON FUNCTION get_thoughts_by_chain IS 'Get all thoughts for a user, optionally filtered by chain';
COMMENT ON FUNCTION update_thought_after_mint IS 'Update thought record after successful NFT minting';
COMMENT ON FUNCTION update_thought_after_bridge IS 'Update thought record after successful cross-chain bridge';
COMMENT ON FUNCTION get_expiring_soon_thoughts IS 'Get unminted thoughts that will expire soon';
COMMENT ON FUNCTION search_thoughts IS 'Full-text search across user thoughts';
