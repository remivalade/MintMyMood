# MintMyMood (On-Chain Journal)

A minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs.

## 🎯 Core Concept

**Ephemeral vs Permanent**: Thoughts auto-delete after 7 days by default, but users can mint them as NFTs to preserve them forever on-chain.

**Target**: Crypto-native users who already have wallets.

## 📁 Project Structure

```
MintMyMood/
├── src/                      # Frontend React application
│   ├── components/           # React components
│   │   ├── ui/              # Radix UI primitives
│   │   ├── WritingInterface.tsx
│   │   ├── MoodSelection.tsx
│   │   ├── MintPreview.tsx
│   │   ├── Gallery.tsx
│   │   └── ...
│   ├── styles/              # Global styles
│   └── App.tsx              # Main application
├── backend/                  # Backend API (to be implemented)
├── contracts/               # Solidity smart contracts
│   └── OnChainJournal.sol
├── scripts/                 # Deployment scripts
├── docs/                    # Documentation
│   ├── MinMyMood-prd.md    # Product Requirements Document
│   ├── todo.md             # Development tasks
│   └── archive/            # Archived documentation
└── CLAUDE.md               # AI assistant guidance

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (for local development)
- A crypto wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The development server will run on http://localhost:3000

## 🏗️ Current Status

**Sprint 3.1**: ✅ Complete - ENS Verification Security Fix

**Frontend**: ✅ Production Ready
- Writing interface with auto-save (3-second debounce)
- Mood selection with emoji picker
- NFT mint preview with real on-chain SVG rendering
- Gallery view with filters (All/Minted/Ephemeral)
- React Router for proper URL navigation
- Modal flows (wallet, minting, intro)
- Chain-specific badges and gradients
- Toast notifications for all operations
- ENS name display and verification
- Local SVG generation matching on-chain output

**Backend**: ✅ ENS Signature Service Live
- Express.js API on port 3001
- `/api/ens-signature` endpoint for ECDSA signatures
- Rate limiting (10 signatures/hour per IP)
- Trusted signer wallet: `0xEd171c759450B7358e9238567b1e23b4d82f3a64`
- Supabase PostgreSQL with omnichain schema
- Row Level Security policies (temporary dev policies for testing)
- **TODO**: Implement SIWE (Sign-In with Ethereum) authentication

**Smart Contracts**: ✅ V2.3.0 Deployed to Testnets
- UUPS Upgradeable ERC721 implementation
- On-chain SVG generation with animations
- ENS signature verification with ECDSA
- Chain-specific gradients (Base: blue, Bob: orange)
- Advanced SVG features (grain texture, CSS animations)
- Input validation and XML escaping
- 28/28 tests passing
- **Deployed Contracts (V2.3.0)**:
  - Proxy (both chains): `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8`
  - Implementation Base Sepolia: `0x95a7BbfFBffb2D1e4b73B8F8A9435CE48dE5b47A` (verified)
  - Implementation Bob Testnet: `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012`

**Web3 Integration**: ✅ Complete
- wagmi v2 + viem integrated
- RainbowKit with custom styling (Rabby wallet prioritized)
- Real minting to deployed contracts
- ENS resolution with Ethereum Mainnet
- Transaction tracking with explorer links
- PreviewChain Context for wallet-independent chain switching
- 5 rounds of user testing with all issues fixed

## 🎨 Design Philosophy

**Skeuomorphic Minimalism** - Clean digital interface with subtle textures and shadows that evoke physical journaling.

### Key Design Elements

- **Colors**: Paper Cream (`#F9F7F1`), Soft Black (`#2D2D2D`), Leather Brown (`#8B7355`)
- **Typography**: Lora (serif) for content, Inter (sans-serif) for UI
- **Layout**: 8pt grid, 680px max content width, generous whitespace
- **Paper Texture**: 3-5% opacity overlay

### Chain-Specific Colors

- **Bob**: Orange gradient `#FF6B35` → `#F7931E`
- **Ink**: Purple `#5D3FD3`
- **Base**: Blue `#0052FF`
- **HyperEVM**: Green `#00F0A0`

## 📚 Documentation

- **[PRD](docs/MinMyMood-prd.md)**: Complete product requirements and specifications
- **[TODO](docs/todo.md)**: Development sprint plan (4 weeks)
- **[CLAUDE.md](CLAUDE.md)**: AI assistant guidance for this repository
- **CONTRACT_GUIDE.md**: (To be created) Smart contract deployment guide
- **API.md**: (To be created) Backend API documentation

## 🔧 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Radix UI (component primitives)
- Motion (animations)
- wagmi v2 + viem (Web3)
- RainbowKit (wallet connection UI)
- Zustand (state management)
- Sonner (toast notifications)

### Backend
- Supabase (PostgreSQL)
- Row-level security for wallet-based auth
- Auto-save with 3-second debounce
- Zustand for state management
- Automatic cleanup of expired thoughts (database function)
- Express.js API for ENS signature verification
- ECDSA signing service with rate limiting
- **TODO**: SIWE (Sign-In with Ethereum) authentication

### Blockchain
- Foundry for smart contract development
- Solidity ^0.8.20
- OpenZeppelin UUPS Upgradeable Contracts
- On-chain SVG generation (no IPFS)
- ECDSA signature verification for ENS
- Deployed on: Base Sepolia & Bob Testnet (V2.3.0)
- **Future**: LayerZero V2 ONFT721 for cross-chain bridging (V2)

