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
- **Blockchain:** Foundry + Solidity (UUPS Upgradeable ERC721, LayerZero for V2)
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

### Smart Contracts
```bash
cd contracts          # Navigate to contracts directory
forge build           # Compile contracts
forge test            # Run tests (18/18 passing ✅)
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
├── hooks/
│   └── useEnsName.ts            # ENS resolution hook
└── styles/
    └── globals.css              # Global styles + Tailwind
```

### Smart Contract

The Solidity contract (`contracts/src/OnChainJournal.sol`) implements:
- **UUPS Upgradeable ERC721** NFT standard
- **On-chain SVG generation** with animations (no IPFS dependencies)
- **ENS Support** - Optional ENS name display in SVG
- **Advanced SVG Features:**
  - Grain texture filter (feTurbulence)
  - CSS keyframe animations (typewriter effect for block number)
  - Drop shadows and blend modes
  - ForeignObject for text wrapping
- **Chain-specific color gradients** (hardcoded per deployment)
- **Input validation** (400 byte text limit, 64 byte mood limit)
- **XML escaping** for security
- **18 comprehensive tests** - All passing ✅

**Deployment Strategy:** One contract instance per chain, each with chain-specific gradient colors hardcoded.

**V1 Chain Support (Current):**
- Base: Blue gradient `#0052FF` / `#3c8aff`
- Bob: Orange gradient `#FF6B35` / `#F7931E`

**V2 Plans (Future):**
- Cross-chain bridging via LayerZero ONFT721
- Deployed as UUPS upgrade (no redeployment needed)

**SVG Design Reference:**
- See `docs/svg/README.md` for complete SVG design specifications
- Reference SVG files for each chain: `docs/svg/BASE.svg`, `docs/svg/BOB.svg`
- Design includes: gradient colors, typography specs, element positioning, animations

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

**Sprint 1**: ✅ Complete - Foundation & Infrastructure
**Sprint 2**: ✅ Complete - Smart Contract Development
**Sprint 3**: ✅ Complete - Testnet Deployment & Integration
**Sprint 3.1**: ✅ Complete - ENS Verification Security Fix

**What's Built:**

*Frontend (Sprint 1):*
- ✅ Complete UI flow (writing → mood → preview → gallery)
- ✅ Real wallet connection (RainbowKit with Rabby prioritized)
- ✅ Auto-save functionality with 3-second debounce
- ✅ Toast notifications for all save operations
- ✅ Draft ID tracking to prevent duplicate saves
- ✅ Gallery fetches real data from Supabase
- ✅ Filter system (All/Minted/Ephemeral)
- ✅ Chain badges on minted thoughts
- ✅ ENS name display in header
- ✅ ENS resolution before minting
- ✅ Wallet connection gating
- ✅ Loading states throughout
- ✅ Zustand state management
- ✅ Supabase database integration
- ✅ Row Level Security with temporary dev policies

*Smart Contracts (Sprint 2):*
- ✅ UUPS Upgradeable ERC721 implementation
- ✅ On-chain SVG generation with animations
- ✅ ENS support (optional parameter)
- ✅ Chain-specific gradients (Base & Bob)
- ✅ Advanced SVG features (grain texture, CSS animations)
- ✅ Input validation and XML escaping
- ✅ 18 comprehensive tests passing
- ✅ Deployment scripts ready
- ✅ Complete documentation (CONTRACT_GUIDE.md)

*Testnet Deployment (Sprint 3):*
- ✅ Deployed to Base Sepolia testnet (verified on Basescan)
- ✅ Deployed to Bob Testnet
- ✅ Frontend integration with deployed contracts
- ✅ Real minting hook with wagmi (`useMintJournalEntry`)
- ✅ PreviewChain Context for wallet-independent chain switching
- ✅ Local SVG generation utility matching on-chain output
- ✅ Gallery displays minted NFTs as actual SVGs
- ✅ React Router for proper URL navigation
- ✅ ENS resolution with Ethereum Mainnet
- ✅ Custom wallet connection modal
- ✅ Transaction tracking and explorer links
- ✅ 5 rounds of user testing with all issues fixed

*ENS Verification Security (Sprint 3.1):*
- ✅ Backend Express.js signature service (`/api/ens-signature`)
- ✅ ECDSA signature verification in smart contract
- ✅ Nonce-based replay protection
- ✅ Rate limiting (10 signatures/hour per IP)
- ✅ Unicode checkmark for verified ENS (✓ ensname.eth)
- ✅ ENS name truncation for long names (>23 chars)
- ✅ Truncated address display (0x1234...5678)
- ✅ Fixed Bob chain name display
- ✅ UUPS upgrades to V2.3.0 on both chains
- ✅ 28 tests passing (18 original + 9 signature tests + 1 truncation test)

