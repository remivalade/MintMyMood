# MintMyMood - On-Chain Journal

> A minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](docs/todo.md)

---

## 🎯 Core Concept

**Ephemeral vs Permanent**: Thoughts auto-delete after 7 days by default, but users can mint them as NFTs to preserve them forever on-chain as beautiful SVG artwork.

**Target Audience**: Crypto-native users who already have wallets and want a permanent on-chain record of their thoughts.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development (frontend + backend together)
npm run dev:all

# Or run individually:
npm run dev              # Frontend only (port 3000)
npm run dev:backend      # Backend only (port 3001)

# Test smart contracts
cd contracts && forge test
```

**New developer?** → Read [QUICK_START.md](docs/QUICK_START.md) for detailed setup (5 minutes)

---

## 📚 Documentation

| Doc | Purpose | Audience |
|-----|---------|----------|
| [QUICK_START.md](docs/QUICK_START.md) | Get running in 5 minutes | New developers |
| [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Architecture & workflow | All developers |
| [CONTRACT_GUIDE.md](docs/CONTRACT_GUIDE.md) | Smart contract details | Smart contract devs |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy to testnet/mainnet | DevOps/deployers |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute | Contributors |
| [todo.md](docs/todo.md) | Current tasks & status | Project tracking |

---

## 🏗️ Tech Stack

### Frontend
**React 18** + **TypeScript** + **Vite** | **Tailwind CSS** + **Radix UI** | **wagmi v2** + **viem** + **RainbowKit**

### Backend
**Supabase** (PostgreSQL) | **Express.js** (SIWE authentication)

### Blockchain
**Foundry** + **Solidity 0.8.20** | **UUPS Upgradeable ERC721** | **Base & Bob** (testnet & mainnet)

---

## 🚀 Current Status

**Sprint 3.1 Complete** ✅ - Production Ready for Beta Testing

### What's Built

**Frontend**:
- ✅ Complete UI flow (writing → mood → mint preview → gallery)
- ✅ Auto-save to Supabase (3-second debounce)
- ✅ Real wallet connection (RainbowKit)
- ✅ ENS name display (frontend resolution)
- ✅ Multi-chain support (Base, Bob, & Ink)
- ✅ MegaETH & HyperLiquid support (Coming Soon)
- ✅ React Router navigation

**Smart Contracts**:
- ✅ UUPS Upgradeable ERC721 (V2.4.0)
- ✅ On-chain SVG generation with animations
- ✅ Simplified minting (2 parameters: text, mood)
- ✅ Chain-specific gradients (Base: blue, Bob: orange, Ink: purple)
- ✅ Gas optimized (~30% reduction)
- ✅ 28/28 tests passing
- ✅ Deployed to Base Sepolia, Bob Testnet & Ink Sepolia

**Backend**:
- ✅ Express.js SIWE authentication service
- ✅ Supabase database with Row Level Security

### Deployed Contract Addresses (V2.4.0)

| Network | Proxy Address | Explorer |
|---------|---------------|----------|
| Base Sepolia | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Basescan](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| Bob Testnet | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Bob Explorer](https://testnet.explorer.gobob.xyz/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |
| Ink Sepolia | `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8` | [Ink Explorer](https://explorer-sepolia.inkonchain.com/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8) |

### Next Up: Sprint 4 - Beta Testing

- Deploy to public testnet URL
- Recruit 5-10 beta testers
- Collect feedback and optimize UX
- Mobile and cross-browser testing

See [todo.md](docs/todo.md) for detailed task tracking.

---

## 📁 Project Structure

```
MintMyMood/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/             # Custom hooks (minting, ENS)
│   ├── store/             # Zustand state management
│   └── contracts/         # Contract ABIs & config
├── contracts/             # Solidity smart contracts
│   ├── src/               # OnChainJournal.sol
│   ├── test/              # Foundry tests (28/28 ✅)
│   └── script/            # Deploy & upgrade scripts
├── backend/               # Backend services
│   ├── api/               # Express.js signature service
│   └── supabase/          # Database migrations
└── docs/                  # Documentation
```

---

## 🎨 Design Philosophy

**Skeuomorphic Minimalism** - Clean digital interface with subtle textures that evoke physical journaling.

**Colors**: Paper Cream `#F9F7F1` | Soft Black `#2D2D2D` | Leather Brown `#8B7355`

**Typography**: Lora (serif) for content | Inter (sans-serif) for UI

**Layout**: 8pt grid | 680px max width | Generous whitespace

See [SVG design specs](docs/svg/README.md) for complete visual reference.

---

## 🔑 Key Features

1. **Ephemeral Thoughts** - Auto-delete after 7 days unless minted
2. **On-Chain NFTs** - Permanent SVG NFTs with animations
3. **ENS Display** - Shows ENS names for verified addresses
4. **Multi-Chain** - Deploy on Base, Bob, & Ink (mainnet ready)
5. **Auto-Save** - Save drafts to Supabase after 3 seconds
6. **Gallery** - View all thoughts (minted & ephemeral)

---

## 🛠️ Development Commands

```bash
# Development (Recommended)
npm run dev:all          # Start both frontend & backend together

# Individual Services
npm run dev              # Frontend only (http://localhost:3000)
npm run dev:backend      # Backend only (http://localhost:3001)

# Production
npm run build            # Build frontend for production

# Smart Contracts
cd contracts
forge build              # Compile contracts
forge test               # Run tests (28/28 should pass)
forge test -vvv          # Verbose test output
```

---

## 📄 License

TBD

---

## 🔗 Links

- **Base Sepolia**: [Contract on Basescan](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8)
- **Bob Testnet**: [Contract on Bob Explorer](https://testnet.explorer.gobob.xyz/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8)
- **Ink Sepolia**: [Contract on Ink Explorer](https://explorer-sepolia.inkonchain.com/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8)

---

**Built with ❤️ for the on-chain journaling community** 🚀
