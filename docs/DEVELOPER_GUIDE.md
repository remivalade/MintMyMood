# Developer Guide

A comprehensive guide to understanding and working with the MintMyMood codebase.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Key Concepts](#key-concepts)
4. [Development Workflow](#development-workflow)
5. [Common Tasks](#common-tasks)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)

---

## Architecture Overview

MintMyMood is a full-stack Web3 application with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 18 + TypeScript + Vite + Tailwind + RainbowKit      │
│  (Single-page app with view-based navigation)               │
└──────────────┬────────────────────────┬─────────────────────┘
               │                        │
               │                        │
       ┌───────▼────────┐      ┌────────▼──────────┐
       │   Supabase     │      │  Smart Contracts  │
       │  (PostgreSQL)  │      │   (Solidity)      │
       │                │      │                   │
       │ • Thoughts     │      │ • Base Sepolia    │
       │ • Users        │      │ • Bob Testnet     │
       │ • Auto-save    │      │ • UUPS Upgradeable│
       └────────────────┘      └───────────────────┘
```

### Core Flow

1. **Writing Interface** → User writes a thought (auto-saves to Supabase after 3 seconds)
2. **Mood Selection** → User selects an emoji mood
3. **Mint Preview** → User previews the NFT and chooses to mint or discard
4. **Minting** → Transaction sent to smart contract (with ENS verification)
5. **Gallery** → Shows all thoughts (both minted and ephemeral) fetched from Supabase

---

## Project Structure

```
MintMyMood/
├── src/                              # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── WritingInterface.tsx     # Page 1: Writing editor (auto-save)
│   │   ├── MoodSelection.tsx        # Page 2: Mood emoji picker
│   │   ├── MintPreview.tsx          # Page 3: NFT preview before minting
│   │   ├── Gallery.tsx              # Gallery view with filters
│   │   ├── ThoughtDetail.tsx        # Individual thought view
│   │   ├── ThoughtCard.tsx          # Card component for gallery
│   │   ├── Header.tsx               # Shared header with wallet connection
│   │   ├── WalletModal.tsx          # Wallet connection modal
│   │   ├── MintingModal.tsx         # Minting status modal
│   │   └── ui/                      # Radix UI primitives
│   │
│   ├── hooks/
│   │   ├── useEnsName.ts            # ENS name resolution (Ethereum Mainnet)
│   │   └── useMintJournalEntry.ts   # Smart contract minting hook
│   │
│   ├── store/
│   │   └── useThoughtStore.ts       # Zustand global state
│   │
│   ├── lib/
│   │   ├── supabaseClient.ts        # Supabase initialization
│   │   ├── signatureApi.ts          # ENS signature API client
│   │   └── wagmi.ts                 # wagmi + RainbowKit config
│   │
│   ├── contracts/
│   │   ├── OnChainJournal.abi.json  # Contract ABI
│   │   └── config.ts                # Contract addresses per chain
│   │
│   ├── utils/
│   │   └── generateLocalSVG.ts      # Local SVG matching on-chain output
│   │
│   ├── App.tsx                      # Main app component with routing
│   └── main.tsx                     # Entry point
│
├── contracts/                        # Smart Contracts (Foundry)
│   ├── src/
│   │   └── OnChainJournal.sol       # UUPS Upgradeable ERC721
│   ├── test/
│   │   └── OnChainJournal.t.sol     # Foundry tests (28/28 passing)
│   ├── script/
│   │   ├── Deploy.s.sol             # Initial deployment script
│   │   └── Upgrade.s.sol            # UUPS upgrade script
│   └── foundry.toml                 # Foundry configuration
│
├── backend/
│   ├── api/
│   │   ├── server.js                # Express.js signature service
│   │   └── package.json
│   └── supabase/
│       └── migrations/              # Database migrations
│
├── docs/                             # Documentation
│   ├── QUICK_START.md               # 5-minute setup guide
│   ├── DEVELOPER_GUIDE.md           # This file
│   ├── CONTRACT_GUIDE.md            # Smart contract details
│   ├── DEPLOYMENT.md                # Deployment instructions
│   ├── svg/
│   │   ├── README.md                # SVG design specifications
│   │   ├── BASE.svg                 # Base chain SVG reference
│   │   └── BOB.svg                  # Bob chain SVG reference
│   └── archive/                     # Historical sprint docs
│
├── .env.example                      # Environment variables template
├── README.md                         # Project overview
└── CLAUDE.md                         # AI assistant context
```

---

## Key Concepts

### 1. Ephemeral vs Permanent

- **Ephemeral thoughts**: Auto-delete after 7 days (currently 10 min for testing)
- **Permanent thoughts**: Minted as NFTs, stored forever on-chain
- Users can preview before committing to permanent minting

### 2. Auto-Save System

**Location**: `src/components/WritingInterface.tsx:62-79`

- Saves to Supabase after 3 seconds of no typing (debounced)
- Tracks draft IDs to prevent duplicate saves
- Uses Zustand store for state management
- Shows toast notifications on success/error

```typescript
// Simplified auto-save logic
useEffect(() => {
  const timer = setTimeout(async () => {
    if (text.trim() && walletAddress) {
      await saveThought({ text, wallet_address: walletAddress });
      toast.success('Thought saved');
    }
  }, 3000);

  return () => clearTimeout(timer);
}, [text, walletAddress]);
```

### 3. ENS Verification System

**Problem**: Without verification, anyone can mint with any ENS name (identity fraud)

**Solution**: Hybrid signature verification

1. Frontend requests signature from backend API (`/api/ens-signature`)
2. Backend verifies ENS ownership and signs the mint request
3. Smart contract verifies signature using ECDSA
4. NFT displays `✓ ensname.eth` for verified ENS

**Locations**:
- Backend API: `backend/api/server.js`
- Smart contract: `contracts/src/OnChainJournal.sol:mintEntry()`
- Frontend: `src/lib/signatureApi.ts` + `src/hooks/useMintJournalEntry.ts`

### 4. State Management

**Global State** (Zustand): `src/store/useThoughtStore.ts`
- Thoughts array
- CRUD operations (save, fetch, delete)
- Minting operations

**Local State**: Component-level (React hooks)
- View navigation (`App.tsx`)
- Form inputs
- Modal visibility

**Web3 State**: wagmi hooks
- Wallet connection
- Contract reads/writes
- Transaction status

### 5. Smart Contract Architecture

**Pattern**: UUPS Upgradeable Proxy

```
User → Proxy (0xC2De...) → Implementation (0x95a7...)
                          (can be upgraded)
```

**Key Functions**:
- `mintEntry(text, mood, ensName, signature, nonce, expiry)` - Mint NFT
- `tokenURI(tokenId)` - Returns base64-encoded JSON metadata
- `generateSVG(entry)` - On-chain SVG generation
- `upgradeToAndCall(newImpl, data)` - UUPS upgrade (owner only)

**Chain-Specific Gradients**:
- Base: Blue `#0052FF` → `#3c8aff`
- Bob: Orange `#FF6B35` → `#F7931E`

---

## Development Workflow

### Daily Workflow

```bash
# 1. Start development servers (in 2 terminals)
npm run dev              # Frontend (port 3000)
cd backend/api && npm start  # Backend API (port 3001)

# 2. Make changes to code

# 3. Test changes
# - Frontend: Check http://localhost:3000
# - Contracts: cd contracts && forge test

# 4. Commit
git add .
git commit -m "feat: description of changes"
```

### Smart Contract Workflow

```bash
cd contracts

# Compile contracts
forge build

# Run tests (28/28 should pass)
forge test

# Run specific test with verbose output
forge test --match-test testMintEntry -vvv

# Check gas usage
forge test --gas-report

# Deploy to testnet
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### Database Changes

1. Create migration file in `backend/supabase/migrations/`
2. Write SQL (table changes, RLS policies, etc.)
3. Run migration in Supabase dashboard (SQL Editor)
4. Update TypeScript types if needed

---

## Common Tasks

### Add a New React Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="p-4">
      <h1>{title}</h1>
    </div>
  );
}
```

Usage:
```typescript
import MyComponent from './components/MyComponent';
<MyComponent title="Hello" />
```

### Add a New Zustand Store Action

```typescript
// src/store/useThoughtStore.ts
const useThoughtStore = create<ThoughtStore>((set, get) => ({
  // ... existing state

  // New action
  myNewAction: async (param: string) => {
    set({ isLoading: true });
    try {
      // Do something
      const result = await supabase.from('thoughts').select();
      set({ thoughts: result.data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

### Add a New Smart Contract Function

1. Edit `contracts/src/OnChainJournal.sol`
2. Add function:
```solidity
function myNewFunction(uint256 tokenId) public view returns (string memory) {
    require(_ownerOf(tokenId) != address(0), "Token does not exist");
    return journalEntries[tokenId].text;
}
```
3. Write test in `contracts/test/OnChainJournal.t.sol`
4. Run `forge test`
5. Deploy upgrade (see [DEPLOYMENT.md](DEPLOYMENT.md))

### Update Contract Addresses (After Deployment)

1. Edit `src/contracts/config.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  84532: '0xYourNewAddress', // Base Sepolia
  808813: '0xYourNewAddress', // Bob Testnet
};
```
2. Regenerate ABI: `forge build && cat out/OnChainJournal.sol/OnChainJournal.json | jq .abi > ../src/contracts/OnChainJournal.abi.json`

---

## Environment Variables

### Frontend (`.env`)

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WalletConnect (required)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Backend API (optional - for ENS minting)
VITE_BACKEND_URL=http://localhost:3001

# Environment
VITE_ENVIRONMENT=development
```

### Backend API (`backend/api/.env`)

```bash
# Trusted signer wallet (for ENS signatures)
SIGNER_PRIVATE_KEY=0x...

# Server config
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Smart Contracts (`contracts/.env`)

```bash
# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BOB_TESTNET_RPC_URL=https://testnet.rpc.gobob.xyz

# Deployer wallet
DEPLOYER_PRIVATE_KEY=0x...

# Etherscan API keys (for verification)
BASESCAN_API_KEY=your-key
BOBSCAN_API_KEY=your-key

# Contract addresses (filled after deployment)
JOURNAL_PROXY_BASE_SEPOLIA=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
JOURNAL_PROXY_BOB_TESTNET=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
```

---

## Testing

### Frontend Testing

Manual testing checklist:

```bash
npm run dev

# Test flow:
1. ✓ Connect wallet
2. ✓ Write thought → auto-saves after 3 seconds
3. ✓ Select mood emoji
4. ✓ Preview mint (shows SVG)
5. ✓ Switch chains (Base/Bob)
6. ✓ Mint NFT (requires testnet ETH)
7. ✓ View in gallery
8. ✓ Delete ephemeral thought
```

### Smart Contract Testing

```bash
cd contracts
forge test -vvv

# All 28 tests should pass:
# ✓ Initialization tests (3)
# ✓ Minting tests (8)
# ✓ ENS signature verification (9)
# ✓ SVG generation (5)
# ✓ Admin functions (3)
```

### Database Testing

```bash
# Test Supabase connection
npx tsx backend/supabase/test-connection.ts

# Check:
# ✓ Connection successful
# ✓ Can insert thought
# ✓ Can read thought
# ✓ RLS policies working
```

---

## Design Philosophy

**Skeuomorphic Minimalism** - Clean digital interface with subtle textures that evoke physical journaling.

### Colors
- **Paper Cream**: `#F9F7F1` (main background)
- **Soft Black**: `#2D2D2D` (primary text)
- **Leather Brown**: `#8B7355` (accent)

### Typography
- **Lora** (serif) - User-generated journal text
- **Inter** (sans-serif) - UI elements

### Layout
- 8pt grid system
- 680px max content width (centered)
- Generous whitespace

---

## Database Schema

### `thoughts` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wallet_address | text | User's wallet (lowercase) |
| text | text | Journal entry text (max 400 bytes) |
| mood | text | Emoji mood |
| created_at | timestamp | Creation timestamp |
| expires_at | timestamp | Expiry (null if minted) |
| is_minted | boolean | Mint status |
| origin_chain_id | integer | Chain where minted |
| current_chain_id | integer | Current chain (for future bridging) |
| token_id | text | NFT token ID |
| mint_tx_hash | text | Mint transaction hash |
| nft_metadata | jsonb | NFT metadata |

**Indexes**: wallet_address, is_minted, expires_at

**RLS Policies**: Users can only see/modify their own thoughts (based on wallet_address)

---

## Key Files Reference

### Most Important Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/App.tsx` | Main app, routing logic | 300 |
| `src/store/useThoughtStore.ts` | Global state management | 250 |
| `src/components/WritingInterface.tsx` | Writing + auto-save | 200 |
| `src/components/MintPreview.tsx` | Minting flow | 250 |
| `src/hooks/useMintJournalEntry.ts` | Smart contract minting | 150 |
| `contracts/src/OnChainJournal.sol` | Smart contract | 500 |
| `backend/api/server.js` | ENS signature service | 100 |

---

## Tech Stack Deep Dive

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool (fast HMR)
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **wagmi v2**: Web3 React hooks
- **viem**: Ethereum library (TypeScript-first)
- **RainbowKit**: Wallet connection UI
- **Zustand**: Lightweight state management
- **Sonner**: Toast notifications

### Backend
- **Supabase**: PostgreSQL database + auth
- **Express.js**: ENS signature API
- **Rate limiting**: 10 signatures/hour per IP

### Blockchain
- **Foundry**: Smart contract development
- **Solidity 0.8.20**: Contract language
- **OpenZeppelin**: UUPS upgradeable contracts
- **Base Sepolia**: Testnet deployment
- **Bob Testnet**: Testnet deployment

---

## Next Steps

- **Deploy to testnet**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Understand contracts**: See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
- **Contribute**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Questions? Check existing docs or open an issue on GitHub.** 🚀
