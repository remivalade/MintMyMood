# Deployment Checklist - On-Chain Journal V1

## Pre-Deployment Checklist

### Code Quality
- [x] All tests passing (18/18 ✅)
- [x] Contract compiles without errors
- [x] No compiler warnings addressed
- [x] SVG layout finalized by design team
- [x] ENS support implemented (frontend + contract)
- [ ] Gas optimization review complete
- [ ] Security review complete (internal)
- [ ] Consider external audit (recommended for mainnet)

### Environment Setup
- [ ] `.env` file configured with:
  - [ ] `PRIVATE_KEY` (deployer wallet)
  - [ ] `BASE_SEPOLIA_RPC_URL`
  - [ ] `BOB_SEPOLIA_RPC_URL` (or testnet RPC)
  - [ ] `BASESCAN_API_KEY` (for verification)
- [ ] Deployer wallet funded with:
  - [ ] ETH on Base Sepolia (~0.1 ETH)
  - [ ] ETH on Bob Testnet (~0.1 ETH)
- [ ] RPC endpoints tested and working

### Documentation
- [x] CONTRACT_GUIDE.md updated
- [x] README.md reflects V1 scope
- [x] Deployment scripts documented
- [ ] Frontend integration guide created
- [ ] User documentation drafted

---

## Testnet Deployment (Week 1)

### Base Sepolia Deployment

**Estimated Cost:** ~0.02-0.05 ETH

```bash
# 1. Deploy to Base Sepolia
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url base_sepolia \
  --broadcast \
  --verify

# 2. Verify deployment info saved
cat deployments/Base-Sepolia-84532.json

# 3. Test basic functionality
cast call <PROXY_ADDRESS> "name()(string)" --rpc-url base_sepolia
cast call <PROXY_ADDRESS> "symbol()(string)" --rpc-url base_sepolia
cast call <PROXY_ADDRESS> "version()(string)" --rpc-url base_sepolia
```

**Post-Deployment:**
- [ ] Proxy address saved
- [ ] Implementation address saved
- [ ] Contract verified on Basescan
- [ ] Test mint transaction successful
- [ ] SVG renders correctly
- [ ] Metadata accessible

### Bob Testnet Deployment

**Estimated Cost:** ~0.02-0.05 ETH (varies by network)

```bash
# 1. Deploy to Bob Testnet
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url bob_sepolia \
  --broadcast

# 2. Verify deployment
cat deployments/Bob-Testnet-111.json

# 3. Test basic functionality
cast call <PROXY_ADDRESS> "name()(string)" --rpc-url bob_sepolia
cast call <PROXY_ADDRESS> "color1()(string)" --rpc-url bob_sepolia
```

**Post-Deployment:**
- [ ] Proxy address saved
- [ ] Implementation address saved
- [ ] Test mint transaction successful
- [ ] Orange gradient renders correctly
- [ ] Metadata accessible

---

## Frontend Integration (Week 1-2)

### Update Environment Variables

Update frontend `.env`:
```bash
# Base Sepolia
VITE_JOURNAL_PROXY_BASE_SEPOLIA=0x...

# Bob Testnet
VITE_JOURNAL_PROXY_BOB_SEPOLIA=0x...
```

### Integration Tasks
- [ ] Add contract ABIs to frontend
- [ ] Update wagmi contract configurations
- [ ] Connect minting UI to real contracts
- [x] ENS resolution in header (displays ENS instead of address)
- [x] ENS resolution before minting (passes to contract)
- [ ] Test minting flow end-to-end with ENS
- [ ] Test minting flow end-to-end without ENS
- [ ] Verify SVG preview matches on-chain SVG
- [ ] Test gallery with real NFTs
- [ ] Verify wallet connection works
- [ ] Test on multiple wallets (MetaMask, Rabby, etc.)

