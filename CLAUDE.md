# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**MintMyMood** (also referred to as "On-Chain Journal") is a minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs. The core concept is ephemeral vs permanent: thoughts auto-delete after 7 days by default, but users can mint them as NFTs to preserve them forever on-chain.

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript
- **UI Components:** Radix UI primitives + custom components
- **Styling:** Tailwind CSS (skeuomorphic minimalism design philosophy)
- **State Management:** Zustand
- **Web3:** wagmi v2 + viem + RainbowKit
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Blockchain:** Foundry + Solidity (UUPS Upgradeable ERC721)
- **Backend:** Express.js (ENS signature service)
- **Notifications:** Sonner (toast notifications)

---

## Quick Reference

### Running the Application

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production

# Backend API (ENS signatures)
cd backend/api && npm start  # Port 3001

# Smart Contracts
cd contracts
forge build          # Compile
forge test           # Run tests (28/28 passing ✅)
forge test -vvv      # Verbose output
```

### Key Directories

```
src/components/          # React UI components
src/hooks/              # useMintJournalEntry, useEnsName
src/store/              # Zustand global state
src/contracts/          # Contract ABIs & addresses
contracts/src/          # OnChainJournal.sol
backend/api/            # Express.js signature service
docs/                   # All documentation
```

---

## Architecture

### Application Flow

```
Writing Interface → Auto-save to Supabase (3s debounce)
       ↓
Mood Selection → User picks emoji
       ↓
Mint Preview → Shows SVG preview, chain selector
       ↓
Minting → Gets ENS signature → Calls smart contract
       ↓
Gallery → Displays all thoughts (minted + ephemeral)
```

### State Management

- **Global State** (Zustand): `src/store/useThoughtStore.ts`
  - Thoughts array
  - CRUD operations (save, fetch, delete)
  - Minting operations

- **Local State**: Component-level React hooks
  - View navigation (`App.tsx`)
  - Form inputs
  - Modal visibility

- **Web3 State**: wagmi hooks
  - Wallet connection
  - Contract reads/writes
  - Transaction status

### Key Data Structure

```typescript
interface Thought {
  id: string;
  wallet_address: string;
  text: string;
  mood: string;
  created_at: string;
  is_minted: boolean;
  expires_at: string | null;  // Only for unminted thoughts
  origin_chain_id: number | null;
  current_chain_id: number | null;
  token_id: string | null;
  mint_tx_hash: string | null;
  nft_metadata: any | null;
}
```

### Database Schema (Supabase)

**Tables:**
- `users` - Wallet addresses and preferences
- `thoughts` - All thoughts with minting status
- `bridge_transactions` - Tracks cross-chain transfers (future V2)

**Features:**
- Row Level Security (RLS) policies for wallet-based access
- Production JWT-based authentication (SIWE / EIP-4361)
- Automatic cleanup of expired thoughts via database function
- Indexes on wallet_address, is_minted, expires_at
- `auth_nonces` table for nonce-based replay protection

---

## Smart Contract (V2.3.0)

**Location:** `contracts/src/OnChainJournal.sol`

**Pattern:** UUPS Upgradeable ERC721

**Key Features:**
- On-chain SVG generation with animations (no IPFS)
- ENS signature verification (prevents identity fraud)
- Chain-specific gradients (Base: blue, Bob: orange)
- Input validation (400 byte text, 64 byte mood)
- XML escaping for security
- Nonce-based replay protection

**Key Functions:**
```solidity
// Minting (requires backend signature)
function mintEntry(
    string memory _text,
    string memory _mood,
    string memory _ensName,
    bytes memory _signature,
    uint256 _nonce,
    uint256 _expiry
) public returns (uint256)

// Metadata
function tokenURI(uint256 tokenId) public view returns (string memory)
function generateSVG(JournalEntry memory entry) public view returns (string memory)

// Admin (owner only)
function updateColors(string memory _color1, string memory _color2) external
function updateChainName(string memory _newChainName) external
function upgradeToAndCall(address newImplementation, bytes memory data) external
```

**Deployed Contracts (V2.3.0):**
- Proxy (both chains): `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8`
- Implementation Base Sepolia: `0x95a7BbfFBffb2D1e4b73B8F8A9435CE48dE5b47A`
- Implementation Bob Testnet: `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012`
- Trusted Signer: `0xEd171c759450B7358e9238567b1e23b4d82f3a64`

---

## ENS Verification System

**Problem:** Without verification, users could mint with any ENS name (identity fraud)

**Solution:** Backend signature verification

**Flow:**
1. Frontend requests signature from `POST /api/ens-signature`
2. Backend verifies ENS ownership and signs mint request
3. Smart contract verifies ECDSA signature
4. NFT displays `✓ ensname.eth` for verified ENS, or `0x1234...5678` for truncated address

**Backend API:** `backend/api/server.js` (Express.js on port 3001)
- Rate limiting: 10 signatures/hour per IP
- 5-minute signature expiry
- Nonce-based replay protection

---

## Design Philosophy

**Skeuomorphic Minimalism** - Clean digital interface with subtle textures that evoke physical journaling.

### Color Palette
- **Paper Cream:** `#F9F7F1` (main background)
- **Light Ivory:** `#FFFEF0` (secondary panels)
- **Soft Black:** `#2D2D2D` (primary text)
- **Medium Gray:** `#5A5A5A` (secondary text)
- **Leather Brown:** `#8B7355` (accent)

