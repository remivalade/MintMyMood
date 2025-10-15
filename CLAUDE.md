# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MintMyMood** (also referred to as "On-Chain Journal") is a minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs. The core concept is ephemeral vs permanent: thoughts auto-delete after 7 days by default, but users can mint them as NFTs to preserve them forever on-chain.

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript
- **UI Components:** Radix UI primitives + custom components
- **Styling:** Tailwind CSS (skeuomorphic minimalism design philosophy)
- **Blockchain:** Solidity smart contract (ERC721) for on-chain SVG NFTs
- **Planned Backend:** PostgreSQL database (Supabase or self-hosted)

## Development Commands

### Running the Application
```bash
npm i                 # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
```

The dev server runs on port 3000 and opens automatically in the browser.

## Architecture

### Application State & Flow

The app is organized as a single-page application with view-based navigation:

**Views:** `writing` | `gallery` | `mood` | `preview` | `detail`

**Core Flow:**
1. **Writing Interface** → User writes a thought
2. **Mood Selection** → User selects an emoji mood (or none)
3. **Mint Preview** → User previews the NFT and chooses to mint or discard
4. **Gallery** → Shows all thoughts (both minted and ephemeral)
5. **Detail View** → Shows individual thought details

State management is handled locally in `App.tsx` using React hooks (no external state library currently, though Zustand is planned for the future).

### Key Data Structure

```typescript
interface Thought {
  id: string;
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  expiresAt?: Date;  // Only for unminted thoughts
}
```

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

## Database Schema (Future Implementation)

The PRD specifies a PostgreSQL schema with:
- `users` table (wallet-based authentication)
- `thoughts` table with row-level security
- Automatic cleanup cron job for expired thoughts
- Fields track minting status, chain, token_id, tx_hash

Currently mocked in `App.tsx` with local state.

## Development Notes

### Vite Configuration
- Uses `@vitejs/plugin-react-swc` for fast refresh
- Extensive package aliases configured for versioned Radix UI imports
- Path alias `@` points to `./src`
- Build output: `build/` directory
- Target: `esnext`

### Current Implementation Status
The codebase is currently a **frontend prototype** with:
- ✅ Complete UI flow (writing → mood → preview → gallery)
- ✅ Mock wallet connection
- ✅ Simulated minting flow
- ✅ Sample thoughts with ephemeral/minted states
- ⏳ Web3 integration (wagmi/viem) not yet implemented
- ⏳ Backend database integration not yet implemented
- ⏳ Smart contract deployment not yet done

### Working with the Smart Contract

When modifying `OnChainJournal.sol`:
- Remember to update `color1` and `color2` in `generateSVG()` for each chain deployment
- Text limit is 400 bytes (enforced in `mintEntry`)
- Always escape user input (use `_escapeString` helper)
- Contract uses OpenZeppelin's `Counters.sol` for token IDs

### Future Features (from PRD)
- Gasless minting sponsorship (Gelato/Biconomy)
- Multi-chain support with chain-specific contract addresses
- Timer countdown display for ephemeral thoughts
- Wallet-based authentication
- Transaction status tracking and error handling
- Real NFT preview matching final on-chain SVG

## Reference Documentation

Key planning documents in the repository:
- `MinMyMood-prd.md` - Detailed product requirements with user flows
- `README.md` - Basic setup instructions
- `todo.md` - Development task tracking
- `OnChainJournal.sol` - Production-ready smart contract
