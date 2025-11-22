# Deployment Guide

Complete guide for deploying MintMyMood to testnet and mainnet.

---

## Table of Contents

1. [Overview](#overview)
2. [Testnet Deployment](#testnet-deployment)
3. [Mainnet Deployment](#mainnet-deployment)
4. [Contract Addresses](#contract-addresses)
5. [Frontend Deployment](#frontend-deployment)
6. [Backend API Deployment](#backend-api-deployment)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Overview

MintMyMood consists of three deployment components:

1. **Smart Contracts** - Deployed to Base, Bob, & Ink (testnet → mainnet)
2. **Frontend** - React app deployed to Vercel/Netlify
3. **Backend API** - Express.js signature service (OVH or similar)

---

## Testnet Deployment

### Prerequisites

- **Testnet ETH** on Base Sepolia, Bob Testnet, and Ink Sepolia (~0.1 ETH each)
- **Foundry** installed (`foundryup`)
- **RPC URLs** (Alchemy, Infura, or public)
- **Etherscan API keys** (for contract verification)

### Step 1: Prepare Environment

```bash
cd contracts

# Copy environment template
cp .env.example .env
```

Edit `contracts/.env`:

```bash
# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BOB_TESTNET_RPC_URL=https://testnet.rpc.gobob.xyz
INK_SEPOLIA_RPC_URL=https://rpc-gel-sepolia.inkonchain.com

# Deployer wallet private key
DEPLOYER_PRIVATE_KEY=0x...  # Your testnet wallet

# Etherscan API keys (for verification)
BASESCAN_API_KEY=your-basescan-key
```

### Step 2: Generate Trusted Signer Wallet

```bash
# Generate new wallet for ENS signature verification
cast wallet new

# Output:
# Address: 0xEd171c759450B7358e9238567b1e23b4d82f3a64
# Private key: 0x...

# Save this address - you'll need it for contract initialization
# Save private key - you'll need it for backend API
```

### Step 3: Deploy to Base Sepolia

```bash
cd contracts

# Compile contracts
forge build

# Deploy (replace SIGNER_ADDRESS with address from Step 2)
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  --constructor-args "#0052FF" "#3c8aff" "0xEd171c759450B7358e9238567b1e23b4d82f3a64"

# Output will show:
# ✅ Proxy deployed at: 0x...
# ✅ Implementation deployed at: 0x...
```

**Save the proxy address** - this is your contract address.

### Step 4: Deploy to Bob Testnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url $BOB_TESTNET_RPC_URL \
  --broadcast \
  --constructor-args "#FF6B35" "#F7931E" "0xEd171c759450B7358e9238567b1e23b4d82f3a64"

# Note: Bob testnet explorer verification may fail due to API issues
# Contract will still work, just won't be verified on explorer
```

### Step 5: Deploy to Ink Sepolia

```bash
forge script script/Deploy.s.sol \
  --rpc-url $INK_SEPOLIA_RPC_URL \
  --broadcast \
  --constructor-args "#7A20DB" "#9D4DFA" "0xEd171c759450B7358e9238567b1e23b4d82f3a64"
```

### Step 6: Verify Deployment

```bash
# Test minting via cast
cast send <PROXY_ADDRESS> \
  "mintEntry(string,string,string,bytes,uint256,uint256)" \
  "Test thought" "😊" "" "0x..." 0 <EXPIRY> \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY

# Check token URI (should return base64 JSON with SVG)
cast call <PROXY_ADDRESS> "tokenURI(uint256)" 1 \
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Step 7: Update Frontend Configuration

Edit `src/contracts/config.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  84532: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',  // Base Sepolia
  808813: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',  // Bob Testnet
  763373: '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8',  // Ink Sepolia
};
```

### Step 8: Deploy Backend API

See [Backend API Deployment](#backend-api-deployment) section below.

---

## Mainnet Deployment

### Prerequisites

- **Mainnet ETH** on Base and Bob (~$200 worth for deployment gas)
- **Security audit** (recommended for production)
- **Multisig setup** (Gnosis Safe) for contract ownership

### Step 1: Security Checklist

Before deploying to mainnet:

- [ ] All tests passing (`forge test` - 28/28)
- [ ] Contracts audited (internal or external)
- [ ] Backend API secured and rate-limited
- [ ] Frontend tested on testnet
- [ ] Multisig wallet created (3-of-5 recommended)
- [ ] Emergency pause mechanism tested
- [ ] Gas costs estimated and acceptable

### Step 2: Deploy to Base Mainnet

```bash
cd contracts

# Update .env with mainnet RPC
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --slow \
  --constructor-args "#0052FF" "#3c8aff" "0xYourMainnetSignerAddress"
```

### Step 3: Deploy to Bob Mainnet

```bash
BOB_MAINNET_RPC_URL=https://rpc.gobob.xyz

forge script script/Deploy.s.sol \
  --rpc-url $BOB_MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --constructor-args "#FF6B35" "#F7931E" "0xYourMainnetSignerAddress"
```

### Step 4: Transfer Ownership to Multisig

```bash
# Transfer proxy admin to multisig
cast send <PROXY_ADDRESS> \
  "transferOwnership(address)" \
  <MULTISIG_ADDRESS> \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY

# Repeat for Bob Mainnet
```

### Step 5: Update Frontend for Mainnet

Edit `src/contracts/config.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // Testnet
  84532: '0x...',   // Base Sepolia
  808813: '0x...',  // Bob Testnet
  763373: '0x...',  // Ink Sepolia

  // Mainnet
  8453: '0x...',    // Base Mainnet
  60808: '0x...',   // Bob Mainnet
  TBD: '0x...',     // Ink Mainnet
};
```

---

## Contract Addresses

### Current Deployments (V2.3.0)

| Network | Chain ID | Proxy Address | Implementation | Explorer |
|---------|----------|---------------|----------------|----------|
| **Base Sepolia** | 84532 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | `0x95a7BbfFBffb2D1e4b73B8F8A9435CE48dE5b47A` | [Basescan](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Bob Testnet** | 808813 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012` | [Bob Explorer](https://testnet.explorer.gobob.xyz/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Ink Sepolia** | 763373 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | TBD | [Ink Explorer](https://explorer-sepolia.inkonchain.com/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Base Mainnet** | 8453 | TBD | TBD | - |
| **Bob Mainnet** | 60808 | TBD | TBD | - |
| **Ink Mainnet** | TBD | TBD | TBD | - |

**Trusted Signer (Testnet)**: `0xEd171c759450B7358e9238567b1e23b4d82f3a64`

### Version History

- **V1.0.0**: Initial deployment (deprecated)
- **V2.0.0**: Added ENS signature verification
- **V2.1.0**: Fixed Unicode checkmark display
- **V2.2.0**: Added `updateChainName()` function
- **V2.3.0**: Added ENS truncation (current)

---

## Frontend Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Build
npm run build

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_WALLETCONNECT_PROJECT_ID
# - VITE_BACKEND_URL (production backend API)
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy build/ directory to Netlify
# Configure environment variables in Netlify dashboard
```

### Custom Domain

1. Point domain to Vercel/Netlify
2. Configure DNS (A/CNAME records)
3. Enable HTTPS (automatic with Vercel/Netlify)
4. Update CORS settings in backend API

---

## Backend API Deployment

### Deploy to OVH Shared Hosting

```bash
cd backend/api

# Install dependencies
npm install --production

# Create .env on server
SIGNER_PRIVATE_KEY=0x...  # Same signer as contract
PORT=3001
FRONTEND_URL=https://your-domain.com

# Start with PM2 (process manager)
pm2 start server.js --name mintmymood-api
pm2 save
pm2 startup  # Enable auto-restart on reboot
```

### Deploy to Railway/Render (Alternative)

1. Connect GitHub repository
2. Select `backend/api` directory
3. Configure environment variables:
   - `SIGNER_PRIVATE_KEY`
   - `PORT=3001`
   - `FRONTEND_URL=https://your-domain.com`
4. Deploy

### API Health Check

```bash
# Test endpoint
curl https://api.your-domain.com/health

# Should return: {"status":"ok"}
```

---

## Post-Deployment Checklist

### Smart Contracts

- [ ] Contracts deployed to both chains
- [ ] Contracts verified on block explorers
- [ ] Test minting works on both chains
- [ ] SVG renders correctly in OpenSea/NFT viewers
- [ ] ENS verification works (with backend API)
- [ ] Ownership transferred to multisig (mainnet only)

### Frontend

- [ ] Deployed to production URL
- [ ] Environment variables configured
- [ ] Contract addresses updated
- [ ] All pages load without errors
- [ ] Wallet connection works
- [ ] Minting flow works end-to-end
- [ ] Gallery displays minted NFTs

### Backend API

- [ ] API deployed and accessible
- [ ] Rate limiting enabled (10 req/hour)
- [ ] CORS configured for frontend domain
- [ ] Signer wallet funded (small amount for gas)
- [ ] Logs/monitoring set up

### Testing

- [ ] Test complete flow on testnet
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Brave)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test wallet connections (MetaMask, Rabby, Coinbase Wallet)

---

## Upgrading Contracts (UUPS)

### Testnet Upgrade

```bash
cd contracts

# Deploy new implementation
forge script script/Upgrade.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify

# Output: New implementation at 0x...

# Upgrade proxy (as contract owner)
cast send <PROXY_ADDRESS> \
  "upgradeToAndCall(address,bytes)" \
  <NEW_IMPLEMENTATION> \
  "0x" \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Mainnet Upgrade (via Multisig)

1. Deploy new implementation (non-privileged operation)
2. Create multisig proposal to call `upgradeToAndCall()`
3. Wait for multisig threshold (e.g., 3-of-5 signatures)
4. Execute upgrade transaction
5. Verify upgrade successful via block explorer

---

## Troubleshooting

### Contract Verification Failed

**Solution**:
```bash
# Manual verification
forge verify-contract \
  <CONTRACT_ADDRESS> \
  src/OnChainJournal.sol:OnChainJournal \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(string,string,address)" "#0052FF" "#3c8aff" "0x...")
```

### Mint Transaction Fails

**Common causes**:
- Insufficient gas
- Expired signature (5 min expiry)
- Wrong nonce (check contract: `nonces(address)`)
- Backend API offline

**Debug**:
```bash
# Check current nonce
cast call <PROXY_ADDRESS> "nonces(address)" <USER_ADDRESS> --rpc-url $BASE_SEPOLIA_RPC_URL

# Check trusted signer
cast call <PROXY_ADDRESS> "trustedSigner()" --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Frontend Can't Connect to Contract

**Solution**:
1. Check contract address in `src/contracts/config.ts`
2. Verify chain ID matches (Base Sepolia = 84532)
3. Check RPC endpoint in wagmi config
4. Verify ABI is up-to-date: `forge build && cat out/...`

### Backend API CORS Error

**Solution**:
Edit `backend/api/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## Gas Costs (Estimated)

| Operation | Base Sepolia | Bob Testnet | Ink Sepolia | Notes |
|-----------|--------------|-------------|-------------|-------|
| Deploy implementation | ~2,500,000 gas | ~2,500,000 gas | ~2,500,000 gas | One-time |
| Deploy proxy | ~500,000 gas | ~500,000 gas | ~500,000 gas | One-time |
| Mint (no ENS) | ~220,000 gas | ~220,000 gas | ~220,000 gas | Per mint |
| Mint (with ENS) | ~240,000 gas | ~240,000 gas | ~240,000 gas | +20k for signature |
| Upgrade implementation | ~50,000 gas | ~50,000 gas | ~50,000 gas | Rare |

**Total deployment cost** (testnet): Free (testnet ETH)
**Total deployment cost** (mainnet): ~$50-150 (depends on gas prices)

---

## Support

- **Contract Issues**: See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
- **Development**: See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **General Setup**: See [QUICK_START.md](QUICK_START.md)

---

**Ready to deploy? Follow the checklist step by step!** 🚀
