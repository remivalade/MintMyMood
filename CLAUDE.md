# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MintMyMood** (also referred to as "On-Chain Journal") is a minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs. The core concept is ephemeral vs permanent: thoughts auto-delete after 7 days by default, but users can mint them as NFTs to preserve them forever on-chain.

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript
- **UI Components:** Radix UI primitives + custom components
- **Styling:** Tailwind CSS (skeuomorphic minimalism design philosophy)
- **State Management:** Zustand
- **Web3:** wagmi v2 + viem + RainbowKit
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Blockchain:** Foundry + Solidity (UUPS Upgradeable + LayerZero ONFT721)
- **Notifications:** Sonner (toast notifications)

## Development Commands

### Running the Application
```bash
npm i                 # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
```

The dev server runs on port 3000 and opens automatically in the browser.

### Supabase Testing
```bash
npx tsx backend/supabase/test-connection.ts  # Test database connection
```

### Smart Contracts (Once Foundry is set up - Days 8-9)
```bash
forge build           # Compile contracts
forge test            # Run tests
forge test -vvv       # Run tests with verbose output
anvil                 # Start local blockchain
```

## Architecture

### Application State & Flow

The app is organized as a single-page application with view-based navigation:

**Views:** `writing` | `gallery` | `mood` | `preview` | `detail`

**Core Flow:**
1. **Writing Interface** → User writes a thought (auto-saves to Supabase after 3 seconds)
2. **Mood Selection** → User selects an emoji mood
3. **Mint Preview** → User previews the NFT and chooses to mint or discard
4. **Gallery** → Shows all thoughts (both minted and ephemeral) fetched from Supabase
5. **Detail View** → Shows individual thought details

**State Management:**
- **Global State:** Zustand store (`src/store/useThoughtStore.ts`) manages:
  - Thoughts array
  - CRUD operations (save, fetch, delete)
  - Minting operations (currently mock, will integrate with smart contracts)
  - Bridge operations (prepared for future cross-chain transfers)
- **Local State:** `App.tsx` manages view navigation and current thought flow
- **Web3 State:** wagmi hooks manage wallet connection state

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

**Database Schema** (Supabase - PostgreSQL):
- `users` table: Stores wallet addresses and preferences
- `thoughts` table: Stores all thoughts with minting status
- `bridge_transactions` table: Tracks cross-chain transfers (future)
- Row Level Security (RLS) policies enforce wallet-based access control
- Automatic cleanup function deletes expired ephemeral thoughts

### Component Organization

```
src/
├── App.tsx                      # Main app component with routing logic
├── main.tsx                     # Entry point
├── components/
│   ├── WritingInterface.tsx     # Page 1: Writing editor
│   ├── MoodSelection.tsx        # Page 2: Mood selection
│   ├── MintPreview.tsx          # Page 3: NFT preview before minting
│   ├── Gallery.tsx              # Page 6: Thought gallery
│   ├── ThoughtDetail.tsx        # Individual thought view
│   ├── ThoughtCard.tsx          # Card component for gallery
│   ├── WalletModal.tsx          # Wallet connection modal
│   ├── MintingModal.tsx         # Minting status modal
│   ├── IntroModal.tsx           # First-time user intro
│   ├── AboutModal.tsx           # About/help modal
│   ├── Header.tsx               # Shared header component
│   ├── Welcome.tsx              # Welcome screen
│   └── ui/                      # Radix UI-based components
└── styles/
    └── globals.css              # Global styles + Tailwind
```

### Smart Contract

The Solidity contract (`OnChainJournal.sol`) implements:
- ERC721 NFT standard
- On-chain SVG generation (no IPFS dependencies)
- Chain-specific color gradients (hardcoded per deployment)
- Input validation (400 byte text limit, 64 byte mood limit)
- XML escaping for security

**Deployment Strategy:** One contract instance per chain, each with chain-specific gradient colors hardcoded.

**Chain Colors:**
- Bob: Orange gradient `#FF6B35` → `#F7931E`
- Ink: Purple `#5D3FD3`
- Base: Blue `#0052FF`
- HyperEVM: Green `#00F0A0`

## Design Philosophy

**Skeuomorphic Minimalism** - Clean digital interface with subtle textures and shadows that evoke physical journaling.

### Color Palette
- **Paper Cream:** `#F9F7F1` (main background)
- **Light Ivory:** `#FFFEF0` (secondary panels)
- **Soft Black:** `#2D2D2D` (primary text)
- **Medium Gray:** `#5A5A5A` (secondary text)
- **Leather Brown:** `#8B7355` (accent)

### Typography
- **Content Font:** `Lora` (serif) - for user-generated journal text
- **UI Font:** `Inter` or system sans-serif - for buttons, labels, navigation

### Layout Principles
- 8pt grid system for all spacing
- Max content width: 680px (centered)
- Generous whitespace for calm, focused experience
- Subtle paper texture overlay at 3-5% opacity

## Database Implementation

**Supabase PostgreSQL** with omnichain schema:

**Tables:**
- `users`: Stores wallet addresses, preferences, created_at
- `thoughts`: Stores all thoughts with minting and chain tracking
- `bridge_transactions`: Tracks LayerZero cross-chain transfers (future)

