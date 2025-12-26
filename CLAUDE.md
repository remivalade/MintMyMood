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
- **Database:** Supabase (PostgreSQL with native Web3 authentication & Row Level Security)
- **Blockchain:** Foundry + Solidity (UUPS Upgradeable ERC721)
- **Notifications:** Sonner (toast notifications)

---

## Quick Reference

### Running the Application

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production

# Smart Contracts
cd contracts
forge build          # Compile
forge test           # Run tests (18/18 passing ✅)
forge test -vvv      # Verbose output
```

### Key Directories

```
src/components/          # React UI components
src/hooks/              # useMintJournalEntry, useEnsName, useAuth
src/store/              # Zustand global state
src/contracts/          # Contract ABIs & addresses
contracts/src/          # OnChainJournal.sol
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
Minting → Calls smart contract
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
- Supabase native Web3 authentication (signInWithWeb3)
- Automatic cleanup of expired thoughts via database function
- Automatic profile creation via database triggers
- Indexes on wallet_address, is_minted, expires_at

---

## Smart Contract (V2.4.0)

**Location:** `contracts/src/OnChainJournal.sol`

**Pattern:** UUPS Upgradeable ERC721

**Key Features:**
- On-chain SVG generation with animations (no IPFS)
- Chain-specific gradients (Base: blue, Bob: orange, Ink: purple)
- Input validation (400 byte text, 64 byte mood)
- XML escaping for security
- Simplified minting (2 parameters vs 6 in V2.3.0)
- Gas optimized (~170k vs ~240k, ~30% reduction)

**Key Functions:**
```solidity
// Minting (simplified)
function mintEntry(
    string memory _text,
    string memory _mood
) public returns (uint256)

// Metadata
function tokenURI(uint256 tokenId) public view returns (string memory)
function generateSVG(JournalEntry memory entry) public view returns (string memory)

// Admin (owner only)
function updateColors(string memory _color1, string memory _color2) external
function updateChainName(string memory _newChainName) external
function upgradeToAndCall(address newImplementation, bytes memory data) external
```

**Deployed Contracts (V2.4.0):**
- Proxy (all chains): `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8`
- Implementation Base Sepolia: `0x64C9A8b7c432A960898cdB3bB45204287F59B814`
- Implementation Bob Testnet: `0xB4e9f62cc1899DB3266099F65CeEcE8Cc267f3D2`
- Implementation Ink Sepolia: (same proxy address)

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

**Sprint 3.6 Complete** ✅ - Production Ready for Beta Testing

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
- ✅ ENS name display (frontend resolution)
- ✅ React Router navigation
- ✅ Loading states throughout

*Smart Contracts (V2.4.0):*
- ✅ UUPS Upgradeable ERC721
- ✅ On-chain SVG with animations
- ✅ Simplified minting (2 parameters: text, mood)
- ✅ Chain-specific gradients (Base: blue, Bob: orange, Ink: purple)
- ✅ Gas optimized (~30% reduction vs V2.3.0)
- ✅ 18/18 tests passing
- ✅ Deployed to Base Sepolia, Bob Testnet & Ink Sepolia

*Backend:*
- ✅ Supabase native Web3 authentication (SIWE)
- ✅ JWT-based session management (24-hour expiry)
- ✅ Production RLS policies enforcing per-wallet data isolation
- ✅ Automatic profile creation via database triggers

*Security:*
- ✅ Production Row Level Security (RLS) enforcing per-wallet data isolation
- ✅ No anonymous database access
- ✅ JWT-based authentication required for all operations
- ✅ Supabase native Web3 authentication (no custom backend needed)

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
  84532: '0xNewAddress',   // Base Sepolia
  808813: '0xNewAddress',  // Bob Testnet
  763373: '0xNewAddress',  // Ink Sepolia
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
VITE_SUPABASE_ANON_KEY=sb_publishable_your-key-here
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
VITE_ENVIRONMENT=development
```

### Smart Contracts (`contracts/.env`)
```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BOB_TESTNET_RPC_URL=https://testnet.rpc.gobob.xyz
INK_SEPOLIA_RPC_URL=https://rpc-gel-sepolia.inkonchain.com
DEPLOYER_PRIVATE_KEY=0x...
BASESCAN_API_KEY=your-key

# For backend scripts (admin operations only)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your-key-here
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
- Cross-chain bridging (Base ↔ Bob ↔ Ink)
- Deploy as UUPS upgrade (no redeployment needed)

---

**For detailed information, refer to the documentation files linked above.** 🚀
