# MintMyMood - Sprint Plan

**Project**: MintMyMood (On-Chain Journal)
**Target Chains**: Base (Sepolia → Mainnet), Bob (Testnet → Mainnet)
**V1 Architecture**: UUPS Upgradeable ERC721 (single-chain)
**V2 Architecture**: V1 + LayerZero ONFT721 (cross-chain bridging)

---

## ⚠️ Important Note: V1 vs V2 Scope

**V1 (Current Implementation):**
- ✅ UUPS Upgradeable ERC721
- ✅ On-chain SVG with animations and ENS support
- ✅ Deploy independently on Base and Bob
- ✅ Single-chain minting (no cross-chain transfers)
- ✅ **Status: Ready for testnet deployment**

**V2 (Future Upgrade - Post-Launch):**
- ✅ Everything from V1
- ✅ LayerZero V2 ONFT integration
- ✅ Cross-chain NFT bridging (Base ↔ Bob)
- ✅ Will be deployed via UUPS upgrade (no redeployment needed)

**This sprint plan originally included omnichain (LayerZero) features in V1. We've decided to ship V1 as single-chain first, then add cross-chain features in V2 via UUPS upgrade.**

---

## Sprint Overview

| Sprint | Focus | Deliverable |
|--------|-------|-------------|
| Sprint 1 | Foundation & Infrastructure | Supabase + wagmi working, basic frontend integration |
| Sprint 2 | Smart Contract Development | UUPS + LayerZero contracts ready, testnet deployed |
| Sprint 3 | Bridge Integration & Testing | Cross-chain minting/bridging working on testnet |
| Sprint 4 | Governance & Mainnet | Multisig setup, mainnet deployment |
| Sprint 5 | Polish & Launch | Production-ready, documented, launched |

---

## 📅 Sprint 1: Foundation & Infrastructure

### Part 1: Backend & Database

#### Supabase Setup
- [ ] Create Supabase project
- [ ] Set up database schema with updated fields:
  ```sql
  CREATE TABLE thoughts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    text TEXT NOT NULL CHECK (char_length(text) <= 400),
    mood TEXT NOT NULL, -- emoji only
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_minted BOOLEAN DEFAULT FALSE,

    -- Chain & NFT data
    origin_chain_id INTEGER, -- Chain where originally minted
    current_chain_id INTEGER, -- Chain where currently located
    token_id TEXT,
    contract_address TEXT,
    tx_hash TEXT,

    -- Metadata
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Indexes
  CREATE INDEX idx_wallet_address ON thoughts(wallet_address);
  CREATE INDEX idx_is_minted ON thoughts(is_minted);
  CREATE INDEX idx_expires_at ON thoughts(expires_at);
  CREATE INDEX idx_token_id ON thoughts(token_id);
  ```

- [ ] Configure Row Level Security (RLS):
  ```sql
  ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can see their own thoughts"
    ON thoughts FOR SELECT
    USING (wallet_address = current_setting('request.jwt.claim.sub'));

  CREATE POLICY "Users can insert their own thoughts"
    ON thoughts FOR INSERT
    WITH CHECK (wallet_address = current_setting('request.jwt.claim.sub'));

  CREATE POLICY "Users can update their own thoughts"
    ON thoughts FOR UPDATE
    USING (wallet_address = current_setting('request.jwt.claim.sub'));
  ```

- [ ] Set up Supabase Edge Functions for:
  - Wallet signature authentication
  - Auto-deletion cron job (run every 10 minutes for testing)

- [ ] Document Supabase setup in `docs/API.md`

#### Frontend Web3 Integration

- [ ] Install dependencies:
  ```bash
  npm install wagmi viem @tanstack/react-query
  npm install @rainbow-me/rainbowkit
  npm install zustand
  ```

- [ ] Create chain configuration:
  ```typescript
  // src/config/chains.ts
  export const CHAIN_CONFIG = {
    baseSepolia: {
      id: 84532,
      name: 'Base Sepolia',
      network: 'base-sepolia',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://sepolia.base.org'] },
        public: { http: ['https://sepolia.base.org'] },
      },
      blockExplorers: {
        default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
      },
      testnet: true,
      layerZeroEndpointId: 40245, // Base Sepolia LZ endpoint
      colors: { from: '#0052FF', to: '#1E3A8A' },
    },
    bobSepolia: {
      id: 111, // Replace with actual Bob testnet chain ID
      name: 'Bob Sepolia',
      network: 'bob-sepolia',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://testnet.rpc.gobob.xyz'] },
        public: { http: ['https://testnet.rpc.gobob.xyz'] },
      },
      blockExplorers: {
        default: { name: 'Bob Explorer', url: 'https://testnet.explorer.gobob.xyz' },
      },
      testnet: true,
      layerZeroEndpointId: 40294, // Bob Sepolia LZ endpoint
      colors: { from: '#FF6B35', to: '#F7931E' },
    },
  };
  ```

