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
| Sprint 2 | Smart Contract Development | UUPS contracts ready, testnet deployed |
| Sprint 3 | Testnet Deployment & Integration | Complete minting flow working on testnet |
| **Sprint 3.1** | **ENS Verification Security Fix** | **Signature verification preventing ENS fraud** |
| Sprint 4 | User Testing & Beta Launch | Public testnet, beta testing complete |
| Sprint 5 | Mainnet Preparation | Security review, multisig setup |
| Sprint 6 | Mainnet Deployment | Deployed to mainnet, production-ready |
| Sprint 7 | Public Launch | Launched, documented, monitored |

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

## 📅 Sprint 3.1: ENS Verification Security Fix

### ⚠️ Security Issue Identified

**Problem:** The current contract accepts any ENS name as a parameter without verification. This means:
- User Bob can mint with ENS name "alice.eth" even though he doesn't own it
- This is identity fraud and breaks trust in the platform

**Solution:** Hybrid signature verification approach
- Backend API signs verified ENS names
- Smart contract verifies signatures using ECDSA
- Gas-efficient (~3,000 gas for signature verification)
- Works well on basic shared OVH hosting

### Part 1: Backend Implementation

#### Simple Signature Service

- [ ] Create `/backend/api` directory for Express.js server
- [ ] Install dependencies:
  ```bash
  cd backend/api
  npm init -y
  npm install express ethers cors dotenv express-rate-limit
  ```

- [ ] Create `.env` for backend:
  ```
  SIGNER_PRIVATE_KEY=0x... # Wallet that will sign ENS verifications
  PORT=3001
  FRONTEND_URL=http://localhost:3000
  ```

