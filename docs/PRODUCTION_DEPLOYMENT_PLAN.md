# Production Deployment Plan - Free Tier Optimized

**Last Updated**: 2025-11-13
**Status**: Ready for Production Beta Testing
**Target**: Free/low-cost infrastructure with professional reliability

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Recommendations](#infrastructure-recommendations)
3. [Phase 1: Database Setup](#phase-1-database-setup-supabase)
4. [Phase 2: Backend API Deployment](#phase-2-backend-api-deployment)
5. [Phase 3: Frontend Deployment](#phase-3-frontend-deployment)
6. [Phase 4: Environment Configuration](#phase-4-environment-configuration)
7. [Phase 5: Testing & Monitoring](#phase-5-testing--monitoring)
8. [Cost Breakdown](#cost-breakdown)
9. [Scaling Considerations](#scaling-considerations)
10. [Security Checklist](#security-checklist)

---

## Overview

**MintMyMood** is a Web3 journaling application with minimal backend requirements, making it ideal for free-tier infrastructure:

- **Frontend**: Static React app (no server-side rendering needed)
- **Backend**: Single Express.js API with 2 endpoints (minimal compute)
- **Database**: Supabase PostgreSQL with native Web3 auth
- **Smart Contracts**: Already deployed to Base & Bob testnets

**Key Design Principle**: Keep it simple. No microservices, no Kubernetes, no unnecessary complexity.

---

## Infrastructure Recommendations

### Recommended Stack (100% Free Tier)

| Component | Service | Free Tier Limits | Notes |
|-----------|---------|------------------|-------|
| **Frontend Hosting** | Vercel | Unlimited bandwidth, 100GB/mo | Best DX, automatic HTTPS |
| **Backend API** | Railway | $5 credit/month (≈500 hours) | Simple, good for small APIs |
| **Database** | Supabase | 500MB storage, 2GB transfer, 50MB file storage | More than enough |
| **Domain** | Cloudflare | Free DNS, CDN, SSL | Optional but recommended |
| **Monitoring** | Better Stack (Logtail) | Free up to 1GB logs/mo | Optional but helpful |

### Alternative Options

| Component | Alternative | Free Tier | Notes |
|-----------|-------------|-----------|-------|
| **Frontend** | Netlify | 100GB bandwidth/mo | Equally good as Vercel |
| **Frontend** | Cloudflare Pages | Unlimited bandwidth | Fastest edge network |
| **Backend** | Render | 750 hours/mo | Spins down after 15 min inactivity |
| **Backend** | Fly.io | 3 shared VMs, 160GB transfer | More complex but powerful |

**Recommended Choice**: Vercel (frontend) + Railway (backend) + Supabase (database)

---

## Phase 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project:
   - **Name**: `MintMyMood` or `mintmymood-prod`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., US East, EU West)
   - **Plan**: Free tier (500MB database, plenty for beta)

3. Wait 2-3 minutes for database to provision

### 1.2 Run Database Migrations

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /home/user/MintMyMood
supabase link --project-ref <your-project-ref>

# Push all migrations to production
supabase db push --db-url "postgresql://postgres:<password>@<host>:5432/postgres"
```

**Alternative**: Manually run migrations via SQL Editor in Supabase Dashboard:
1. Go to SQL Editor in Supabase dashboard
2. Run each migration file in order (001 → 016)
3. Files located in: `backend/supabase/migrations/`

### 1.3 Enable Row Level Security

✅ **Already configured** in migration files! Verify in Supabase dashboard:
- Go to **Authentication** → **Policies**
- Should see policies for `thoughts` table:
  - "Users can view own thoughts"
  - "Users can insert own thoughts"
  - "Users can update own thoughts"
  - "Users can delete own thoughts"

### 1.4 Configure Supabase Auth for Web3

1. Go to **Authentication** → **Providers**
2. **Disable** email/password authentication (we only use Web3)
3. No additional configuration needed (SIWE is client-side)

### 1.5 Get Supabase Credentials

Save these for later:

```bash
# From Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>

# Keep service_role_key SECRET (never commit or expose to frontend)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # Only for backend if needed
```

---

## Phase 2: Backend API Deployment

### Why We Need a Backend

The backend serves **one critical purpose**: Sign ENS verification messages to prevent identity fraud when minting NFTs. It's a lightweight Express.js server with 2 endpoints.

### Option A: Railway (Recommended - Simplest)

**Free Tier**: $5 credit/month (~500 hours of uptime)

#### 2.1 Setup Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub repo

#### 2.2 Configure Railway Deployment

1. **Connect Repository**:
   - Select your MintMyMood fork/repo
   - Railway will auto-detect the Express app

2. **Set Root Directory**:
   ```
   Root Directory: backend/api
   ```

3. **Configure Build & Start**:
   ```
   Build Command: npm install --production
   Start Command: npm start
   ```

4. **Set Environment Variables**:
   ```bash
   SIGNER_PRIVATE_KEY=0x...  # Generate new wallet: cast wallet new
   PORT=3001
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   NODE_ENV=production
   ```

   **⚠️ IMPORTANT**: Generate a NEW wallet for the signer:
   ```bash
   # Run locally
   cd contracts
   cast wallet new

   # Save the private key for Railway
   # Save the address - you'll need it for contract configuration
   ```

5. **Deploy**: Railway auto-deploys on push to main branch

6. **Get Backend URL**:
   - Railway assigns a URL: `https://<app-name>.up.railway.app`
   - Save this for frontend configuration

#### 2.3 Test Backend API

```bash
# Health check
curl https://<your-app>.up.railway.app/api/health

# Should return:
# {"status":"ok","signerAddress":"0x...","timestamp":"2025-11-13T..."}
```

### Option B: Render.com (Alternative)

**Free Tier**: 750 hours/month (spins down after 15min inactivity)

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect repository
3. Configure:
   - **Root Directory**: `backend/api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Add environment variables (same as Railway)
5. Deploy

**Note**: Free tier spins down after inactivity, causing ~30s cold starts.

### Option C: Fly.io (For Advanced Users)

**Free Tier**: 3 shared VMs, 160GB transfer/month

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Initialize app
cd backend/api
flyctl launch
  # Choose app name
  # Choose region
  # Don't deploy yet

# Set secrets
flyctl secrets set SIGNER_PRIVATE_KEY=0x...
flyctl secrets set FRONTEND_URL=https://your-domain.com

# Deploy
flyctl deploy
```

---

## Phase 3: Frontend Deployment

### Option A: Vercel (Recommended)

**Free Tier**: Unlimited bandwidth, 100GB/month

#### 3.1 Setup Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your MintMyMood repository

#### 3.2 Configure Vercel Project

1. **Framework Preset**: Vite
2. **Root Directory**: `./` (project root)
3. **Build Command**: `npm run build`
4. **Output Directory**: `build` (from vite.config.ts)
5. **Install Command**: `npm install`

#### 3.3 Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase (from Phase 1)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>

# WalletConnect (get from walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=<your-project-id>

# Backend API (from Phase 2)
VITE_BACKEND_URL=https://<your-app>.up.railway.app

# Environment
VITE_ENVIRONMENT=production
```

**Get WalletConnect Project ID**:
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create new project
3. Copy Project ID

#### 3.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your app will be live at `https://<project-name>.vercel.app`

#### 3.5 Configure Custom Domain (Optional)

1. Buy domain from Namecheap/Google Domains (~$10-15/year)
2. In Vercel: Settings → Domains → Add Domain
3. Follow DNS configuration instructions
4. SSL certificate auto-provisioned by Vercel

### Option B: Netlify

**Free Tier**: 100GB bandwidth/month

1. Go to [netlify.com](https://netlify.com)
2. New site from Git → Select repository
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
4. Add environment variables (same as Vercel)
5. Deploy

### Option C: Cloudflare Pages

**Free Tier**: Unlimited bandwidth

1. Go to Cloudflare Dashboard → Pages
2. Create application → Connect to Git
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
4. Add environment variables
5. Deploy

**Advantage**: Fastest global edge network, best for international users

---

## Phase 4: Environment Configuration

### 4.1 Update Backend CORS

After frontend is deployed, update Railway environment variables:

```bash
FRONTEND_URL=https://your-actual-domain.vercel.app
```

Redeploy backend to apply changes.

### 4.2 Update Smart Contract Trusted Signer (if needed)

If you generated a new signer wallet for production:

```bash
cd contracts

# Check current trusted signer
cast call 0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 \
  "trustedSigner()(address)" \
  --rpc-url https://sepolia.base.org

# If different from your new signer, update it (as contract owner)
cast send 0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 \
  "setTrustedSigner(address)" \
  <your-new-signer-address> \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY
```

**Note**: Contract is already deployed with trusted signer `0xEd171c759450B7358e9238567b1e23b4d82f3a64`. Only update if using a different signer for production.

### 4.3 Production Checklist

Before going live, verify:

- [ ] Frontend deployed and accessible
- [ ] Backend API health check responds
- [ ] Supabase database migrations applied
- [ ] Environment variables set correctly
- [ ] CORS configured for production domain
- [ ] WalletConnect project ID configured
- [ ] Smart contract trusted signer matches backend signer
- [ ] Test wallet connection works
- [ ] Test minting flow works end-to-end
- [ ] Test that gallery displays minted thoughts

---

## Phase 5: Testing & Monitoring

### 5.1 End-to-End Testing

Test the complete user flow:

1. **Connect Wallet**
   - Test with MetaMask, Rabby, Coinbase Wallet
   - Verify SIWE authentication works

2. **Write & Save Thought**
   - Write a journal entry
   - Verify auto-save works (check Supabase dashboard)
   - Verify entry appears in gallery

3. **Mint NFT**
   - Select mood and preview
   - Complete minting transaction
   - Verify NFT appears on block explorer
   - Verify thought marked as "Minted" in gallery

4. **View on OpenSea**
   - Get NFT on OpenSea testnet
   - Verify SVG renders correctly
   - Verify metadata displays properly

### 5.2 Browser & Device Testing

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Brave (desktop)
- [ ] iOS Safari (mobile)
- [ ] Android Chrome (mobile)

### 5.3 Monitoring Setup (Optional but Recommended)

#### Better Stack (Free Tier)

1. Go to [betterstack.com](https://betterstack.com)
2. Create account (free tier: 1GB logs/month)
3. Add uptime monitoring for:
   - Frontend: `https://your-domain.com`
   - Backend: `https://your-api.up.railway.app/api/health`
4. Set up email alerts for downtime

#### Railway Built-in Monitoring

Railway provides basic metrics:
- CPU usage
- Memory usage
- Network traffic
- Deployment logs

Access via Railway Dashboard → Metrics tab

---

## Cost Breakdown

### Free Tier (Recommended for Beta)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| **Vercel** | Unlimited bandwidth, 100GB/mo | ~5-10GB for 100 users | $0 |
| **Railway** | $5 credit/month (~500 hours) | ~720 hours (always on) | $0* |
| **Supabase** | 500MB DB, 2GB transfer | ~50MB DB, 1GB transfer | $0 |
| **WalletConnect** | 10,000 requests/month | ~1,000 requests | $0 |
| **Domain** (optional) | N/A | 1 domain | $12/year |
| **Total** | | | **~$1/month** |

*Railway provides $5/month credit, which covers ~500 hours. For 24/7 uptime, you'd need to upgrade (~$2/mo extra).

### Low-Cost Paid Tier (For Growth)

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Vercel** | Pro | $20/month | Team features, analytics |
| **Railway** | Hobby | $5/month included + usage | ~$2/mo for API |
| **Supabase** | Free tier | $0 | Upgrade at 500MB ($25/mo) |
| **Domain** | Annual | $12/year | |
| **Monitoring** | Better Stack Free | $0 | |
| **Total** | | **~$22/month** | Scales to 1,000+ users |

### Enterprise Tier (If You Scale Big)

- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month (dedicated resources)
- **Supabase Pro**: $25/month (8GB DB, more compute)
- **CDN**: Cloudflare free
- **Total**: ~$65/month (supports 10,000+ users)

---

## Scaling Considerations

### When to Upgrade Services

#### Frontend (Vercel)
- **Stay on free tier** until you exceed 100GB bandwidth/month
- **Upgrade to Pro ($20/mo)** when you need:
  - Team collaboration
  - Advanced analytics
  - Password protection for staging

#### Backend (Railway)
- **Stay on free tier** ($5 credit) for <500 hours/month
- **Upgrade to Hobby (~$7/mo)** when you need:
  - 24/7 uptime without sleep
  - Higher rate limits

#### Database (Supabase)
- **Stay on free tier** until you hit 500MB storage or 2GB transfer
- **Upgrade to Pro ($25/mo)** when you need:
  - 8GB database storage
  - Daily backups
  - Point-in-time recovery

### Performance Optimization

1. **Frontend**:
   - Enable Vercel Edge Network (automatic)
   - Use code splitting (already configured with Vite)
   - Optimize images (use WebP format)

2. **Backend**:
   - Railway has auto-scaling (enable in settings)
   - Add Redis cache for frequent ENS lookups (optional)

3. **Database**:
   - Indexes already configured in migrations
   - Enable connection pooling (Supabase default)
   - Use database functions for complex queries

### High Availability

For production with SLA requirements:

1. **Backend**: Deploy to multiple regions
   - Railway: Deploy to US East + EU West
   - Use Cloudflare Load Balancer (free tier supports 2 origins)

2. **Database**:
   - Supabase Pro includes automatic backups
   - Point-in-time recovery available

3. **Monitoring**:
   - Set up uptime monitoring (Better Stack)
   - Configure PagerDuty for critical alerts

---

## Security Checklist

### Pre-Launch Security Audit

- [ ] **Smart Contracts**
  - [ ] All 28 tests passing
  - [ ] UUPS upgrade mechanism tested
  - [ ] Input validation (400 char text, 64 char mood)
  - [ ] ENS signature verification working
  - [ ] Nonce-based replay protection enabled

- [ ] **Backend API**
  - [ ] SIGNER_PRIVATE_KEY kept secret (never in git)
  - [ ] Rate limiting enabled (10 signatures/hour per IP)
  - [ ] CORS restricted to production frontend domain
  - [ ] HTTPS enforced (Railway/Render do this automatically)
  - [ ] No sensitive data in logs

- [ ] **Frontend**
  - [ ] No private keys in client code
  - [ ] Environment variables properly prefixed (VITE_)
  - [ ] HTTPS enforced (Vercel/Netlify do this automatically)
  - [ ] No API keys in client bundle

- [ ] **Database**
  - [ ] Row Level Security (RLS) enabled on all tables
  - [ ] Anon key only exposed to frontend (never service_role_key)
  - [ ] Auth policies tested (users can't access others' data)
  - [ ] Backup strategy in place

- [ ] **Authentication**
  - [ ] SIWE implementation follows EIP-4361 standard
  - [ ] Nonce replay protection (5-minute expiry)
  - [ ] Session management via Supabase native auth
  - [ ] JWT tokens auto-refresh

### Ongoing Security Practices

1. **Dependency Updates**
   - Run `npm audit` weekly
   - Update dependencies monthly
   - Monitor GitHub security alerts

2. **Access Control**
   - Use separate wallets for deployer vs. signer
   - Transfer contract ownership to multisig (mainnet)
   - Rotate signer key every 6 months

3. **Monitoring**
   - Set up alerts for unusual API activity
   - Monitor failed authentication attempts
   - Track mint transaction failures

---

## Troubleshooting

### Frontend Issues

**Problem**: "Failed to fetch" errors when connecting wallet

**Solution**:
1. Check VITE_BACKEND_URL is set correctly
2. Verify backend API is running (test `/api/health`)
3. Check CORS configuration in backend

**Problem**: "Invalid Supabase credentials"

**Solution**:
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
2. Check environment variables are deployed (Vercel dashboard)
3. Redeploy frontend after changing env vars

### Backend Issues

**Problem**: "Signature verification failed"

**Solution**:
1. Check SIGNER_PRIVATE_KEY matches contract's trustedSigner
2. Verify signature expiry (5 minutes default)
3. Check nonce hasn't been used (replay protection)

**Problem**: Backend is down/unreachable

**Solution**:
1. Check Railway deployment logs
2. Verify environment variables are set
3. Check if free tier credit exhausted (Railway usage tab)

### Database Issues

**Problem**: "Row Level Security policy violation"

**Solution**:
1. Verify user is authenticated (check `auth.uid()`)
2. Check RLS policies in Supabase dashboard
3. Run migration 014 to update RLS policies

**Problem**: "Too many connections"

**Solution**:
1. Enable connection pooling in Supabase (enabled by default)
2. Check for connection leaks in frontend code
3. Upgrade to Supabase Pro for more connections

---

## Next Steps After Deployment

1. **Beta Testing** (Current Phase)
   - Deploy to production URLs
   - Recruit 5-10 beta testers
   - Collect feedback on UX and bugs
   - Monitor error rates and performance

2. **Mainnet Preparation**
   - Complete security audit (internal or external)
   - Deploy contracts to Base Mainnet + Bob Mainnet
   - Set up multisig for contract ownership
   - Update frontend to support mainnet networks

3. **Launch**
   - Announce on Twitter/Farcaster
   - Submit to Web3 directories (DappRadar, etc.)
   - Create tutorial video
   - Write launch blog post

4. **Post-Launch**
   - Monitor analytics (Vercel Analytics)
   - Collect user feedback
   - Plan V2 features (LayerZero bridging)
   - Optimize based on usage patterns

---

## Support & Resources

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Smart Contract Guide**: [CONTRACT_GUIDE.md](./CONTRACT_GUIDE.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)

For issues or questions:
- GitHub Issues: https://github.com/remivalade/MintMyMood/issues
- Documentation: See `/docs` folder

---

**Ready to deploy? Start with Phase 1 (Database Setup)!** 🚀