- [ ] Set up wagmi config in `src/config/wagmi.ts`
- [ ] Wrap App with wagmi providers
- [ ] Replace mock wallet connection with real RainbowKit modal
- [ ] Test wallet connection on both Base Sepolia and Bob Sepolia

#### State Management

- [ ] Set up Zustand store:
  ```typescript
  // src/store/useThoughtStore.ts
  interface ThoughtStore {
    thoughts: Thought[];
    currentThought: Partial<Thought>;
    isLoading: boolean;
    fetchThoughts: (walletAddress: string) => Promise<void>;
    saveThought: (thought: Partial<Thought>) => Promise<void>;
    updateThought: (id: string, updates: Partial<Thought>) => Promise<void>;
    setCurrentThought: (thought: Partial<Thought>) => void;
  }
  ```

- [ ] Integrate Supabase client
- [ ] Connect WritingInterface to real auto-save (every 3 seconds)
- [ ] Update Gallery to fetch from Supabase

#### Testing & Integration

- [ ] Test complete flow: Write → Save to Supabase → View in Gallery
- [ ] Test wallet authentication
- [ ] Test auto-save functionality
- [ ] Test 10-minute expiry (create thought, wait, verify deletion)
- [ ] Fix any bugs

**Part 1 Deliverable**: Users can connect wallet, write thoughts, auto-save to Supabase, view in gallery

---

### Part 2: Contract Development Environment

#### Foundry Setup

- [ ] Install Foundry:
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

- [ ] Initialize Foundry project:
  ```bash
  cd contracts
  forge init --force
  ```

- [ ] Install dependencies:
  ```bash
  forge install OpenZeppelin/openzeppelin-contracts-upgradeable
  forge install OpenZeppelin/openzeppelin-contracts
  forge install LayerZero-Labs/LayerZero-v2
  ```

- [ ] Configure `foundry.toml`:
  ```toml
  [profile.default]
  src = "src"
  out = "out"
  libs = ["lib"]
  solc_version = "0.8.22"
  optimizer = true
  optimizer_runs = 200

  [rpc_endpoints]
  base_sepolia = "${BASE_SEPOLIA_RPC_URL}"
  bob_sepolia = "${BOB_SEPOLIA_RPC_URL}"
  base = "${BASE_RPC_URL}"
  bob = "${BOB_RPC_URL}"
  ```

- [ ] Create `.env.example`:
  ```
  # RPC URLs
  BASE_SEPOLIA_RPC_URL=
  BOB_SEPOLIA_RPC_URL=
  BASE_RPC_URL=
  BOB_RPC_URL=

  # Private Keys (NEVER commit actual keys)
  DEPLOYER_PRIVATE_KEY=

  # Etherscan API Keys (for verification)
  BASESCAN_API_KEY=
  BOBSCAN_API_KEY=

  # LayerZero Endpoints
  LZ_BASE_SEPOLIA_ENDPOINT=0x6EDCE65403992e310A62460808c4b910D972f10f
  LZ_BOB_SEPOLIA_ENDPOINT=0x...

  # Contract Addresses (filled after deployment)
  JOURNAL_PROXY_BASE_SEPOLIA=
  JOURNAL_PROXY_BOB_SEPOLIA=
  ```

#### Smart Contract Development

- [ ] Create base contract structure:
  ```
  contracts/src/
  ├── OnChainJournal.sol          # Main implementation
  ├── OnChainJournalProxy.sol     # UUPS Proxy
  ├── interfaces/
  │   └── IOnChainJournal.sol
  ├── libraries/
  │   ├── SVGGenerator.sol        # On-chain SVG generation
  │   └── StringUtils.sol         # String escaping & utilities
  └── test/
      ├── OnChainJournal.t.sol
      └── Bridge.t.sol
  ```

- [ ] Implement `OnChainJournal.sol`:
  - Inherit from ONFT721 (LayerZero)
  - Implement UUPS upgradeability
  - Add `mint(text, mood)` function
  - Add `_lzReceive()` for cross-chain data
  - Add storage for `originChainId`
  - Implement `tokenURI()` with dynamic SVG generation

- [ ] Implement `SVGGenerator.sol`:
  - Chain-specific gradient colors
  - Text escaping function
  - Modular layout functions (default layout for V1)

- [ ] Write comprehensive tests:
  ```bash
  forge test -vvv
  ```

