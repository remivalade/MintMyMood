# Utility Scripts

This folder contains utility scripts for database operations and testing.

## Available Scripts

### backfill-nft-metadata.js

**Purpose:** Backfill `nft_metadata.styleId` from on-chain contracts into the database.

**When to use:** After adding the `nft_metadata` column to existing thoughts.

**Requirements:**
- Node.js 18+
- Environment variables: `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**Usage:**
```bash
cd scripts
VITE_SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node backfill-nft-metadata.js
```

**Security:**
- Uses service role key for admin access
- Never commit credentials - always use environment variables
- See script comments for detailed documentation

### decode_uri.py

**Purpose:** Decodes and formats base64-encoded token URIs from smart contracts.

**When to use:** Testing and debugging NFT metadata generation.

**Usage:**
```bash
cd scripts
python3 decode_uri.py
```

---

## Adding New Scripts

When adding utility scripts:
1. Add environment variable validation
2. Document usage in script comments
3. Never hardcode credentials
4. Update this README
