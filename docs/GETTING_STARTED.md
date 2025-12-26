# Getting Started with MintMyMood

Welcome to the MintMyMood developer community! This guide will help you get set up, whether you want a quick 5-minute start or a deep dive into the full development environment.

## Choose Your Path

- **[🚀 Quick Start (5 min)](#-quick-start-5-min)**: For impatient developers who just want to run the app.
- **[🛠️ Full Setup Guide](#%EF%B8%8F-full-setup-guide)**: For contributors and core developers.

---

## 🚀 Quick Start (5 min)

Run the frontend in minutes without configuring the entire blockchain stack.

### 1. Prerequisites
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git**
- **Crypto Wallet** (e.g., MetaMask, Rabby)

### 2. Clone & Install
```bash
git clone https://github.com/remivalade/MintMyMood.git
cd MintMyMood
npm install
```

### 3. Database Setup (Supabase)

Follow the **[Database Setup Guide](DATABASE_SETUP.md)** to set up your Supabase database (takes ~5 minutes).

### 4. Minimal Config
Copy the environment template:
```bash
cp .env.example .env
```

Fill in **only** these required values in `.env`:
```bash
# Get from your Supabase project (Settings → API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Get from https://cloud.walletconnect.com (Free)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

### 5. Run It
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**. You should be able to connect your wallet and write thoughts (they will auto-save to Supabase).

---

## 🛠️ Full Setup Guide

Follow this text if you plan to modify smart contracts, run the backend API, or contribute to the core logic.

### 1. Install Foundry (for Smart Contracts)
Foundry is our toolkit for Ethereum development.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Initialize the contracts folder:
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit
forge install LayerZero-Labs/LayerZero-v2 --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
cd ..
```

### 2. Backend Setup (Optional but Recommended)
The backend handles ENS signature verification for minting.

```bash
cd backend/api
npm install
# Start signature service
npm start
```
*Note: Requires `SIGNER_PRIVATE_KEY` in `backend/api/.env` for real signatures.*

### 3. Test Everything
Verify your environment is healthy.

**Frontend**:
```bash
npm run dev
```

**Smart Contracts**:
```bash
cd contracts
forge test
# Expect: 28/28 passing
```

---

## 🏗️ Project Structure

- **`src/`**: React Frontend (Vite + Tailwind + Wagmi)
- **`contracts/`**: Solidity Smart Contracts (Foundry)
- **`backend/`**: Express API & Supabase Migrations
- **`docs/`**: Documentation
    - `DEVELOPER_GUIDE.md`: Deep dive into architecture.
    - `CONTRACT_GUIDE.md`: Smart contract reference.
    - `DEPLOYMENT.md`: How to deploy to testnet/mainnet.

## 🐛 Troubleshooting

### "Foundry command not found"
Run `foundryup` and restart your terminal.

### "Supabase connection error"
Check your `.env` variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Ensure your Supabase project is active.

### "WalletConnect error"
Ensure you have a valid Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com) in your `.env`.

---

**Ready to dive deeper?**
Read the [Developer Guide](DEVELOPER_GUIDE.md) for architecture details.
