# Deployment Guide

Complete guide for deploying MintMyMood to production.

---

## Table of Contents

1. [Overview](#overview)
2. [Hosting Stack](#hosting-stack)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Backend Deployment (Hostinger VPS)](#backend-deployment-hostinger-vps)
6. [Smart Contract Deployment](#smart-contract-deployment)
7. [Contract Addresses](#contract-addresses)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Upgrading Contracts](#upgrading-contracts)
10. [Troubleshooting](#troubleshooting)

---

## Overview

MintMyMood consists of three deployment components:

| Component | Platform | Cost |
|-----------|----------|------|
| **Frontend** | Vercel (Hobby) | $0 |
| **Backend API** | Hostinger VPS | ~$5/month |
| **Database** | Supabase | $0 (free tier) |
| **Smart Contracts** | Base, Bob, Ink | One-time gas fees |

---

## Hosting Stack

### Why This Stack?

- **Vercel**: Free tier with 100GB bandwidth, global CDN, auto-deploy on git push, custom domain support
- **Hostinger VPS**: Always-on Node.js (no cold starts), ~$5/month for 4GB RAM, full control
- **Supabase**: Managed PostgreSQL with RLS, generous free tier

### Architecture

```
Users → Vercel (yourdomain.com) → Frontend (React)
                ↓
        Hostinger VPS (api.yourdomain.com) → Backend (Express.js)
                ↓
        Supabase → Database (PostgreSQL)
                ↓
        Base/Bob/Ink → Smart Contracts (ERC721)
```

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

   In Vercel Dashboard → Settings → Environment Variables:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_WALLETCONNECT_PROJECT_ID=your-project-id
   VITE_BACKEND_URL=https://api.yourdomain.com
   VITE_ENVIRONMENT=production
   ```

3. **Custom Domain**
   - Settings → Domains → Add `yourdomain.com`
   - Add DNS records as instructed (A or CNAME)
   - SSL is automatic

### Deployments

- **Production**: Auto-deploys on push to `main`
- **Preview**: Auto-deploys on PR (unique URL per PR)
- **Manual**: `vercel --prod` from CLI

---

## Backend Deployment (Hostinger VPS)

### VPS Requirements

- **Plan**: KVM 1 or higher (4GB RAM, 1 vCPU)
- **OS**: Ubuntu 22.04 or 24.04
- **Location**: EU or US (based on audience)

### Initial Server Setup

```bash
# SSH into VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Certbot for SSL
apt install -y certbot
```

### Deploy Backend

```bash
# Create app directory
mkdir -p /var/www/mintmymood-api
cd /var/www/mintmymood-api

# Clone or copy backend files
# Option A: Git clone
git clone https://github.com/your-repo.git .
cd backend/api

# Option B: SCP from local
# scp -r backend/api/* root@your-vps-ip:/var/www/mintmymood-api/

# Install dependencies
npm install --production

# Create environment file
cat > .env << 'EOF'
PORT=3001
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-secure-jwt-secret-min-32-chars
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# Start with PM2
pm2 start server.js --name mintmymood-api
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### SSL with Let's Encrypt

```bash
# Point api.yourdomain.com to VPS IP first (A record in DNS)

# Get SSL certificate
certbot certonly --standalone -d api.yourdomain.com

# Certificates stored at:
# /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/api.yourdomain.com/privkey.pem

# Auto-renewal (already configured by certbot)
certbot renew --dry-run  # Test renewal
```

### Update Backend for HTTPS

Update `backend/api/server.js` to use HTTPS:

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
```

Or use **Nginx as reverse proxy** (recommended):

```bash
apt install -y nginx

cat > /etc/nginx/sites-available/mintmymood-api << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/mintmymood-api /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

### Verify Backend

```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok"}
```

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

### Current Deployments (V2.4.0)

| Network | Chain ID | Proxy Address | Explorer |
|---------|----------|---------------|----------|
| **Base Sepolia** | 84532 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Basescan](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Bob Testnet** | 808813 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Bob Explorer](https://testnet.explorer.gobob.xyz/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Ink Sepolia** | 763373 | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Ink Explorer](https://explorer-sepolia.inkonchain.com/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| **Base Mainnet** | 8453 | TBD | - |
| **Bob Mainnet** | 60808 | TBD | - |

### Version History

- **V2.4.0**: Simplified minting (2 params), gas optimized (current)
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

### Backend (Hostinger VPS)
- [ ] PM2 running and auto-start enabled
- [ ] SSL certificate installed
- [ ] CORS configured for frontend domain
- [ ] Health endpoint responding

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

### CORS Error
Update `backend/api/server.js`:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### Backend Not Starting
```bash
pm2 logs mintmymood-api  # Check logs
pm2 restart mintmymood-api
```

### SSL Certificate Issues
```bash
certbot renew --force-renewal
systemctl restart nginx
```

### Contract Verification Failed
```bash
forge verify-contract <ADDRESS> \
  src/OnChainJournal.sol:OnChainJournal \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Frontend Can't Connect
1. Check `VITE_BACKEND_URL` in Vercel env vars
2. Verify backend is accessible: `curl https://api.yourdomain.com/health`
3. Check browser console for specific errors

---

## Estimated Costs

| Item | Cost |
|------|------|
| Vercel (Hobby) | $0/month |
| Hostinger VPS (12 months) | ~$5/month |
| Supabase (Free tier) | $0/month |
| Domain (if needed) | ~$10/year |
| **Total** | **~$5/month** |

Contract deployment gas (testnet): Free
Contract deployment gas (mainnet): ~$50-150 one-time

---

## Support

- **Contract Issues**: See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
- **Development**: See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Quick Setup**: See [QUICK_START.md](QUICK_START.md)