#### Deployment Scripts

- [ ] Create deployment script `script/Deploy.s.sol`:
  - Deploy implementation contract
  - Deploy proxy
  - Initialize proxy
  - Set LayerZero trusted remotes
  - Verify contracts on explorer

- [ ] Test deployment on Anvil (local):
  ```bash
  anvil
  forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
  ```

- [ ] Document deployment process in `docs/CONTRACT_GUIDE.md`

**Part 2 Deliverable**: Smart contracts complete, tested, ready for testnet deployment

---

## 📅 Sprint 2: Smart Contract Deployment & Integration

### Part 1: Testnet Deployment

#### Base Sepolia Deployment

- [ ] Deploy to Base Sepolia:
  ```bash
  forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --broadcast \
    --verify
  ```

- [ ] Verify both proxy and implementation on BaseScan
- [ ] Test basic minting via Etherscan write functions
- [ ] Verify SVG renders correctly in OpenSea testnet

#### Bob Sepolia Deployment

- [ ] Deploy to Bob Sepolia (same process)
- [ ] Verify contracts
- [ ] Set up LayerZero trusted remotes:
  ```solidity
  // On Base Sepolia contract
  setPeer(bobSepoliaChainId, bobSepoliaContractAddress);

  // On Bob Sepolia contract
  setPeer(baseSepoliaChainId, baseSepoliaContractAddress);
  ```

#### Bridge Testing

- [ ] Mint NFT on Base Sepolia
- [ ] Bridge to Bob Sepolia via LayerZero
- [ ] Verify NFT metadata preserved (originChainId, text, mood)
- [ ] Verify SVG colors reflect origin chain
- [ ] Bridge back to Base Sepolia
- [ ] Test edge cases (invalid data, failed bridges, etc.)

#### Documentation

- [ ] Update `CONTRACT_GUIDE.md` with:
  - Deployed addresses
  - How to verify contracts
  - How to set peers
  - Common issues

**Part 1 Deliverable**: Contracts deployed on both testnets, bridging working

---

### Part 2: Frontend Contract Integration

#### Contract ABIs & Config

- [ ] Generate TypeScript types from ABIs:
  ```bash
  forge build
  # Copy ABIs to frontend
  ```

- [ ] Create contract config:
  ```typescript
  // src/config/contracts.ts
  export const CONTRACTS = {
    [CHAIN_CONFIG.baseSepolia.id]: {
      address: '0x...',
      abi: OnChainJournalABI,
    },
    [CHAIN_CONFIG.bobSepolia.id]: {
      address: '0x...',
      abi: OnChainJournalABI,
    },
  };
  ```

#### Minting Flow

- [ ] Update MintPreview component:
  - Show chain selector (Base/Bob)
  - Show estimated gas cost
  - Preview SVG with correct chain colors

- [ ] Implement mint transaction:
  ```typescript
  const { write: mint } = useContractWrite({
    address: CONTRACTS[chainId].address,
    abi: CONTRACTS[chainId].abi,
    functionName: 'mint',
    args: [text, moodEmoji],
  });
  ```

- [ ] Handle transaction lifecycle:
  - Waiting for user approval
  - Transaction pending
  - Transaction confirmed
  - Update Supabase with token_id and tx_hash

- [ ] Update MintingModal with real transaction status

#### Gallery Integration

- [ ] Update ThoughtCard to show:
  - Chain badge (Base/Bob)
  - Token ID
  - Link to block explorer
  - "View NFT" button (opens OpenSea testnet)

- [ ] Add filter by chain
- [ ] Add filter by minted/unminted
- [ ] Test complete user flow

**Part 2 Deliverable**: Complete mint flow working on testnets

---

## 📅 Sprint 3: Bridge UI & Polish

### Part 1: Bridge Interface

#### Bridge Component

- [ ] Create BridgeModal component:
  - Show current chain
  - Chain selector (destination)
  - Estimate bridge cost (LayerZero fees)
  - "Bridge" button

- [ ] Implement bridge transaction:
  ```typescript
  const { write: bridge } = useContractWrite({
    address: CONTRACTS[chainId].address,
    abi: CONTRACTS[chainId].abi,
    functionName: 'sendFrom',
    args: [ownerAddress, dstChainId, tokenId],
    value: estimatedFee,
  });
  ```

- [ ] Add bridge status tracking:
  - LayerZero message sent
  - Waiting for confirmation
  - NFT received on destination chain

#### Chain Switching & UX

- [ ] Add "Switch Network" button when user is on wrong chain
- [ ] Show warning if user tries to mint on wrong chain
- [ ] Add tooltips explaining bridge process
- [ ] Add loading states for all transactions
- [ ] Add error recovery (transaction failed, retry, etc.)

