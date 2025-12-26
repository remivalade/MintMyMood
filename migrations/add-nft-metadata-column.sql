-- Migration: Add nft_metadata column to thoughts table
-- This column stores NFT-specific metadata like styleId

ALTER TABLE thoughts
ADD COLUMN IF NOT EXISTS nft_metadata JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN thoughts.nft_metadata IS 'Stores NFT metadata including styleId (0=Chain Native, 1=Classic)';

-- Create index for faster queries on styleId
CREATE INDEX IF NOT EXISTS idx_thoughts_nft_metadata_style_id
ON thoughts ((nft_metadata->>'styleId'));
