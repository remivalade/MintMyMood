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

**Frontend**: ✅ Complete UI prototype
- Writing interface with auto-save
- Mood selection
- Mint preview
- Gallery view
- Modal flows (wallet, minting, intro)

**Backend**: ⏳ Not yet implemented
- PostgreSQL database setup needed
- API routes for thought management
- Authentication via wallet signatures

**Smart Contracts**: ✅ Ready for deployment
- `OnChainJournal.sol` finalized
- Awaiting deployment to testnets/mainnets

**Web3 Integration**: ⏳ Not yet implemented
- wagmi/viem integration needed
- Wallet connection flow
- Contract interaction

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
- wagmi + viem (Web3, to be integrated)

### Backend (Planned)
- Node.js API or Supabase
- PostgreSQL database
- Row-level security for wallet-based auth
- Cron jobs for auto-deletion of expired thoughts

### Blockchain
- Solidity ^0.8.20
- OpenZeppelin ERC721
- On-chain SVG generation (no IPFS)
- Deploy on: Base, Bob, Ink, HyperEVM

## 🎯 Development Roadmap

### Week 1: MVP Backend & Core UI ✅
- [x] Frontend prototype complete

### Week 2: Backend & State Management (Current)
- [ ] PostgreSQL setup
- [ ] Backend API routes
- [ ] Frontend state management (Zustand)

### Week 3: Web3 Integration
- [ ] wagmi/viem integration
- [ ] Wallet connection
- [ ] Testnet deployment
- [ ] Minting functionality

### Week 4: Mainnet & Polish
- [ ] Mainnet deployments (5 chains)
- [ ] Error handling & loading states
- [ ] Responsive design polish
- [ ] Launch

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