#### Integration Testing

- [ ] Test complete flow:
  1. Connect wallet → Base Sepolia
  2. Write thought → Mint on Base
  3. Bridge to Bob
  4. View NFT on both chains
  5. Bridge back to Base

- [ ] Test error cases
- [ ] Fix bugs

**Part 1 Deliverable**: Bridge UI complete, fully functional on testnets

---

### Part 2: SVG Preview Matching

#### SVG Sync

- [ ] Ensure MintPreview matches on-chain SVG exactly:
  - Same fonts (need to embed in SVG)
  - Same colors
  - Same layout
  - Same text wrapping

- [ ] Create SVG preview generator that matches contract logic
- [ ] Test with various text lengths and emojis
- [ ] Handle edge cases (long words, special characters, etc.)

#### Mobile Responsiveness

- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Fix responsive issues
- [ ] Test wallet connection on mobile (WalletConnect)
- [ ] Test bridge flow on mobile
- [ ] Optimize for slow connections

#### Comprehensive Testing

- [ ] End-to-end testing checklist:
  - [ ] Connect wallet (desktop)
  - [ ] Connect wallet (mobile)
  - [ ] Write thought
  - [ ] Auto-save works
  - [ ] Mint on Base Sepolia
  - [ ] View in gallery
  - [ ] Bridge to Bob Sepolia
  - [ ] Verify on OpenSea
  - [ ] Bridge back
  - [ ] Expired thoughts delete after 10 min

**Part 2 Deliverable**: Polished testnet version ready for mainnet

---

## 📅 Sprint 4: Governance & Mainnet

### Part 1: Multisig & Governance Setup

#### Gnosis Safe Setup

- [ ] Deploy Gnosis Safe on Base:
  - 3-of-5 multisig (or your preferred threshold)
  - Add trusted signers

- [ ] Deploy Gnosis Safe on Bob
- [ ] Test multisig transactions on testnet first

#### Timelock Setup

- [ ] Deploy OpenZeppelin TimelockController on Base:
  - Set delay: 48 hours
  - Set multisig as proposer
  - Set multisig as executor

- [ ] Deploy TimelockController on Bob
- [ ] Test timelock flow on testnet

#### Transfer Ownership

- [ ] Transfer proxy admin to timelock on testnet
- [ ] Test upgrade flow:
  1. Multisig proposes upgrade
  2. Wait 48 hours
  3. Execute upgrade
  4. Verify new implementation

- [ ] Document governance process in `docs/GOVERNANCE.md`

#### Mainnet Preparation

- [ ] Audit deployment checklist:
  - [ ] All contracts verified on testnet
  - [ ] Bridge working on testnet
  - [ ] Governance working on testnet
  - [ ] Frontend deployed to staging
  - [ ] Gas tokens ready for mainnet
  - [ ] Block explorer API keys ready

**Part 1 Deliverable**: Governance setup complete and tested on testnet

---

### Part 2: Mainnet Deployment

#### Base Mainnet

- [ ] Deploy contracts to Base mainnet:
  ```bash
  forge script script/Deploy.s.sol \
    --rpc-url $BASE_RPC_URL \
    --broadcast \
    --verify \
    --slow
  ```

- [ ] Verify contracts on BaseScan
- [ ] Transfer ownership to timelock
- [ ] Test mint functionality (mint your own test NFT)

#### Bob Mainnet

- [ ] Deploy to Bob mainnet (same process)
- [ ] Set up LayerZero trusted remotes (mainnet)
- [ ] Test bridge with small amount first

#### Frontend Configuration

- [ ] Update frontend with mainnet addresses
- [ ] Deploy frontend to Vercel:
  ```bash
  npm run build
  vercel --prod
  ```

- [ ] Set up environment variables in Vercel dashboard
- [ ] Point domain to Vercel
- [ ] Test production deployment

#### Final Mainnet Testing

- [ ] Mint real NFT on Base mainnet
- [ ] Bridge to Bob mainnet
- [ ] Verify SVG on OpenSea
- [ ] Test all flows with real money
- [ ] Monitor gas costs

**Part 2 Deliverable**: Fully deployed on mainnet, production-ready

---

## 📅 Sprint 5: Polish & Launch

### Part 1: Polish & Documentation

#### Error Handling & Edge Cases

- [ ] Comprehensive error messages:
  - Transaction rejected
  - Insufficient gas
  - Bridge failed
  - Network congestion

- [ ] Add retry mechanisms
- [ ] Add transaction history
- [ ] Add recent activity feed

#### Documentation

