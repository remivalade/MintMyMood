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
- [x] Check the different SVG generation to see if they could be optimised without the style changing. (Attempted optimization increased bytecode size due to function overhead. Current implementation is efficient enough for now.)

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

