# MintMyMood - Development TODO

**Current Status**: Sprint 3 Complete ✅ - Production Ready for Beta Testing

---

## 📍 Current Progress

We are following the **Sprint Plan** (see `sprint_plan.md` for full breakdown).

### ✅ Completed: Sprint 1 - Foundation & Infrastructure

**Part 1: Supabase & Web3 Setup**
- [x] Set up Supabase project with omnichain schema
- [x] Configure RLS policies (with dev policies for testing)
- [x] Install wagmi, viem, RainbowKit, Zustand
- [x] Configure Base Sepolia & Bob Sepolia chains
- [x] Wrap app with wagmi/React Query/RainbowKit providers
- [x] Integrate RainbowKit ConnectButton (Rabby wallet prioritized)
- [x] Create Zustand store with CRUD + minting + bridging actions
- [x] Create TypeScript types for all data structures

**Part 2: Auto-Save & Gallery Integration**
- [x] Connect WritingInterface to Supabase with auto-save (3-second debounce)
- [x] Use toast notifications for save confirmations
- [x] Track draft IDs to prevent duplicate saves
- [x] Update Gallery to fetch real data from Supabase
- [x] Add filter system (All / Minted / Ephemeral)
- [x] Display chain badges on minted thoughts
- [x] Add wallet connection gating
- [x] Add loading states throughout
- [x] Fix RLS authentication with temporary dev policies

### ✅ Completed: Sprint 2 - Smart Contract Development

**Foundry Setup**
- [x] Install Foundry (forge, cast, anvil)
- [x] Initialize Foundry project in `contracts/` directory
- [x] Install dependencies (OpenZeppelin Upgradeable Contracts)
- [x] Configure `foundry.toml` with Base/Bob RPC URLs
- [x] Create `.env.example` for environment variables
- [x] Test local compilation and testing

**Smart Contract Implementation**
- [x] Create `OnChainJournal.sol` with:
  - [x] UUPS upgradeable pattern
  - [x] ERC721 standard compliance
  - [x] `mintEntry(text, mood, ensName)` function
  - [x] On-chain SVG generation with animations
  - [x] ENS support (optional parameter)
  - [x] Block number tracking
  - [x] Origin chain tracking
  - [x] Advanced SVG features (grain texture, CSS animations, drop shadows)
- [x] Implement on-chain SVG generation:
  - [x] Chain-specific gradient colors
  - [x] Text escaping for XML security
  - [x] Dynamic SVG layout with finaliz design
  - [x] Grain texture filter (feTurbulence)
  - [x] CSS keyframe animations (typewriter effect)
  - [x] ForeignObject for text wrapping
- [x] Write comprehensive tests (18/18 passing ✅):
  - [x] Initialization tests
  - [x] Minting functionality
  - [x] Input validation (text/mood limits)
  - [x] SVG generation and escaping
  - [x] ENS support
  - [x] Admin functions
  - [x] Upgrade functionality

**Frontend Integration**
- [x] Create ENS resolution hook (`src/hooks/useEnsName.ts`)
- [x] Update Header to display ENS names
- [x] Update minting flow to resolve ENS before contract call
- [x] Prepare for contract integration (comments and structure in place)

**Documentation**
- [x] Create `CONTRACT_GUIDE.md` with deployment guide
- [x] Create `DEPLOYMENT_CHECKLIST_V1.md` with step-by-step process
- [x] Create `V1_READY.md` with deployment readiness summary
- [x] Update all docs with ENS support and SVG implementation

### ✅ Completed: Sprint 3 - Testnet Deployment & Frontend Integration

**Testnet Deployment**
- [x] Fund deployer wallet with testnet ETH (Base Sepolia & Bob Testnet)
- [x] Configure environment variables in `.env`
- [x] Deploy to Base Sepolia testnet
- [x] Deploy to Bob Testnet
- [x] Verify contracts on Basescan (Base Sepolia)
- [x] Test basic minting via contract calls
- [x] Verify SVG renders correctly with chain-specific gradients
- [x] Test ENS name display in SVGs

