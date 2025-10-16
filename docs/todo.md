# MintMyMood - Development TODO

**Last Updated**: October 16, 2025
**Current Status**: Sprint 1 Days 5-7 Complete ✅

---

## 📍 Current Progress

We are following the **Omnichain V1 Sprint Plan** (see `OMNICHAIN_V1_SPRINT_PLAN.md` for full 10-week breakdown).

### ✅ Completed: Sprint 1 - Days 1-7 (Week 1)

**Days 1-4: Supabase & Web3 Setup**
- [x] Set up Supabase project with omnichain schema
- [x] Configure RLS policies (with dev policies for testing)
- [x] Install wagmi, viem, RainbowKit, Zustand
- [x] Configure Base Sepolia & Bob Sepolia chains
- [x] Wrap app with wagmi/React Query/RainbowKit providers
- [x] Integrate RainbowKit ConnectButton (Rabby wallet prioritized)
- [x] Create Zustand store with CRUD + minting + bridging actions
- [x] Create TypeScript types for all data structures

**Days 5-7: Auto-Save & Gallery Integration**
- [x] Connect WritingInterface to Supabase with auto-save (3-second debounce)
- [x] Use toast notifications for save confirmations
- [x] Track draft IDs to prevent duplicate saves
- [x] Update Gallery to fetch real data from Supabase
- [x] Add filter system (All / Minted / Ephemeral)
- [x] Display chain badges on minted thoughts
- [x] Add wallet connection gating
- [x] Add loading states throughout
- [x] Fix RLS authentication with temporary dev policies

---

## 🎯 Next Up: Sprint 1 - Days 8-14 (Week 2)

### Smart Contract Development

**Days 8-9: Foundry Setup**
- [ ] Install Foundry (forge, cast, anvil)
- [ ] Initialize Foundry project in `contracts/` directory
- [ ] Install dependencies:
  - [ ] OpenZeppelin Upgradeable Contracts
  - [ ] LayerZero V2 ONFT721
- [ ] Configure `foundry.toml` with Base/Bob RPC URLs
- [ ] Create `.env` for private keys and endpoints
- [ ] Test local deployment with Anvil

**Days 10-12: Smart Contract Implementation**
- [ ] Create `OnChainJournal.sol` with:
  - [ ] UUPS upgradeable pattern
  - [ ] LayerZero ONFT721 inheritance
  - [ ] `mint(text, mood)` function
  - [ ] On-chain SVG generation
  - [ ] Origin chain tracking
- [ ] Create `SVGGenerator.sol` library:
  - [ ] Chain-specific gradient colors
  - [ ] Text escaping for XML
  - [ ] Dynamic SVG layout
- [ ] Write comprehensive tests:
  - [ ] Minting functionality
  - [ ] SVG generation
  - [ ] Upgrade functionality
  - [ ] Cross-chain preparation

**Days 13-14: Deployment Scripts**
- [ ] Create `Deploy.s.sol` Foundry script
- [ ] Test deployment on local Anvil chain
- [ ] Create contract verification script
- [ ] Document deployment process in `CONTRACT_GUIDE.md`
- [ ] Prepare for testnet deployment (Sprint 2)

---

## 📅 Upcoming Sprints

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
- [ ] Comprehensive end-to-end testing

### Sprint 4 (Week 7-8): Governance & Mainnet
- [ ] Set up multisig (Gnosis Safe)
- [ ] Deploy Timelock Controller
- [ ] Transfer ownership to governance
- [ ] Deploy to Base Mainnet & Bob Mainnet

### Sprint 5 (Week 9-10): Polish & Launch
- [ ] Final error handling & UX polish
- [ ] Complete all documentation
- [ ] Performance optimization
- [ ] Public launch

---

## 🐛 Known Issues & Technical Debt

### High Priority
1. **Authentication**: Using temporary dev RLS policies
   - Need to implement proper SIWE (Sign-In with Ethereum)
   - Location: `backend/supabase/migrations/004_temporary_dev_policies.sql`
   - TODO: Create migration `005_siwe_authentication.sql`

2. **Draft Expiration**: Currently 10 minutes for testing
   - Need to change to 7 days for production
   - Location: `src/components/WritingInterface.tsx:50`

### Medium Priority
3. **Chain Filter UI**: Infrastructure exists but UI not exposed
   - State: `Gallery.tsx:21` (selectedChain)
   - TODO: Add chain filter dropdown

4. **Bob RPC CORS**: Warning about CORS from Bob testnet RPC
   - Non-critical, doesn't affect functionality
   - May need to configure alternative RPC endpoint

### Low Priority
5. **Mock Minting Modal**: Still using simulated minting
   - Will be replaced in Sprint 2 with real contract calls

---

## 📚 Documentation Status

### ✅ Complete
- [x] `OMNICHAIN_V1_SPRINT_PLAN.md` - Full 10-week plan
- [x] `SPRINT1_DAYS1-4_COMPLETE.md` - Days 1-4 summary
- [x] `SPRINT1_DAYS5-7_PROGRESS.md` - Days 5-7 summary (updated)
- [x] `GETTING_STARTED.md` - Setup guide
- [x] `CTO_ASSESSMENT.md` - Technical analysis
- [x] `.env.example` - Environment variables template
- [x] `README.md` - Project overview (updated)
- [x] `CLAUDE.md` - AI assistant guidance (updated)

### ⏳ In Progress
- [ ] `CONTRACT_GUIDE.md` - Will create during Days 13-14

### 📝 Planned
- [ ] `API.md` - Backend API documentation
- [ ] `GOVERNANCE.md` - Governance process
- [ ] `USER_GUIDE.md` - End-user documentation
- [ ] `DEPLOYMENT.md` - Production deployment guide

---

## 🔧 Development Environment

### Current Setup
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Web3**: wagmi v2 + viem + RainbowKit
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Dev Server**: http://localhost:3000

### Environment Variables Required
```bash
# Supabase
VITE_SUPABASE_URL=✅ Set
VITE_SUPABASE_ANON_KEY=✅ Set
SUPABASE_SERVICE_ROLE_KEY=✅ Set

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=✅ Set

# Environment
VITE_ENVIRONMENT=development

# Contract addresses (to be filled after deployment)
VITE_JOURNAL_PROXY_BASE_SEPOLIA=
VITE_JOURNAL_PROXY_BOB_SEPOLIA=
VITE_JOURNAL_PROXY_BASE=
VITE_JOURNAL_PROXY_BOB=
```

---

## 🎯 Success Criteria for Current Sprint

### Week 2 Goals (Days 8-14)
- [ ] Foundry environment set up and working
- [ ] Smart contracts complete with tests passing
- [ ] Deployment scripts tested on Anvil
- [ ] Documentation for contract deployment created
- [ ] Ready to deploy to testnets in Sprint 2

---

## 🚀 Quick Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Build for production

# Supabase
npx tsx backend/supabase/test-connection.ts  # Test DB connection

# Smart Contracts (once Foundry is set up)
forge build              # Compile contracts
forge test               # Run tests
forge test -vvv          # Run tests with verbose output
anvil                    # Start local blockchain
```

---

## 📞 Getting Help

- **Sprint Plan**: See `docs/OMNICHAIN_V1_SPRINT_PLAN.md` for detailed breakdown
- **Technical Docs**: See `docs/CTO_ASSESSMENT.md` for architecture decisions
- **Getting Started**: See `docs/GETTING_STARTED.md` for setup instructions
- **AI Assistant**: See `CLAUDE.md` for guidance to Claude Code

---

**Next Session Goals**: Set up Foundry and begin smart contract development (Days 8-9) 🚀