- [ ] Complete `docs/CONTRACT_GUIDE.md`:
  - Architecture overview
  - Deployment process
  - Upgrade process
  - Security considerations

- [ ] Complete `docs/API.md`:
  - Supabase schema
  - RLS policies
  - Edge functions
  - Authentication flow

- [ ] Create `docs/USER_GUIDE.md`:
  - How to connect wallet
  - How to mint
  - How to bridge
  - FAQ

- [ ] Create `docs/DEPLOYMENT.md`:
  - Frontend deployment
  - Environment variables
  - Monitoring setup

#### Performance Optimization

- [ ] Optimize bundle size
- [ ] Lazy load components
- [ ] Optimize images
- [ ] Add caching strategies
- [ ] Test on slow connections

**Part 1 Deliverable**: Production-ready with complete documentation

---

### Part 2: Launch

#### Pre-Launch

- [ ] Security checklist:
  - [ ] Contracts verified on both chains
  - [ ] Multisig tested
  - [ ] No private keys in code
  - [ ] RLS policies working
  - [ ] Rate limiting enabled

- [ ] Marketing prep:
  - [ ] Landing page copy
  - [ ] Tweet thread
  - [ ] Blog post
  - [ ] Demo video

#### Soft Launch

- [ ] Invite 10-20 beta testers
- [ ] Monitor for bugs
- [ ] Collect feedback
- [ ] Fix critical issues

#### Public Launch

- [ ] Announce on Twitter
- [ ] Post on relevant communities
- [ ] Monitor usage
- [ ] Respond to user questions
- [ ] Fix bugs quickly

#### Post-Launch

- [ ] Monitor contract events
- [ ] Track user metrics (Supabase)
- [ ] Collect user feedback
- [ ] Plan V1.1 improvements

**Part 2 Deliverable**: Successfully launched, users minting and bridging

---

## 🎯 Success Metrics

### Technical Metrics
- [ ] 0 critical bugs in first week
- [ ] < 2 second page load time
- [ ] > 99% uptime
- [ ] All contracts verified on block explorers

### User Metrics
- [ ] 100+ mints in first week
- [ ] 10+ bridges in first week
- [ ] 50+ unique wallet connections
- [ ] < 5% transaction failure rate

### Business Metrics
- [ ] < $200 total deployment cost
- [ ] < $50/month operating cost (pre-gasless)
- [ ] Positive user feedback

---

## 🚨 Risk Mitigation

### High Risk Items
1. **LayerZero Bridge Failure**
   - Mitigation: Extensive testnet testing, small mainnet test first
   - Backup: Can pause bridge if issues arise

2. **Proxy Upgrade Bug**
   - Mitigation: 48-hour timelock, multisig approval
   - Backup: Can redeploy V2 if needed

3. **SVG Rendering Issues**
   - Mitigation: Test across browsers/wallets
   - Backup: Can upgrade implementation to fix

### Medium Risk Items
1. **Gas Costs Higher Than Expected**
   - Mitigation: Optimize contract, test on mainnet early

2. **Supabase RLS Misconfiguration**
   - Mitigation: Thorough testing before mainnet

3. **Mobile Wallet Issues**
   - Mitigation: Test WalletConnect early

---

## 📋 Progress Tracking

Track regularly:
- [ ] What have I completed?
- [ ] What am I working on now?
- [ ] Any blockers?
- [ ] Any decisions needed?

---

## 🛠️ Tools & Resources

### Development
- Foundry (contracts)
- Vite (frontend)
- Supabase (backend)
- Vercel (hosting)

### Web3 Libraries
- LayerZero V2
- OpenZeppelin Upgradeable
- wagmi + viem
- RainbowKit

### Testing
- Forge (contract tests)
- Anvil (local chain)
- Base Sepolia + Bob Sepolia (testnets)

### Monitoring
- Etherscan/BaseScan (contract activity)
- Supabase Dashboard (database)
- Vercel Analytics (frontend)
- LayerZero Scan (bridge messages)

---

## ✅ Pre-Flight Checklist (Before Starting)

- [ ] Wallet funded with testnet ETH (Base Sepolia + Bob Sepolia)
- [ ] Wallet funded with mainnet ETH (Base + Bob) - ~$200 worth
- [ ] Supabase account created
- [ ] Vercel account created
- [ ] Domain purchased (optional for testing)
- [ ] Block explorer API keys obtained
- [ ] Environment variables documented in `.env.example`
- [ ] GitHub repo set up with proper .gitignore
- [ ] Read all LayerZero documentation
- [ ] Read OpenZeppelin proxy documentation

---

**Ready to start? Let me know and we'll begin Sprint 1! 🚀**
