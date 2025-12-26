# MintMyMood - Development TODO

**Current Status**: Sprint 3.6 to start 🚧

---

## 🎯 Next Up: Sprint 3.6 - Quality of life and lastings little bugs

### Website

- [x] When a user reconnects and sign on the gallery, there is no refresh so his minted NFT and saved are not displayed.
- [x] After minting an NFT, the "see NFT in gallery" do not redirect to gallery but to /write. It should display the NFT page (example : websitename/thought/8416c588-9c49-4152-be4a-da8ef1e0c9fe).
- [x] When the mint of an nft fails, user is redirected to the write page. He should be able to re-launch the transaction and have a clear error why it failed (user cancelled transaction f.e. or transaction failed).
- [x] on the gallery, the emojis from the previews of our thoughts appear above the "write" button. This button should always appear above everything.

### NFT generation
- [x] Check the different SVG generation to see if they could be optimised without the style changing.
  - ✅ **COMPLETED**: Implemented hybrid optimization approach (Dec 24, 2024)
  - **Optimizations Applied**:
    - Shortened IDs with chain-specific suffixes: `d-base`, `g1-bob`, `c-ink` (instead of `drop-shadow`, `gradient2-Base`, etc.)
    - Optimized `_escapeString`: Exact allocation instead of 6x pre-allocation + trimming
    - Added `_toLowercase` helper for consistent chain ID generation
  - **Results**:
    - ID length reduction: ~50% (e.g., `gradient2-Base` → `g1-base`)
    - No ID conflicts when displaying multi-chain NFTs together
    - All 25 tests passing
    - Visual output unchanged (verified via HTML preview)
  - **Gas Impact**: Moderate savings on string operations, slight increase from toLowerCase operation
  - **Trade-offs**: Still allows multi-chain gallery displays without color bleeding
  - **Version**: V2.5.1 → V2.5.2 (optimization release)

### Backend
- [x] Why are there still mentions of "backend" in package.json. Audit to see if it's still needed, if not, clean !


## Sprint 4 - User Testing & Beta Launch

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

### Sprint 8: NFT Immutability Improvements
**Goal**: Ensure minted NFTs maintain their exact visual appearance forever, even if contracts are upgraded.

**Current State**:
- ✅ NFT content (text, emoji, timestamp) is stored permanently
- ⚠️ Visual rendering (colors, fonts, layouts) is generated on-demand from contract code
- ⚠️ If contract is upgraded or owner calls `updateColors()`, ALL existing NFTs will change appearance
- ⚠️ Violates NFT immutability principle

**Proposed Solutions**:

#### Option 1: Store Visual Parameters (Recommended)
- [ ] Add fields to `JournalEntry` struct:
  - `string mintColor1` - Lock in gradient color 1 at mint time
  - `string mintColor2` - Lock in gradient color 2 at mint time
  - `string mintChainName` - Lock in chain name for wave patterns
- [ ] Update `mintEntry()` to capture current values
- [ ] Update `generateSVG()` to use stored values instead of state variables
- [ ] **Gas Impact**: ~30-40k extra per mint
- [ ] **Immutability**: Core visual identity (colors, patterns) locked forever
- [ ] **Trade-off**: Fonts/layouts might still change with upgrades

#### Option 2: Version-Based Rendering (Most Flexible)
- [ ] Add `uint8 renderVersion` to `JournalEntry` struct
- [ ] Implement versioned `generateSVG` functions:
  ```solidity
  function generateSVG(JournalEntry memory entry) {
      if (entry.renderVersion == 1) return _generateSVG_V1(entry);
      else if (entry.renderVersion == 2) return _generateSVG_V2(entry);
      // Each version preserved forever
  }
  ```
- [ ] **Gas Impact**: ~3-5k extra per mint
- [ ] **Immutability**: Each NFT locked to its render version
- [ ] **Trade-off**: Contract grows over time, more complexity

#### Option 3: Full SVG Storage (Maximum Immutability)
- [ ] Add `string fullSVG` to `JournalEntry` struct
- [ ] Generate and store complete SVG at mint time
- [ ] **Gas Impact**: ~500-800k extra per mint (VERY expensive!)
- [ ] **Immutability**: 100% - pixel-perfect forever
- [ ] **Trade-off**: High cost, users pay significantly more

#### Option 4: Remove Upgradeability (Simplest)
- [ ] Test thoroughly before mainnet deployment
- [ ] Remove UUPS upgrade capability after deployment
- [ ] Document that contract cannot be upgraded
- [ ] **Gas Impact**: None
- [ ] **Immutability**: 100% guaranteed by design
- [ ] **Trade-off**: Cannot fix bugs or add features ever

**Recommended Approach**:
Combine Option 1 + Option 2 for best balance:
1. Store visual parameters (colors, chainName) ✅
2. Add renderVersion tracking ✅
3. Plan to NOT upgrade unless critical bug ✅
4. Document immutability guarantees in smart contract ✅

**Implementation Priority**: Medium-High
- Not critical for launch, but important for long-term NFT value
- Can be implemented as a contract upgrade (V2.6.0)
- Should be done before mainnet launch if immutability is a core value

**References**:
- Contract: `contracts/src/OnChainJournal.sol`
- Current version: V2.5.1
- Target version: V2.6.0 (with immutability)

---

## 🐛 Known Issues & Technical Debt

### High Priority
1. ~~**Authentication**: Using temporary dev RLS policies~~ ✅ **RESOLVED**
   - **Status**: Sprint 3.2 complete (Nov 3, 2025)
   - **Solution**: SIWE (Sign-In with Ethereum) with JWT-based RLS now active
   - Production RLS policies enforce per-wallet data isolation
   - All temporary dev policies removed

2. **Draft Expiration**: Currently 10 minutes for testing
   - Need to change to 7 days for production
   - Location: `src/components/WritingInterface.tsx:50`
   - Can be changed in 1 minute (simple constant update)

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
VITE_SUPABASE_ANON_KEY=✅ Set (sb_publishable_...)
SUPABASE_SERVICE_ROLE_KEY=✅ Set (sb_secret_...)

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

