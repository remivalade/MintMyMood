-- =====================================================
-- MintMyMood (On-Chain Journal) Database Schema
-- Version: 1.0 - Omnichain
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (lightweight, wallet-based)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address);

-- Thoughts table (main data)
CREATE TABLE IF NOT EXISTS thoughts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User relationship
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL, -- Denormalized for RLS performance

    -- Content (400 characters max)
    text TEXT NOT NULL CHECK (char_length(text) <= 400 AND char_length(text) > 0),
    mood TEXT NOT NULL CHECK (char_length(mood) <= 10), -- Emoji only

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-delete time

    -- Minting status
    is_minted BOOLEAN DEFAULT FALSE,

    -- Chain & NFT data (for omnichain support)
    origin_chain_id INTEGER, -- Chain where NFT was originally minted
    current_chain_id INTEGER, -- Chain where NFT currently exists
    token_id TEXT, -- NFT token ID (as string to support large numbers)
    contract_address TEXT, -- Contract address on current chain
    tx_hash TEXT, -- Minting transaction hash

    -- Bridge tracking
    last_bridge_tx TEXT, -- Last bridge transaction hash
    bridge_count INTEGER DEFAULT 0, -- Number of times bridged

    CONSTRAINT valid_chain_ids CHECK (
        (is_minted = FALSE AND origin_chain_id IS NULL AND current_chain_id IS NULL)
        OR (is_minted = TRUE AND origin_chain_id IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_thoughts_wallet_address ON thoughts(wallet_address);
CREATE INDEX idx_thoughts_user_id ON thoughts(user_id);
CREATE INDEX idx_thoughts_is_minted ON thoughts(is_minted);
CREATE INDEX idx_thoughts_expires_at ON thoughts(expires_at) WHERE is_minted = FALSE;
CREATE INDEX idx_thoughts_token_id ON thoughts(token_id) WHERE token_id IS NOT NULL;
CREATE INDEX idx_thoughts_current_chain ON thoughts(current_chain_id) WHERE current_chain_id IS NOT NULL;
CREATE INDEX idx_thoughts_created_at ON thoughts(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically create user on first thought
CREATE OR REPLACE FUNCTION create_user_if_not_exists()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (wallet_address)
    VALUES (NEW.wallet_address)
    ON CONFLICT (wallet_address) DO NOTHING;

    -- Set user_id from users table
    SELECT id INTO NEW.user_id
    FROM users
    WHERE wallet_address = NEW.wallet_address;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create user
CREATE TRIGGER trigger_create_user
    BEFORE INSERT ON thoughts
    FOR EACH ROW
    EXECUTE FUNCTION create_user_if_not_exists();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_thoughts_updated_at
    BEFORE UPDATE ON thoughts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLEANUP FUNCTION (for expired thoughts)
-- =====================================================

CREATE OR REPLACE FUNCTION delete_expired_thoughts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete unminted thoughts that have expired
    DELETE FROM thoughts
    WHERE is_minted = FALSE
      AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Log the deletion (optional, for monitoring)
    RAISE NOTICE 'Deleted % expired thoughts at %', deleted_count, NOW();

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS (for documentation)
-- =====================================================

COMMENT ON TABLE users IS 'User accounts based on wallet addresses';
COMMENT ON TABLE thoughts IS 'Journal entries (ephemeral or minted as NFTs)';

COMMENT ON COLUMN thoughts.text IS 'Journal entry text (max 400 characters)';
COMMENT ON COLUMN thoughts.mood IS 'Emoji representing mood';
COMMENT ON COLUMN thoughts.expires_at IS 'When unminted thought will auto-delete';
COMMENT ON COLUMN thoughts.origin_chain_id IS 'Chain where NFT was originally minted';
COMMENT ON COLUMN thoughts.current_chain_id IS 'Chain where NFT currently exists (after bridging)';
COMMENT ON COLUMN thoughts.bridge_count IS 'Number of times this NFT has been bridged';