**Key Features:**
- Row Level Security (RLS) policies for wallet-based access
- Temporary dev policies for testing (allows anonymous access)
- Automatic cleanup of expired thoughts via database function
- Indexes on wallet_address, is_minted, expires_at for performance

**Connection:**
- Supabase client initialized in `src/lib/supabaseClient.ts`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Zustand store handles all database operations

**TODO:**
- Implement SIWE (Sign-In with Ethereum) authentication
- Remove temporary dev RLS policies before production
- Change draft expiration from 10 minutes (testing) to 7 days (production)

## Development Notes

### Vite Configuration
- Uses `@vitejs/plugin-react-swc` for fast refresh
- Extensive package aliases configured for versioned Radix UI imports
- Path alias `@` points to `./src`
- Build output: `build/` directory
- Target: `esnext`

### Current Implementation Status

**Sprint 1 - Days 1-7**: ✅ Complete

The codebase currently has:
- ✅ Complete UI flow (writing → mood → preview → gallery)
- ✅ Real wallet connection (RainbowKit with Rabby prioritized)
- ✅ Auto-save functionality with 3-second debounce
- ✅ Toast notifications for all save operations
- ✅ Draft ID tracking to prevent duplicate saves
- ✅ Gallery fetches real data from Supabase
- ✅ Filter system (All/Minted/Ephemeral)
- ✅ Chain badges on minted thoughts
- ✅ Wallet connection gating
- ✅ Loading states throughout
- ✅ Zustand state management
- ✅ Supabase database integration
- ✅ Row Level Security with temporary dev policies
- ⏳ Smart contract implementation (Days 8-14)
- ⏳ Real minting to blockchain (Sprint 2)
- ⏳ Cross-chain bridging (Sprint 3)

### Working with Smart Contracts

**Current Status**: Smart contracts to be implemented in Days 8-14

**Planned Architecture:**
- **Foundry** for development, testing, and deployment
- **UUPS Upgradeable Pattern** for contract upgradeability
- **LayerZero V2 ONFT721** for cross-chain NFT bridging
- **On-chain SVG generation** (no IPFS dependencies)
- **Chain-specific gradients** configured per deployment

**Key Contract Functions** (to be implemented):
- `mint(text, mood)`: Mint a new journal entry NFT
- `generateSVG(tokenId)`: Generate on-chain SVG with mood-based colors
- `send(tokenId, dstEid, ...)`: Bridge NFT to another chain via LayerZero
- `_escapeString(text)`: Escape user input for XML safety

**Deployment Plan:**
- Test locally with Anvil
- Deploy to Base Sepolia & Bob Sepolia (Sprint 2)
- Set up LayerZero trusted peers between chains
- Deploy to Base & Bob mainnet (Sprint 4)

**Security Considerations:**
- Text limit: 400 bytes (enforced in mint function)
- Mood limit: 64 bytes
- XML escaping required for all user input
- UUPS upgrade pattern requires careful ownership management
- LayerZero peer configuration must be verified before mainnet

### Known Issues & Technical Debt

**High Priority:**
1. **Authentication**: Using temporary dev RLS policies
   - Need to implement SIWE (Sign-In with Ethereum)
   - Location: `backend/supabase/migrations/004_temporary_dev_policies.sql`
   - Must be removed before production

2. **Draft Expiration**: Currently 10 minutes for testing
   - Need to change to 7 days for production
   - Location: `src/components/WritingInterface.tsx:50`

**Medium Priority:**
3. **Chain Filter UI**: Infrastructure exists but UI not exposed
   - State: `Gallery.tsx:21` (selectedChain)
   - TODO: Add chain filter dropdown

4. **Bob RPC CORS**: Warning about CORS from Bob testnet RPC
   - Non-critical, doesn't affect functionality
   - May need alternative RPC endpoint

**Low Priority:**
5. **Mock Minting Modal**: Still using simulated minting
   - Will be replaced in Sprint 2 with real contract calls

### Future Features (Planned)
- Real smart contract minting (Sprint 2)
- Cross-chain bridging via LayerZero (Sprint 3)
- Timer countdown display for ephemeral thoughts
- Transaction status tracking with block confirmations
- Real NFT preview matching on-chain SVG
- Gasless minting sponsorship (Gelato/Biconomy) - post-launch

## Reference Documentation

Key planning documents in the repository:
- `docs/MinMyMood-prd.md` - Detailed product requirements with user flows
- `docs/OMNICHAIN_V1_SPRINT_PLAN.md` - Full 10-week development plan
- `docs/SPRINT1_DAYS1-4_COMPLETE.md` - Days 1-4 completion summary
- `docs/SPRINT1_DAYS5-7_PROGRESS.md` - Days 5-7 completion summary
- `docs/todo.md` - Current development status and task tracking
- `docs/GETTING_STARTED.md` - Setup and development guide
- `docs/CTO_ASSESSMENT.md` - Technical architecture analysis
- `README.md` - Project overview and quick start
- `CLAUDE.md` - This file (AI assistant guidance)

**Next Steps:** Days 8-14 smart contract development (see `docs/todo.md`)
