# Deployment Guide

Complete guide for deploying MintMyMood to production.

---

## Table of Contents

1. [Overview](#overview)
2. [Hosting Stack](#hosting-stack)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Smart Contract Deployment](#smart-contract-deployment)
6. [Contract Addresses](#contract-addresses)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Upgrading Contracts](#upgrading-contracts)
9. [Troubleshooting](#troubleshooting)

---

## Overview

MintMyMood consists of three deployment components:

| Component | Platform | Cost |
|-----------|----------|------|
| **Frontend** | Vercel (Hobby) | $0 |
| **Database + Auth** | Supabase | $0 (free tier) |
| **Smart Contracts** | Base, Bob, Ink | One-time gas fees |

**Note**: MintMyMood uses Supabase as its backend (database + authentication + RLS). No separate backend API server is needed.

---

## Hosting Stack

### Why This Stack?

- **Vercel**: Free tier with 100GB bandwidth, global CDN, auto-deploy on git push, custom domain support
- **Supabase**: Managed PostgreSQL with RLS, Web3 authentication, generous free tier, built-in REST API

### Architecture

```
Users → Vercel (yourdomain.com)
          ↓
       [Frontend: React + Vite]
          ↓
       Supabase (Database + Auth + RLS)
          ↓
       Base/Bob/Ink → Smart Contracts (ERC721)
```

**No backend API server needed!** The frontend connects directly to:
- Supabase for database operations (via `@supabase/supabase-js`)
- Smart contracts for minting (via `wagmi` + `viem`)
- RPC providers for blockchain reads

---

## Database Setup (Supabase)

**CRITICAL**: Set up your database BEFORE deploying the frontend.

### Quick Setup

1. **Create Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create new project
   - Save your Project URL and API keys

2. **Run Database Setup**
   - Go to SQL Editor in your Supabase dashboard
   - Copy contents of `database-setup.sql` (in project root)
   - Paste and run the entire SQL script

3. **Enable Web3 Authentication**
   - Go to Authentication → Providers
   - Enable **Web3** provider
   - No additional configuration needed!

4. **Verify Setup**
   ```sql
   -- Run in SQL Editor
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   -- Should show: users, thoughts, bridge_transactions
   ```

**Detailed Guide**: See [DATABASE_SETUP.md](DATABASE_SETUP.md) for complete documentation.

---

## Frontend Deployment (Vercel)

### Initial Setup

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `./` (default)

2. **Configure Environment Variables**

   In Vercel Dashboard → Settings → Environment Variables, add these for **Production** environment:

   **Supabase (Database + Auth):**
   ```
   VITE_SUPABASE_URL=https://hkzvnpksjpxfsyiqyhpk.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_kF1DBfUdwEcFBENzWbXNOQ_nolka5Ns
   ```

   **WalletConnect:**
   ```
   VITE_WALLETCONNECT_PROJECT_ID=35f80388c61eb9c22772f2c64bc0d7da
   ```

   **Environment:**
   ```
   VITE_ENVIRONMENT=production
   ```

   **Contract Addresses - Testnets:**
   ```
   VITE_JOURNAL_PROXY_BASE_SEPOLIA=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
   VITE_JOURNAL_PROXY_BOB_SEPOLIA=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
   VITE_JOURNAL_PROXY_INK_SEPOLIA=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
   ```

   **Contract Addresses - Mainnets (V2.5.3):**
   ```
   VITE_JOURNAL_PROXY_BASE=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
   VITE_JOURNAL_PROXY_BOB=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
   VITE_JOURNAL_PROXY_INK=0xd2e8cb55cb91EC7d111eA187415f309Ba5DaBE8B
   ```

   **Note:** Set these same variables for "Preview" environment if you want preview deployments to work.

3. **Custom Domain**
   - Settings → Domains → Add `yourdomain.com`
   - Add DNS records as instructed (A or CNAME)
   - SSL is automatic

### Deployments

- **Production**: Auto-deploys on push to `main`
- **Preview**: Auto-deploys on PR (unique URL per PR)
- **Manual**: `vercel --prod` from CLI

---

## Smart Contract Deployment

### Prerequisites

- Foundry installed (`foundryup`)
- Testnet ETH on target chains (~0.1 ETH each)
- Etherscan API keys for verification

### Environment Setup

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env`:

```bash
# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BOB_TESTNET_RPC_URL=https://testnet.rpc.gobob.xyz
INK_SEPOLIA_RPC_URL=https://rpc-gel-sepolia.inkonchain.com

# Mainnet RPCs
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BOB_MAINNET_RPC_URL=https://rpc.gobob.xyz

# Deployer wallet
DEPLOYER_PRIVATE_KEY=0x...

# Verification
BASESCAN_API_KEY=your-key
```

### Deploy to Testnet

```bash
cd contracts
forge build

# Base Sepolia (blue gradient)
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast --verify

# Bob Testnet (orange gradient)
forge script script/Deploy.s.sol \
  --rpc-url $BOB_TESTNET_RPC_URL \
  --broadcast

# Ink Sepolia (purple gradient)
forge script script/Deploy.s.sol \
  --rpc-url $INK_SEPOLIA_RPC_URL \
  --broadcast
```

### Deploy to Mainnet

```bash
# Security checklist first:
# - All tests passing (forge test)
# - Frontend tested on testnet
# - Multisig wallet created

forge script script/Deploy.s.sol \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --broadcast --verify --slow

# Transfer ownership to multisig
cast send <PROXY_ADDRESS> \
  "transferOwnership(address)" <MULTISIG_ADDRESS> \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Update Frontend Config

After deployment, update `src/contracts/config.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // Testnet
  84532: '0x...',   // Base Sepolia
  808813: '0x...',  // Bob Testnet
  763373: '0x...',  // Ink Sepolia
  // Mainnet
  8453: '0x...',    // Base Mainnet
  60808: '0x...',   // Bob Mainnet
};
```

---

## Contract Addresses

### Current Deployments (V2.5.3) ✅ PRODUCTION READY

**Testnets:**

| Network | Chain ID | Proxy Address | Explorer |
|---------|----------|---------------|----------|
| **Base Sepolia** | 84532 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Basescan ↗](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Bob Testnet** | 808813 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Bob Explorer ↗](https://testnet.explorer.gobob.xyz/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Ink Sepolia** | 763373 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Ink Explorer ↗](https://explorer-sepolia.inkonchain.com/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |

**Mainnets (LIVE):**

| Network | Chain ID | Proxy Address | Explorer |
|---------|----------|---------------|----------|
| **Base Mainnet** | 8453 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Basescan ↗](https://basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Bob Mainnet** | 60808 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Bob Explorer ↗](https://explorer.gobob.xyz/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Ink Mainnet** | 57073 | `0xd2e8cb55cb91EC7d111eA187415f309Ba5DaBE8B` | [Ink Explorer ↗](https://explorer.inkonchain.com/address/0xd2e8cb55cb91EC7d111eA187415f309Ba5DaBE8B) |

### Frontend Config

Update `src/contracts/config.ts` with these addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  // Testnets
  84532: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',   // Base Sepolia
  808813: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',  // Bob Testnet
  763373: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',  // Ink Sepolia

  // Mainnets (PRODUCTION)
  8453: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',    // Base Mainnet
  60808: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',   // Bob Mainnet
  57073: '0xd2e8cb55cb91EC7d111eA187415f309Ba5DaBE8B',   // Ink Mainnet
};
```

### Version History

- **V2.5.3** (Jan 3, 2026): Critical security fixes - CEI pattern + storage gap (current)
- **V2.5.2**: SVG optimization with shortened chain IDs
- **V2.5.1**: Native text wrapping with `<tspan>` elements
- **V2.5.0**: Chain-specific styles (Ink waves, Base/Bob gradients)
- **V2.4.0**: Simplified minting (2 params), gas optimized
- **V2.3.0**: Added ENS truncation
- **V2.2.0**: Added `updateChainName()`
- **V2.1.0**: Fixed Unicode checkmark
- **V2.0.0**: Added ENS signature verification

---

## Post-Deployment Checklist

### Database (Supabase)
- [ ] Supabase project created
- [ ] `database-setup.sql` executed successfully
- [ ] Web3 authentication enabled
- [ ] Tables created (users, thoughts, bridge_transactions)
- [ ] RLS policies active
- [ ] Database functions created
- [ ] Indexes created
- [ ] Test query works

### Frontend (Vercel)
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL working (automatic)
- [ ] All pages load without errors
- [ ] Wallet connection works

### Smart Contracts
- [ ] Deployed to target chains
- [ ] Verified on block explorers
- [ ] Test mint successful
- [ ] SVG renders in OpenSea

### End-to-End
- [ ] Full flow works: connect → write → mint → gallery
- [ ] Thoughts save to database
- [ ] Minting updates database correctly
- [ ] Gallery displays both styles (Chain Native & Classic)
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile
- [ ] Test with MetaMask, Rabby, Coinbase Wallet

---

## Upgrading Contracts

### UUPS Upgrade Process

```bash
cd contracts

# Deploy new implementation
forge script script/Upgrade.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast --verify

# Upgrade proxy
cast send <PROXY_ADDRESS> \
  "upgradeToAndCall(address,bytes)" \
  <NEW_IMPLEMENTATION> "0x" \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Mainnet Upgrades

Use multisig (Gnosis Safe) for mainnet upgrades:
1. Deploy new implementation
2. Create Safe transaction to call `upgradeToAndCall()`
3. Collect required signatures
4. Execute upgrade

---

## Troubleshooting

### Supabase Connection Issues
1. **Check environment variables** in Vercel:
   - `VITE_SUPABASE_URL` should be your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` should be your anon/publishable key
2. **Verify Web3 auth is enabled** in Supabase Dashboard → Authentication → Providers
3. **Check browser console** for specific Supabase errors
4. **Test Supabase directly**:
   ```bash
   curl https://your-project.supabase.co/rest/v1/ \
     -H "apikey: your-anon-key"
   ```

### Wallet Connection Issues
1. **Check RainbowKit configuration** in `src/main.tsx`
2. **Verify VITE_WALLETCONNECT_PROJECT_ID** is set in Vercel
3. **Test with different wallets** (MetaMask, Rabby, Coinbase Wallet)
4. **Check browser console** for wallet-specific errors

### Contract Verification Failed
```bash
forge verify-contract <ADDRESS> \
  src/OnChainJournal.sol:OnChainJournal \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Minting Fails
1. **Check user has enough ETH** for gas on the target chain
2. **Verify contract address** in `src/contracts/config.ts` matches deployed proxy
3. **Check transaction in block explorer** for specific error message
4. **Ensure wallet is connected** to the correct chain

---

## Estimated Costs

| Item | Cost |
|------|------|
| Vercel (Hobby) | $0/month |
| Supabase (Free tier) | $0/month |
| Domain (if needed) | ~$10/year |
| **Total** | **$0/month** (+ domain if needed) |

**Contract deployment gas:**
- Testnet (Base Sepolia, Bob Testnet, Ink Sepolia): Free (faucet ETH)
- Mainnet (Base, Bob): ~$20-50 one-time per chain

**Note:** No VPS or backend server needed! Everything runs on free tiers.

---

## Support

- **Contract Issues**: See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
- **Development**: See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Quick Setup**: See [QUICK_START.md](QUICK_START.md)