### Testing Scenarios
- [ ] Mint with max text length (400 bytes)
- [ ] Mint with max mood length (64 bytes)
- [ ] Mint with special characters (&, <, >, ", ')
- [ ] Mint with emojis
- [ ] Mint with ENS name (e.g., vitalik.eth)
- [ ] Mint without ENS name (should show formatted address)
- [ ] Verify ENS displays correctly in SVG
- [ ] Verify gas costs reasonable (~240k for basic mint)
- [ ] Test multiple mints from same wallet
- [ ] Test mints from different wallets
- [ ] View NFTs in gallery
- [ ] View individual NFT details
- [ ] Check OpenSea testnet compatibility

---

## User Acceptance Testing (Week 2-3)

### Beta Testing
- [ ] Recruit 5-10 beta testers
- [ ] Provide testnet ETH for testing
- [ ] Collect feedback on:
  - [ ] Minting experience
  - [ ] SVG appearance
  - [ ] Gas costs
  - [ ] UI/UX issues
  - [ ] Bugs or errors
- [ ] Create issues for feedback items
- [ ] Prioritize fixes

### Performance Testing
- [ ] Measure average gas costs
- [ ] Test with network congestion
- [ ] Verify RPC reliability
- [ ] Test error handling
- [ ] Verify timeout handling

---

## Mainnet Deployment (Week 4+)

### Pre-Mainnet Checks
- [ ] All testnet issues resolved
- [ ] Beta testing complete
- [ ] Security review complete
- [ ] Consider professional audit
- [ ] Gas optimization finalized
- [ ] Emergency procedures documented
- [ ] Multisig wallet prepared (Gnosis Safe)
- [ ] Timelock contract prepared (optional)

### Base Mainnet Deployment

**⚠️ PRODUCTION DEPLOYMENT - PROCEED WITH CAUTION**

```bash
# 1. Triple-check environment
cat .env | grep BASE_MAINNET

# 2. Deploy to Base Mainnet
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url base \
  --broadcast \
  --verify

# 3. Verify on Basescan
# 4. Transfer ownership to multisig
cast send <PROXY_ADDRESS> \
  "transferOwnership(address)" <MULTISIG_ADDRESS> \
  --rpc-url base \
  --private-key $PRIVATE_KEY
```

**Post-Deployment:**
- [ ] Proxy address published
- [ ] Implementation address published
- [ ] Contract verified on Basescan
- [ ] Ownership transferred to multisig
- [ ] Test mint with small amount
- [ ] Monitor for 24 hours
- [ ] Announce to community

### Bob Mainnet Deployment

```bash
# 1. Deploy to Bob Mainnet
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url bob \
  --broadcast

# 2. Transfer ownership to multisig
cast send <PROXY_ADDRESS> \
  "transferOwnership(address)" <MULTISIG_ADDRESS> \
  --rpc-url bob \
  --private-key $PRIVATE_KEY
```

**Post-Deployment:**
- [ ] Proxy address published
- [ ] Implementation address published
- [ ] Ownership transferred to multisig
- [ ] Test mint successful
- [ ] Monitor for 24 hours
- [ ] Announce to community

---

## Post-Launch Monitoring (Ongoing)

### Week 1 Post-Launch
- [ ] Monitor gas costs daily
- [ ] Track number of mints
- [ ] Monitor for errors/reverts
- [ ] Check user feedback channels
- [ ] Verify SVGs render properly
- [ ] Monitor contract balance (should be 0)

### Week 2-4 Post-Launch
- [ ] Analyze usage patterns
- [ ] Identify optimization opportunities
- [ ] Plan V2 features
- [ ] Start LayerZero ONFT research
- [ ] Begin V2 development

---

## Emergency Procedures

### Contract Issues
1. **Stop minting (if critical bug found)**
   - UUPS allows upgrade
   - Deploy fixed implementation
   - Upgrade via multisig

2. **Pause mechanism (if needed in V2)**
   - Not in V1 (no pause function)
   - Add in V2 upgrade if needed

3. **Communication**
   - Twitter announcement
   - Discord notification
   - Update website banner
   - Coordinate with team

### Contact Information
- **Primary Contact:** [Your Name/Email]
- **Technical Lead:** [Tech Lead Contact]
- **Multisig Signers:** [List signers]
- **Emergency Fund:** [Wallet address with ETH for fixes]

---

## Success Metrics

### Technical Metrics
- [ ] Average gas cost < 0.5M gas per mint
- [ ] 99.9% uptime
- [ ] Zero critical bugs
- [ ] < 1% transaction failure rate

### User Metrics
- [ ] 100+ unique users in first month
- [ ] 500+ total mints in first month
- [ ] < 5% churn rate
- [ ] 4+ average user rating

---

## V2 Planning

Once V1 is stable (4-6 weeks post-launch):

- [ ] Finalize V2 feature list
- [ ] Research LayerZero V2 ONFT integration
- [ ] Design V2 architecture
- [ ] Write V2 upgrade tests
- [ ] Deploy V2 to testnet
- [ ] Test cross-chain bridging
- [ ] Deploy V2 upgrade to mainnet

---

**Last Updated:** October 17, 2025
**Version:** 1.0.0
**Status:** Pre-Testnet