- [ ] Implement `server.js`:
  ```javascript
  const express = require('express');
  const { ethers } = require('ethers');
  const cors = require('cors');
  const rateLimit = require('express-rate-limit');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Rate limiting: 10 requests per hour per IP
  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many signature requests'
  });

  // Signer wallet
  const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);

  app.post('/api/ens-signature', limiter, async (req, res) => {
    try {
      const { address, ensName, nonce } = req.body;

      // Validation
      if (!ethers.utils.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid address' });
      }

      // Expiry: 5 minutes from now
      const expiry = Math.floor(Date.now() / 1000) + 300;

      // Create hash (must match contract logic exactly)
      const hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'string', 'uint256', 'uint256'],
          [address, ensName || '', nonce, expiry]
        )
      );

      // Sign the hash
      const signature = await signer.signMessage(ethers.utils.arrayify(hash));

      res.json({
        signature,
        expiry,
        ensName: ensName || '',
        signerAddress: signer.address
      });
    } catch (error) {
      console.error('Signature error:', error);
      res.status(500).json({ error: 'Failed to create signature' });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Signature service running on port ${PORT}`);
    console.log(`Signer address: ${signer.address}`);
  });
  ```

- [ ] Test locally:
  ```bash
  node server.js
  curl -X POST http://localhost:3001/api/ens-signature \
    -H "Content-Type: application/json" \
    -d '{"address":"0x1234...","ensName":"test.eth","nonce":0}'
  ```

- [ ] Deploy to OVH shared hosting
- [ ] Update frontend environment variables with backend URL

**Part 1 Deliverable:** Backend signing service deployed and tested

---

### Part 2: Smart Contract Upgrade

#### Update Contract Code

- [ ] Add OpenZeppelin ECDSA import:
  ```solidity
  import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
  import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
  ```

- [ ] Add state variables to `OnChainJournal.sol`:
  ```solidity
  using ECDSA for bytes32;
  using MessageHashUtils for bytes32;

  address private trustedSigner;
  mapping(address => uint256) public nonces;
  ```

- [ ] Update `JournalEntry` struct:
  ```solidity
  struct JournalEntry {
      string text;
      string mood;
      string ensName;
      bool ensVerified;  // ← New field
      address minter;    // ← New field for truncated address
      uint256 blockNumber;
      uint256 originChainId;
  }
  ```

- [ ] Update `initialize` function:
  ```solidity
  function initialize(
      string memory _color1,
      string memory _color2,
      address _trustedSigner  // ← New parameter
  ) public initializer {
      __ERC721_init("On-Chain Journal", "JOURNAL");
      __UUPSUpgradeable_init();
      __Ownable_init(msg.sender);

      color1 = _color1;
      color2 = _color2;
      trustedSigner = _trustedSigner;
  }
  ```

- [ ] Update `mintEntry` function:
  ```solidity
  function mintEntry(
      string memory _text,
      string memory _mood,
      string memory _ensName,
      bytes memory _signature,
      uint256 _nonce,
      uint256 _expiry
  ) public returns (uint256) {
      // Existing validations
      require(bytes(_text).length > 0 && bytes(_text).length <= 400, "Invalid text length");
      require(bytes(_mood).length > 0 && bytes(_mood).length <= 64, "Invalid mood");

      // Signature verification
      require(block.timestamp <= _expiry, "Signature expired");
      require(_nonce == nonces[msg.sender], "Invalid nonce");

      // Recreate the hash (must match backend exactly)
      bytes32 messageHash = keccak256(
          abi.encode(msg.sender, _ensName, _nonce, _expiry)
      );

      // Verify signature
      address recoveredSigner = messageHash.toEthSignedMessageHash().recover(_signature);
      require(recoveredSigner == trustedSigner, "Invalid signature");

      // Increment nonce to prevent replay attacks
      nonces[msg.sender]++;

      // Mint NFT
      uint256 tokenId = _nextTokenId++;
      _safeMint(msg.sender, tokenId);

      // Store entry data with verification status
      journalEntries[tokenId] = JournalEntry({
          text: _text,
          mood: _mood,
          ensName: _ensName,
          ensVerified: bytes(_ensName).length > 0,  // If ENS provided, it's verified
          minter: msg.sender,
          blockNumber: block.number,
          originChainId: block.chainid
      });

      emit EntryMinted(msg.sender, tokenId, block.chainid);
      return tokenId;
  }
  ```

- [ ] Add address truncation helper:
  ```solidity
  function _truncateAddress(address addr) internal pure returns (string memory) {
      bytes memory addrBytes = abi.encodePacked(addr);
      bytes memory result = new bytes(13); // "0x1234...5678"

      result[0] = '0';
      result[1] = 'x';

      // First 4 chars after 0x
      for (uint i = 0; i < 4; i++) {
          result[i + 2] = _toHexChar(uint8(addrBytes[i]) / 16);
      }

      result[6] = '.';
      result[7] = '.';
      result[8] = '.';

      // Last 4 chars
      for (uint i = 0; i < 4; i++) {
          result[i + 9] = _toHexChar(uint8(addrBytes[16 + i]) / 16);
      }

      return string(result);
  }

  function _toHexChar(uint8 value) internal pure returns (bytes1) {
      if (value < 10) return bytes1(uint8(48 + value)); // '0'-'9'
      return bytes1(uint8(87 + value)); // 'a'-'f'
  }
  ```

- [ ] Update SVG generation to show verified/unverified/address:
  ```solidity
  function _generateIdentityDisplay(JournalEntry memory entry) internal pure returns (string memory) {
      if (bytes(entry.ensName).length > 0) {
          if (entry.ensVerified) {
              // Verified ENS: show with checkmark
              return string(abi.encodePacked(
                  '<tspan fill="', color1, '">\\u2713</tspan> ',
                  _escapeXML(entry.ensName)
              ));
          } else {
              // Unverified ENS: show grayed out
              return string(abi.encodePacked(
                  '<tspan opacity="0.5">', _escapeXML(entry.ensName), '</tspan>'
              ));
          }
      } else {
          // No ENS: show truncated address
          return _truncateAddress(entry.minter);
      }
  }
  ```

#### Testing

- [ ] Update all 18 existing tests to include signature parameters
- [ ] Add new test file `test/SignatureVerification.t.sol`:
  ```solidity
  // Test valid signature
  // Test invalid signature
  // Test expired signature
  // Test wrong nonce
  // Test nonce increment
  // Test replay attack prevention
  ```

- [ ] Add SVG display tests:
  ```solidity
  // Test verified ENS display (with checkmark)
  // Test unverified ENS display (grayed)
  // Test truncated address display
  ```

- [ ] Run all tests:
  ```bash
  forge test -vvv
  ```

**Part 2 Deliverable:** Updated contract with signature verification passing all tests

---

### Part 3: Deployment & Upgrade

#### Deploy New Implementation

- [ ] Create new signer wallet for testnet:
  ```bash
  cast wallet new
  # Save address and private key
  ```

- [ ] Fund signer wallet with small amount of testnet ETH
- [ ] Update backend `.env` with signer private key

- [ ] Deploy new implementation to Base Sepolia:
  ```bash
  forge script script/UpgradeToV2.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --broadcast \
    --verify
  ```

- [ ] Deploy new implementation to Bob Testnet (same process)

#### Upgrade Proxies

- [ ] Upgrade Base Sepolia proxy:
  ```bash
  cast send $PROXY_ADDRESS \
    "upgradeToAndCall(address,bytes)" \
    $NEW_IMPLEMENTATION \
    "0x" \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY
  ```

- [ ] Upgrade Bob Testnet proxy (same process)

- [ ] Verify upgrades on block explorers

#### Post-Upgrade Testing

- [ ] Test minting with verified ENS name
- [ ] Test minting with no ENS (truncated address)
- [ ] Verify SVG displays correctly with checkmark
- [ ] Verify signature expiry works
- [ ] Test nonce increment

**Part 3 Deliverable:** Upgraded contracts deployed to both testnets

---

### Part 4: Frontend Integration

#### Update Contract Config

- [ ] Regenerate contract ABI:
  ```bash
  forge build
  cat out/OnChainJournal.sol/OnChainJournal.json | jq .abi > ../src/contracts/OnChainJournal.abi.json
  ```

- [ ] Update TypeScript types for new function signature

#### Update Minting Hook

- [ ] Add backend API client:
  ```typescript
  // src/lib/signatureApi.ts
  export async function getENSSignature(
    address: string,
    ensName: string,
    nonce: number
  ): Promise<{
    signature: string;
    expiry: number;
    ensName: string;
  }> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ens-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, ensName, nonce })
    });

    if (!response.ok) throw new Error('Failed to get signature');
    return response.json();
  }
  ```

- [ ] Update `useMintJournalEntry.ts`:
  ```typescript
  // 1. Fetch current nonce from contract
  const { data: nonce } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'nonces',
    args: [userAddress]
  });

  // 2. Get signature from backend
  const { signature, expiry } = await getENSSignature(
    userAddress,
    ensName || '',
    nonce
  );

  // 3. Call contract with signature
  const { write: mint } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'mintEntry',
    args: [text, mood, ensName || '', signature, nonce, expiry]
  });
  ```

#### Update Local SVG Generation

- [ ] Update `src/utils/generateLocalSVG.ts` to match new display logic:
  ```typescript
  function generateIdentityDisplay(
    ensName: string,
    ensVerified: boolean,
    minterAddress: string
  ): string {
    if (ensName) {
      if (ensVerified) {
        return `✓ ${ensName}`;
      } else {
        return ensName; // Show grayed in CSS
      }
    } else {
      return truncateAddress(minterAddress);
    }
  }

  function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  ```

- [ ] Update MintPreview to show verification status
- [ ] Update Gallery SVG rendering

#### Testing

- [ ] Test complete flow:
  1. User connects wallet
  2. Writes thought
  3. Clicks mint
  4. Frontend requests signature from backend
  5. Frontend calls contract with signature
  6. NFT minted with verified ENS
  7. Gallery shows SVG with checkmark

- [ ] Test error cases:
  - Backend offline (show helpful error)
  - Signature expired (retry)
  - Rate limit exceeded (show message)

**Part 4 Deliverable:** Complete minting flow with ENS verification working

---

### Part 5: Documentation

#### Update Documentation

- [ ] Add section to `CONTRACT_GUIDE.md`:
  - Architecture decision (why signature verification)
  - Backend setup instructions
  - Security considerations
  - Gas cost comparison

- [ ] Update `DEPLOYMENT_CHECKLIST.md`:
  - Add backend deployment steps
  - Add signer wallet setup
  - Add signature testing steps

- [ ] Create `BACKEND_SETUP.md`:
  - OVH hosting setup
  - Environment variables
  - Rate limiting configuration
  - Monitoring and logs

- [ ] Update `README.md` with new architecture diagram

**Part 5 Deliverable:** Complete documentation of ENS verification system

---

## Sprint 3.1 Success Criteria

- [x] Backend signature service deployed and accessible
- [x] Smart contract upgraded with signature verification
- [x] All tests passing (original 18 + new signature tests)
- [x] Frontend integrated with backend and contract
- [x] End-to-end minting working with verified ENS
- [x] Truncated address display working for users without ENS
- [x] Documentation complete
- [x] Zero identity fraud possible

---

## 📅 Sprint 4: User Testing & Beta Launch

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