## 🎯 Development Roadmap

### ✅ Sprint 1: Foundation & Infrastructure (COMPLETE)
**Part 1: Supabase & Web3 Setup**
- [x] Supabase project with omnichain schema
- [x] RLS policies (dev policies for testing)
- [x] wagmi v2 + viem + RainbowKit integration
- [x] Base Sepolia & Bob Sepolia chains configured
- [x] Zustand store with CRUD operations
- [x] TypeScript types for all data structures

**Part 2: Auto-Save & Gallery Integration**
- [x] Auto-save with 3-second debounce
- [x] Toast notifications for save operations
- [x] Draft ID tracking (prevents duplicates)
- [x] Gallery fetches from Supabase
- [x] Filter system (All/Minted/Ephemeral)
- [x] Chain badges on minted thoughts
- [x] Wallet connection gating
- [x] Loading states throughout

### ✅ Sprint 2: Smart Contract Development (COMPLETE)
**Foundry Setup**
- [x] Install Foundry (forge, cast, anvil)
- [x] Initialize Foundry project
- [x] Install OpenZeppelin Upgradeable Contracts
- [x] Configure foundry.toml with RPC URLs

**Smart Contract Implementation**
- [x] Implement `OnChainJournal.sol` with UUPS upgradeable pattern
- [x] On-chain SVG generation with animations
- [x] ENS support (optional parameter)
- [x] Chain-specific gradients
- [x] Advanced SVG features (grain texture, CSS animations)
- [x] 18 comprehensive tests passing

**Frontend Integration**
- [x] Create ENS resolution hook
- [x] Update Header to display ENS names
- [x] Update minting flow with ENS resolution

### ✅ Sprint 3: Testnet Deployment & Frontend Integration (COMPLETE)
**Testnet Deployment**
- [x] Deploy to Base Sepolia testnet
- [x] Deploy to Bob Testnet
- [x] Verify contracts on explorers
- [x] Test basic minting via contract calls

**Frontend Integration**
- [x] Add contract ABIs to frontend
- [x] Update wagmi contract configurations
- [x] Create minting hook (useMintJournalEntry)
- [x] Connect real minting flow to deployed contracts
- [x] PreviewChain Context for wallet-independent chain switching
- [x] Local SVG generation utility matching on-chain output
- [x] Gallery displays real minted NFTs as SVGs
- [x] React Router for proper URL navigation
- [x] 5 rounds of user testing with all issues fixed

### ✅ Sprint 3.1: ENS Verification Security Fix (COMPLETE)
**Backend Implementation**
- [x] Express.js signature service for ENS verification
- [x] `/api/ens-signature` endpoint with ECDSA signing
- [x] Rate limiting (10 signatures/hour per IP)
- [x] Trusted signer wallet configuration

**Smart Contract Upgrade (V2.0.0 → V2.3.0)**
- [x] Added ECDSA signature verification
- [x] Fixed Unicode checkmark display
- [x] Added updateChainName() admin function
- [x] Fixed Bob chain name display
- [x] Added ENS truncation for long names
- [x] Updated all tests (28/28 passing)

**Contract Deployment**
- [x] Deployed to Base Sepolia (verified)
- [x] Deployed to Bob Testnet
- [x] Upgraded proxies via UUPS

### 🎯 Sprint 4: Beta Testing & Public Launch (CURRENT)
**Beta Testing Program**
- [ ] Deploy frontend to testnet subdomain
- [ ] Recruit 5-10 beta testers
- [ ] Set up feedback collection system
- [ ] Monitor gas costs and user flows
- [ ] Fix critical bugs within 24 hours

**UX Improvements**
- [ ] Optimize loading states and transitions
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing

### 📅 Sprint 5: Mainnet Preparation
- [ ] Security review (internal)
- [ ] Consider external audit
- [ ] Set up multisig (Gnosis Safe)
- [ ] Fund mainnet deployer wallet

### 📅 Sprint 6: Mainnet Deployment
- [ ] Deploy to Base Mainnet
- [ ] Deploy to Bob Mainnet
- [ ] Transfer ownership to multisig
- [ ] Update frontend with mainnet addresses

### 📅 Sprint 7: Public Launch & V2 Planning
- [ ] Marketing preparation
- [ ] Public announcement
- [ ] Monitor for issues
- [ ] Plan V2 features (LayerZero cross-chain bridging)

## 📝 Key Features

1. **Ephemeral Thoughts**: Auto-delete after 7 days unless minted
2. **On-Chain NFTs**: Mint thoughts as permanent on-chain SVG NFTs
3. **Multi-Chain**: Support for Base, Bob, Ink, HyperEVM, and more
4. **Mood Tracking**: Attach mood states to journal entries
5. **Wallet-Based Auth**: No email/password, just connect wallet
6. **Gasless Minting**: (Future) Sponsored transactions for first mint

## 🤝 Contributing

This project is in active development. Please refer to `docs/todo.md` for current priorities.

## 📄 License

TBD

## 🔗 Links

- Figma Design: https://www.figma.com/design/fvBhclGBJrTCp3GsHGLaV5/Design-Pensieve-App-Screens
- Documentation: See `/docs` directory
