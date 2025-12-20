# Quick Start - 5 Minutes to Running

Get MintMyMood running locally in 5 minutes.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git**
- **A crypto wallet** (MetaMask, Rabby, etc.)
- **Foundry** (for smart contract work)

---

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone https://github.com/your-username/MintMyMood.git
cd MintMyMood

# Install dependencies
npm install

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Step 2: Environment Setup (2 min)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and fill in these **3 required values**:

```bash
# Supabase (get from: https://app.supabase.com)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# WalletConnect (get from: https://cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

### Getting Your Keys

**Supabase** (Free):
1. Go to [supabase.com](https://supabase.com) → Create account
2. Create new project
3. Go to **Settings** → **API** → Copy URL and anon key

**WalletConnect** (Free):
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create project
3. Copy Project ID

---

## Step 3: Run the App (1 min)

```bash
# Start frontend
npm run dev
```

This starts:
- **Frontend** at http://localhost:3000

---

## Step 4: Test Smart Contracts

```bash
cd contracts
forge build    # Compile contracts
forge test     # Run tests (18/18 should pass)
```

---

## ✅ Verify Everything Works

You should now see:

- ✅ Frontend running at http://localhost:3000
- ✅ No console errors
- ✅ Wallet connection button visible
- ✅ Writing interface loads

### Test the Flow

1. Click "Connect Wallet"
2. Connect your wallet (any testnet is fine)
3. Write a thought in the text area
4. Your thought should auto-save after 3 seconds
5. Check Supabase dashboard → **thoughts** table to see your data

---

## 🚨 Common Issues

### "Cannot find module 'wagmi'"
**Solution**: Run `npm install` in the project root

### "Supabase connection error"
**Solution**: Check your `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### "Foundry command not found"
**Solution**:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
# Restart your terminal
```

---

## 📚 Next Steps

Now that you're running locally:

1. **Understand the architecture** → Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
2. **Deploy contracts** → Read [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
3. **Deploy to production** → Read [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔗 Useful Links

- **Project Status**: See [README.md](../README.md)
- **Tech Stack**: React + TypeScript + Vite | Solidity + Foundry | Supabase
- **Contract Addresses**: See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md#deployed-contracts)

---

**Got it running? Great! Time to explore the codebase.** 🚀
