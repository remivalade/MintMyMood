# Getting Started with Omnichain V1 Development

This guide will help you set up your development environment for the MintMyMood Omnichain V1 project.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Git** installed
- **A crypto wallet** with testnet ETH
- **A code editor** (VS Code recommended)

---

## Step 1: Initial Setup

### 1.1 Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Foundry (for smart contracts)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 1.2 Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Open .env in your editor and fill in the values
```

You'll need to get:
- Testnet RPC URLs (free from Alchemy or Infura)
- WalletConnect Project ID ([Get one here](https://cloud.walletconnect.com/))
- Supabase credentials (we'll set this up next)

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Choose a region close to you
4. Set a strong database password (save it!)

### 2.2 Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the schema from `docs/OMNICHAIN_V1_SPRINT_PLAN.md` (Day 1-2 section)
3. Run the SQL to create the `thoughts` table
4. Run the RLS policies SQL

### 2.3 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** and **anon/public key**
3. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2.4 Test Connection

```bash
# Start the dev server
npm run dev

# Open http://localhost:3000
# Try connecting your wallet
```

---

## Step 3: Get Testnet ETH

You'll need testnet ETH to deploy contracts and test transactions.

### Base Sepolia Testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your wallet
3. Request testnet ETH

### Bob Sepolia Testnet ETH

1. Go to [Bob Testnet Faucet](https://testnet.faucet.gobob.xyz/)
2. Enter your wallet address
3. Request testnet ETH

**Tip**: You'll need ~0.1 ETH on each network for testing.

---

## Step 4: Foundry Setup (Smart Contracts)

### 4.1 Initialize Foundry in Contracts Folder

```bash
cd contracts
forge init --force
```

### 4.2 Install Dependencies

```bash
# Install OpenZeppelin Upgradeable contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable

# Install LayerZero V2
forge install LayerZero-Labs/LayerZero-v2

# Install standard OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### 4.3 Configure Foundry

Create `contracts/foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.22"
optimizer = true
optimizer_runs = 200
via_ir = true

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"
bob_sepolia = "${BOB_SEPOLIA_RPC_URL}"
base = "${BASE_RPC_URL}"
bob = "${BOB_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}" }
base = { key = "${BASESCAN_API_KEY}" }
```

### 4.4 Test Foundry Setup

```bash
# Compile contracts (even though we haven't written them yet)
forge build

# This should complete without errors
```

---

## Step 5: WalletConnect Setup

### 5.1 Get Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create an account
3. Create a new project
4. Copy the **Project ID**
5. Add to `.env`:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your-project-id
   ```

---

## Step 6: Verify Everything Works

### 6.1 Start Development Server

```bash
# In root directory
npm run dev
```

### 6.2 Checklist

- [ ] Dev server runs at http://localhost:3000
- [ ] You can connect your wallet (RainbowKit modal appears)
- [ ] No console errors
- [ ] Writing interface loads

### 6.3 Test Supabase Connection

Try writing a thought and checking if it saves to Supabase:

1. Connect your wallet
2. Write some text in the writing interface
3. Go to Supabase dashboard → **Table Editor** → **thoughts**
4. You should see a new row with your thought

---

## Step 7: Understanding the Project Structure

```
MintMyMood/
├── src/                          # Frontend React app
│   ├── components/               # React components
│   ├── config/                   # Configuration files (NEW)
│   │   ├── chains.ts            # Chain configurations
│   │   ├── contracts.ts         # Contract addresses & ABIs
│   │   └── wagmi.ts             # Wagmi setup
│   ├── store/                    # Zustand state management (NEW)
│   └── App.tsx                   # Main app
│
├── contracts/                    # Smart contracts
│   ├── src/                      # Solidity source files
│   ├── test/                     # Contract tests
│   ├── script/                   # Deployment scripts
│   └── foundry.toml              # Foundry configuration
│
├── docs/                         # Documentation
│   ├── OMNICHAIN_V1_SPRINT_PLAN.md  # 10-week plan
│   ├── CONTRACT_GUIDE.md         # Smart contract docs
│   └── API.md                    # Backend API docs
│
└── .env                          # Environment variables (DO NOT COMMIT)
```

---

## Step 8: Development Workflow

### Daily Workflow

1. **Morning**: Check sprint plan for today's tasks
2. **Code**: Work on assigned tasks
3. **Test**: Test your changes locally
4. **Commit**: Commit your work with descriptive messages
5. **Evening**: Update sprint plan checklist

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: descriptive message"

# Push to remote
git push origin feature/your-feature-name
```

### Testing Workflow

```bash
# Test smart contracts
cd contracts
forge test -vvv

# Test frontend
npm run dev
# Manual testing in browser

# Build production bundle
npm run build
```

---

## Common Issues & Solutions

### Issue: "Cannot find module 'wagmi'"

**Solution**: Run `npm install` in the root directory.

---

### Issue: "Supabase connection refused"

**Solution**:
1. Check your `.env` file has correct Supabase URL and key
2. Ensure Supabase project is not paused
3. Check RLS policies are correctly set up

---

### Issue: "Foundry command not found"

**Solution**:
```bash
# Reinstall Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Restart terminal
```

---

### Issue: "Transaction rejected"

**Solution**:
1. Ensure you have testnet ETH
2. Check you're on the correct network (Base Sepolia or Bob Sepolia)
3. Try increasing gas limit

---

## Next Steps

Once everything is set up:

1. Read `docs/OMNICHAIN_V1_SPRINT_PLAN.md`
2. Start with **Sprint 1, Day 1**
3. Follow the checklist day by day
4. Ask questions if you get stuck!

---

## Useful Resources

### Documentation
- [LayerZero V2 Docs](https://docs.layerzero.network/)
- [OpenZeppelin Upgradeable](https://docs.openzeppelin.com/upgrades-plugins/)
- [Foundry Book](https://book.getfoundry.sh/)
- [wagmi Documentation](https://wagmi.sh/)
- [Supabase Docs](https://supabase.com/docs)

### Tools
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [Bob Testnet Explorer](https://testnet.explorer.gobob.xyz/)
- [LayerZero Scan](https://testnet.layerzeroscan.com/)
- [Supabase Dashboard](https://app.supabase.com/)

### Community
- [LayerZero Discord](https://discord-layerzero.netlify.app/discord)
- [Base Discord](https://discord.gg/buildonbase)

---

**Ready to start building? Let's go! 🚀**