**Frontend Integration**
- [x] Add contract ABIs to frontend (`src/contracts/OnChainJournal.abi.json`)
- [x] Update wagmi contract configurations (`src/contracts/config.ts`)
- [x] Create minting hook (`src/hooks/useMintJournalEntry.ts`)
- [x] Connect real minting flow to deployed contracts
- [x] Test end-to-end minting with ENS resolution
- [x] Implement PreviewChain Context for wallet-independent chain switching
- [x] Create local SVG generation utility matching on-chain output
- [x] Update Gallery to show real minted NFTs as SVGs
- [x] Add React Router for proper URL navigation
- [x] Fix all user-reported issues through 5 testing sessions

**User Testing Fixes (5 Sessions)**
- [x] Session 1: Chain switcher positioning, contract verification, transaction links
- [x] Session 2: Contract redeployment with correct naming, emoji display, SVG preview
- [x] Session 3: PreviewChain Context, local SVG generation, ENS resolution
- [x] Session 4: Gallery SVG display, React Router, delete button functionality
- [x] Session 5: Perfect square cards, delete button positioning

**Contract Addresses (V1.0.0 - Deprecated)**:
- Proxy: `0xceC072B04bF99517f12a86E8b19eb1e6AAf8b0eF`
- Implementation: `0xd2e8cb55cb91EC7d111eA187415f309Ba5DaBE8B`

### ✅ Completed: Sprint 3.1 - ENS Verification Security Fix

**Security Issue Resolved**: Added ECDSA signature verification to prevent ENS identity fraud

**Backend Implementation**
- [x] Created Express.js signature service for OVH shared hosting
- [x] Implemented `/api/ens-signature` endpoint
- [x] Added rate limiting (10 signatures/hour per IP)
- [x] Generated and configured trusted signer wallet
- [x] Tested endpoint locally
- [x] Backend running on port 3001

**Smart Contract Upgrade (V2.0.0 → V2.3.0)**
- [x] Added ECDSA signature verification
- [x] Added `trustedSigner` and `nonces` state variables
- [x] Updated `JournalEntry` struct with `ensVerified` and `minter` fields
- [x] Updated `mintEntry()` function with signature parameters
- [x] Fixed Unicode checkmark display (`\u2713` → `unicode"✓"`)
- [x] Added `updateChainName()` admin function
- [x] Fixed Bob chain name ("Unknown-808813" → "Bob")
- [x] Added ENS name truncation for long names (>23 chars)
- [x] Updated all 18 original tests + added 9 new signature tests (28/28 passing ✅)

**Contract Deployment (V2.3.0)**
- [x] Deployed to Base Sepolia (verified)
- [x] Deployed to Bob Testnet (verified)
- [x] Upgraded proxies via UUPS on both chains
- [x] Verified all contracts on explorers
- [x] Tested signature verification flow

**Current Contract Addresses (V2.3.0)**:
- **Proxy (both chains)**: `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8`
- **Implementation Base Sepolia**: `0x95a7BbfFBffb2D1e4b73B8F8A9435CE48dE5b47A`
- **Implementation Bob Testnet**: `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012`
- **Trusted Signer**: `0xEd171c759450B7358e9238567b1e23b4d82f3a64`

**Frontend Integration**
- [x] Updated contract ABI with new signature-based minting
- [x] Created signature API client (`src/lib/signatureApi.ts`)
- [x] Updated `useMintJournalEntry` hook with signature flow
- [x] Updated local SVG generation to match contract V2.3.0:
  - Shows `✓ ensname.eth` for verified ENS
  - Shows truncated ENS for long names (>23 chars)
  - Shows `0x1234...5678` for addresses without ENS
- [x] Exported clean ABI from build artifacts
- [x] Fixed ABI import issues
- [x] Verified app works end-to-end

**Documentation**
- [x] Updated `todo.md` with Sprint 3.1 completion
- [x] Updated version history
- [x] Documented new contract addresses

---

## 🎯 Next Up: Sprint 4 - User Testing & Beta Launch

