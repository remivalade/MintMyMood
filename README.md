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

**Sprint 1 - Week 1**: ✅ Complete (Days 1-7)

**Frontend**: ✅ Complete with real data integration
- Writing interface with auto-save (3-second debounce)
- Mood selection
- Mint preview
- Gallery view with filters (All/Minted/Ephemeral)
- Modal flows (wallet, minting, intro)
- Chain-specific badges on NFT cards
- Toast notifications for all save operations

**Backend**: ✅ Supabase connected and working
- PostgreSQL database with omnichain schema
- Row Level Security policies (temporary dev policies for testing)
- Auto-save to database
- Thought expiration tracking (7 days for ephemeral thoughts)
- **TODO**: Implement SIWE (Sign-In with Ethereum) authentication

**Smart Contracts**: ⏳ Ready for implementation (Days 8-14)
- Foundry setup needed
- `OnChainJournal.sol` to be implemented with UUPS + LayerZero ONFT721
- Deployment scripts to be created
- Testnet deployment planned for Sprint 2

**Web3 Integration**: ✅ Wallet connection complete
- wagmi v2 + viem integrated
- RainbowKit with custom styling (Rabby wallet prioritized)
- Wallet-based data isolation
- **TODO**: Smart contract minting integration (Sprint 2)

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
- **TODO**: SIWE (Sign-In with Ethereum) authentication

### Blockchain (Planned)
- Foundry for smart contract development
- Solidity ^0.8.20
- OpenZeppelin UUPS Upgradeable Contracts
- LayerZero V2 ONFT721 for cross-chain bridging
- On-chain SVG generation (no IPFS)
- Deploy on: Base Sepolia & Bob Sepolia (testnet), then Base & Bob (mainnet)

## 🎯 Development Roadmap

### Sprint 1 - Week 1: Supabase & Web3 Setup ✅ (COMPLETE)
**Days 1-4:**
- [x] Supabase project with omnichain schema
- [x] RLS policies (dev policies for testing)
- [x] wagmi v2 + viem + RainbowKit integration
- [x] Base Sepolia & Bob Sepolia chains configured
- [x] Zustand store with CRUD operations
- [x] TypeScript types for all data structures

**Days 5-7:**
- [x] Auto-save with 3-second debounce
- [x] Toast notifications for save operations
- [x] Draft ID tracking (prevents duplicates)
- [x] Gallery fetches from Supabase
- [x] Filter system (All/Minted/Ephemeral)
- [x] Chain badges on minted thoughts
- [x] Wallet connection gating
- [x] Loading states throughout

### Sprint 1 - Week 2: Smart Contract Development (Current - Days 8-14)
**Days 8-9:**
- [ ] Install Foundry (forge, cast, anvil)
- [ ] Initialize Foundry project
- [ ] Install OpenZeppelin Upgradeable + LayerZero V2 ONFT721

**Days 10-12:**
- [ ] Implement `OnChainJournal.sol` with UUPS + LayerZero
- [ ] Create `SVGGenerator.sol` library
- [ ] Write comprehensive tests

**Days 13-14:**
- [ ] Create deployment scripts
- [ ] Test on local Anvil chain
- [ ] Document deployment process

### Sprint 2 (Week 3-4): Testnet Deployment & Frontend Integration
- [ ] Deploy to Base Sepolia & Bob Sepolia
- [ ] Set up LayerZero trusted peers
- [ ] Test cross-chain bridging
- [ ] Integrate contracts with frontend
- [ ] Implement real minting flow

### Sprint 3 (Week 5-6): Bridge UI & Polish
- [ ] Build bridge interface
- [ ] Sync frontend SVG with on-chain SVG
- [ ] Mobile responsiveness testing
- [ ] End-to-end testing

### Sprint 4 (Week 7-8): Governance & Mainnet
- [ ] Set up multisig (Gnosis Safe)
- [ ] Deploy Timelock Controller
- [ ] Transfer ownership to governance
- [ ] Deploy to Base Mainnet & Bob Mainnet

### Sprint 5 (Week 9-10): Polish & Launch
- [ ] Final error handling & UX polish
- [ ] Complete documentation
- [ ] Performance optimization
- [ ] Public launch

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