### Typography
- **Lora** (serif) - User-generated journal text
- **Inter** (sans-serif) - UI elements

### Layout
- 8pt grid system for all spacing
- Max content width: 680px (centered)
- Generous whitespace for calm experience
- Subtle paper texture overlay at 3-5% opacity

---

## Current Status

**Sprint 3.2 Complete** ✅ - Production Ready for Beta Testing

### What Works

*Frontend:*
- ✅ Complete UI flow (writing → mood → preview → gallery)
- ✅ Real wallet connection (RainbowKit with Rabby prioritized)
- ✅ SIWE authentication (Sign-In with Ethereum / EIP-4361)
- ✅ JWT-based session management (24-hour expiry)
- ✅ Auto-save with 3-second debounce + toast notifications
- ✅ Draft ID tracking (prevents duplicate saves)
- ✅ Gallery with real Supabase data
- ✅ Filter system (All/Minted/Ephemeral)
- ✅ Chain badges on minted thoughts
- ✅ ENS name display and verification
- ✅ React Router navigation
- ✅ Loading states throughout

*Smart Contracts:*
- ✅ UUPS Upgradeable ERC721
- ✅ On-chain SVG with animations
- ✅ ENS signature verification
- ✅ Chain-specific gradients
- ✅ 28/28 tests passing
- ✅ Deployed to Base Sepolia & Bob Testnet

*Backend:*
- ✅ Express.js API (ENS + SIWE auth)
- ✅ SIWE authentication endpoints (nonce generation, signature verification)
- ✅ JWT issuance with custom claims
- ✅ ECDSA signing with rate limiting
- ✅ Supabase with production RLS policies

*Security:*
- ✅ Production Row Level Security (RLS) enforcing per-wallet data isolation
- ✅ No anonymous database access
- ✅ JWT-based authentication required for all operations
- ✅ Nonce-based replay protection (5-minute expiry)

### Known Issues & TODOs

**High Priority:**
1. **Draft Expiration**: Currently 10 minutes for testing
   - TODO: Change to 7 days for production
   - Location: `src/components/WritingInterface.tsx:50`

**Medium Priority:**
2. **Chain Filter UI**: Infrastructure exists but UI not exposed
   - State: `Gallery.tsx:21` (selectedChain)
   - TODO: Add chain filter dropdown

---

## Common Development Tasks

### Add New React Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return <div className="p-4"><h1>{title}</h1></div>;
}
```

### Update Contract Addresses

After deployment, update `src/contracts/config.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  84532: '0xNewAddress',  // Base Sepolia
  808813: '0xNewAddress', // Bob Testnet
};
```

### Regenerate Contract ABI

```bash
cd contracts
forge build
cat out/OnChainJournal.sol/OnChainJournal.json | jq .abi > ../src/contracts/OnChainJournal.abi.json
```

### Test Smart Contract Changes

```bash
cd contracts
forge test -vvv                    # All tests with verbose output
forge test --match-test testMint   # Specific test
forge test --gas-report            # Gas usage
```

---

## Environment Variables

### Frontend (`.env`)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
VITE_BACKEND_URL=http://localhost:3001
VITE_ENVIRONMENT=development
```

### Backend API (`backend/api/.env`)
```bash
SIGNER_PRIVATE_KEY=0x...
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<generate-with-openssl-rand-base64-32>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Smart Contracts (`contracts/.env`)
```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BOB_TESTNET_RPC_URL=https://testnet.rpc.gobob.xyz
DEPLOYER_PRIVATE_KEY=0x...
BASESCAN_API_KEY=your-key
```

---

## Documentation Structure

| File | Purpose |
|------|---------|
| [README.md](README.md) | Project overview |
| [QUICK_START.md](docs/QUICK_START.md) | 5-minute setup guide |
| [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Architecture & workflow |
| [CONTRACT_GUIDE.md](docs/CONTRACT_GUIDE.md) | Smart contract details |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment instructions |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribution guidelines |
| [todo.md](docs/todo.md) | Current tasks & progress |
| [svg/README.md](docs/svg/README.md) | SVG design specifications |

---

## Next Steps

**Sprint 4** - Beta Testing (Current):
- Deploy to public testnet URL
- Recruit 5-10 beta testers
- Collect feedback and optimize UX
- Mobile and cross-browser testing

**Future (V2 - Post-Launch):**
- LayerZero V2 ONFT721 integration
- Cross-chain bridging (Base ↔ Bob)
- Deploy as UUPS upgrade (no redeployment needed)

---

**For detailed information, refer to the documentation files linked above.** 🚀