### Beta Testing Program
- [ ] Deploy frontend to testnet subdomain (e.g., testnet.mintmymood.xyz)
- [ ] Create beta testing documentation
- [ ] Recruit 5-10 beta testers from community
- [ ] Set up feedback collection system (Google Forms or Typeform)
- [ ] Create testing scenarios and scripts

### Monitoring & Metrics
- [ ] Set up analytics (Vercel Analytics or similar)
- [ ] Monitor gas costs across different transaction types
- [ ] Track user flows and drop-off points
- [ ] Monitor contract interactions on both chains
- [ ] Set up error tracking (Sentry or similar)

### Bug Fixes & Iteration
- [ ] Collect and triage user feedback
- [ ] Fix critical bugs within 24 hours
- [ ] Fix medium-priority bugs within 1 week
- [ ] Document known issues and workarounds
- [ ] Update documentation based on user questions

### UX Improvements
- [ ] Optimize loading states and transitions
- [ ] Add more helpful error messages
- [ ] Consider gasless transactions (optional)
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Brave)

---

## 📅 Upcoming Sprints

### Sprint 5: Mainnet Preparation (After Beta Testing)
- [ ] Security review (internal)
- [ ] Consider external audit
- [ ] Set up multisig (Gnosis Safe)
- [ ] Prepare mainnet deployment plan
- [ ] Fund mainnet deployer wallet

### Sprint 6: Mainnet Deployment
- [ ] Deploy to Base Mainnet
- [ ] Deploy to Bob Mainnet
- [ ] Transfer ownership to multisig
- [ ] Update frontend with mainnet addresses
- [ ] Soft launch with small group

### Sprint 7: Public Launch
- [ ] Marketing preparation
- [ ] Public announcement
- [ ] Monitor for issues
- [ ] Respond to user feedback
- [ ] Plan V2 features (cross-chain bridging with LayerZero)

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
- [x] `OMNICHAIN_V1_SPRINT_PLAN.md` - Full sprint plan
- [x] `SPRINT1_DAYS1-4_COMPLETE.md` - Sprint 1 Part 1 summary
- [x] `SPRINT1_DAYS5-7_PROGRESS.md` - Sprint 1 Part 2 summary (updated)
- [x] `GETTING_STARTED.md` - Setup guide
- [x] `CTO_ASSESSMENT.md` - Technical analysis
- [x] `.env.example` - Environment variables template
- [x] `README.md` - Project overview (updated)
- [x] `CLAUDE.md` - AI assistant guidance (updated)

### 📝 Planned
- [ ] `API.md` - Backend API documentation
- [ ] `GOVERNANCE.md` - Governance process (for mainnet)
- [ ] `USER_GUIDE.md` - End-user documentation
- [ ] Update `sprint_plan.md` to reflect V1 scope (single-chain) and V2 plans (omnichain)

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

### Sprint 3 Goals ✅ ALL COMPLETE
- [x] Contracts deployed to Base Sepolia and Bob Testnet
- [x] Basic minting working on both testnets
- [x] SVG renders correctly with chain-specific colors
- [x] ENS names display properly in SVGs
- [x] Frontend connected to real contracts
- [x] End-to-end minting flow working
- [x] 5 rounds of user testing completed with all issues fixed

### Sprint 4 Goals (Current)
- [ ] Deploy to public testnet URL
- [ ] Complete beta testing with 5-10 external users
- [ ] Collect and document feedback
- [ ] Fix any critical bugs discovered
- [ ] Optimize UX based on real user behavior
- [ ] Achieve 90%+ task completion rate in user testing
- [ ] Mobile and cross-browser compatibility verified

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

- **Sprint Plan**: See `docs/sprint_plan.md` for detailed breakdown
- **Contract Guide**: See `docs/CONTRACT_GUIDE.md` for deployment instructions
- **Technical Docs**: See `docs/CTO_ASSESSMENT.md` for architecture decisions
- **Getting Started**: See `docs/GETTING_STARTED.md` for setup instructions
- **AI Assistant**: See `CLAUDE.md` for guidance to Claude Code

---

**Next Session Goals**: Deploy to public testnet and begin beta testing (Sprint 4) 🚀