**Contract Addresses (V2.3.0 - Current):**
- **Proxy (both chains)**: `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8`
- **Implementation Base Sepolia**: `0x95a7BbfFBffb2D1e4b73B8F8A9435CE48dE5b47A` (verified)
- **Implementation Bob Testnet**: `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012`
- **Trusted Signer**: `0xEd171c759450B7358e9238567b1e23b4d82f3a64`
- **Backend API**: `http://localhost:3001` (dev)

**Version History:**
- V1.0.0: Initial deployment (deprecated)
- V2.0.0: Added ENS signature verification with ECDSA
- V2.1.0: Fixed Unicode checkmark display
- V2.2.0: Added updateChainName() function, fixed Bob chain name
- V2.3.0: Added ENS truncation for long names (current)

**Next Steps (Sprint 4):**
- 🎯 Deploy to public testnet URL
- 🎯 Beta testing with 5-10 external users
- 🎯 Collect feedback and optimize UX
- 🎯 Mobile and cross-browser testing

**Future (V2 - Post-Launch):**
- 📅 LayerZero V2 ONFT721 integration
- 📅 Cross-chain bridging (Base ↔ Bob)
- 📅 Deploy as UUPS upgrade

### Working with Smart Contracts

**Location:** `contracts/src/OnChainJournal.sol`

**Key Contract Functions:**
```solidity
// Minting
function mintEntry(
    string memory _text,
    string memory _mood,
    string memory _ensName  // Optional ENS (empty string if none)
) public

// Metadata
function tokenURI(uint256 tokenId) public view returns (string memory)
function generateSVG(JournalEntry memory entry) public view returns (string memory)

// Admin (owner only)
function updateColors(string memory _color1, string memory _color2) external
function upgradeToAndCall(address newImplementation, bytes memory data) external
```

**Testing:**
```bash
cd contracts
forge test           # Run all 18 tests
forge test -vvv      # Verbose output
forge test --gas-report  # Gas usage report
```

**Deployment Plan:**
1. Deploy to Base Sepolia testnet (Sprint 3)
2. Deploy to Bob Testnet (Sprint 3)
3. Test minting on both chains
4. Beta testing (Sprint 4)
5. Deploy to mainnet (Sprint 6)

**Security Considerations:**
- Text limit: 400 bytes (enforced in mintEntry)
- Mood limit: 64 bytes
- XML escaping for all user input
- UUPS upgrade pattern (owner-controlled)
- ENS passed from frontend (not resolved on-chain)

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
5. **Bob Testnet Verification**: Contract deployed but manual verification needed
   - Explorer API has TLS issues
   - Contract is functional and deployed

### Future Features (Planned)
- ✅ Real smart contract minting - COMPLETE (Sprint 3)
- ✅ React Router navigation - COMPLETE (Sprint 3)
- ✅ Gallery SVG display - COMPLETE (Sprint 3)
- Cross-chain bridging via LayerZero (V2 - post-launch)
- Timer countdown display for ephemeral thoughts
- Transaction status tracking with block confirmations
- Gasless minting sponsorship (Gelato/Biconomy) - post-launch
- Mobile optimization and PWA support

## Reference Documentation

Key planning documents in the repository:

**Primary Documentation:**
- `docs/MintMyMood-prd.md` - Detailed product requirements with user flows
- `docs/sprint_plan.md` - Full development plan with V1/V2 scope
- `docs/todo.md` - Current development status and task tracking
- `CLAUDE.md` - This file (AI assistant guidance)
- `README.md` - Project overview and quick start

**Smart Contract Documentation:**
- `docs/CONTRACT_GUIDE.md` - Complete contract deployment guide
- `docs/DEPLOYMENT_CHECKLIST_V1.md` - Step-by-step deployment checklist
- `docs/V1_READY.md` - Deployment readiness summary
- `docs/svg/README.md` - SVG design reference and specifications

**Technical Documentation:**
- `docs/GETTING_STARTED.md` - Setup and development guide
- `docs/CTO_ASSESSMENT.md` - Technical architecture analysis

**Sprint Summaries:**
- `docs/SPRINT1_DAYS1-4_COMPLETE.md` - Sprint 1 Part 1 completion summary
- `docs/SPRINT1_DAYS5-7_PROGRESS.md` - Sprint 1 Part 2 completion summary
- `docs/SPRINT3_DEPLOYMENT_COMPLETE.md` - Sprint 3 complete documentation (5 testing sessions)
- `docs/SPRINT3_PR_SUMMARY.md` - Sprint 3 GitHub PR summary

**Next Steps:** Sprint 4 - Beta testing (see `docs/todo.md`)
