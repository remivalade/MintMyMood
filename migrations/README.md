# Database Migrations

This folder contains one-time migration scripts that were used to fix and optimize the production database. These scripts are **NOT needed for fresh deployments** - use `database-setup.sql` in the project root instead.

## Migration History

### December 26, 2024 - Performance & Security Optimizations

**Context:** Fixed Supabase linter warnings for performance and security.

#### 1. Function Search Path Security (Completed ✅)

**Files:**
- `database-verify-functions.sql` - Verification script

**Issue:** Functions missing `SET search_path` were vulnerable to schema manipulation attacks.

**Solution:** Added `SET search_path = public, pg_temp` to all 12 database functions.

**Status:** Fixed in `database-setup.sql` - all future deployments include this.

#### 2. RLS Performance Optimization (Completed ✅)

**Files:**
- `database-optimize-rls.sql` - Initial attempt (created duplicates - superseded)
- `database-fix-duplicate-policies.sql` - Final fix (removed duplicates)
- `database-check-policies.sql` - Diagnostic script

**Issue:** RLS policies using `auth.uid()` were re-evaluated for every row, causing poor performance.

**Solution:** Wrapped `auth.uid()` in SELECT subqueries: `(SELECT auth.uid())`

**Notes:**
- First attempt created duplicate policies due to naming mismatch (periods in original policy names)
- Second attempt successfully removed all duplicates and applied optimization

**Status:** Fixed in `database-setup.sql` - all future deployments include this.

#### 3. Index Cleanup (Completed ✅)

**Files:**
- `database-cleanup-indexes.sql`

**Removed:**
- `idx_profiles_ens_name` - ENS names resolved on-the-fly via wagmi
- `idx_thoughts_current_chain` - Old naming, replaced by `idx_thoughts_current_chain_id`

**Kept:**
- `idx_profiles_wallet_address` - Used for wallet lookups
- `idx_thoughts_nft_metadata_style_id` - Used for style filtering
- `idx_thoughts_token_id` - Used for NFT lookups
- All other critical indexes

**Status:** Updated in `database-setup.sql` with comments explaining removed indexes.

### Earlier Migrations

#### NFT Metadata Schema Update

**Files:**
- `add-nft-metadata-column.sql`

**What it does:** Adds `nft_metadata` JSONB column to store styleId and other NFT metadata.

**Status:** This column is now included in `database-setup.sql`.

---

## For Production Deployment

**Do NOT run these migration scripts!**

Instead, use:
```bash
# Fresh database setup (includes all optimizations)
psql -f database-setup.sql
```

See `docs/DATABASE_SETUP.md` for complete setup instructions.

## For Reference Only

These scripts are kept for:
1. Historical documentation of database evolution
2. Understanding what optimizations were applied
3. Debugging if similar issues arise

If you need to understand why the production database differs from an older backup, refer to this folder.
