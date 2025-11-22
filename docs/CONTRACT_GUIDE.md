# Smart Contract Guide - On-Chain Journal V1

This guide covers the deployment, testing, and management of the On-Chain Journal smart contracts.

## Table of Contents

- [Overview](#overview)
- [V1 vs V2 Roadmap](#v1-vs-v2-roadmap)
- [Architecture](#architecture)
- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Upgrading](#upgrading)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

The On-Chain Journal contract is a UUPS upgradeable ERC721 NFT contract that stores journal entries entirely on-chain as SVG images. Each deployment is chain-specific with hardcoded gradient colors.

### Key Features - V2.4.0

- **UUPS Upgradeable**: Allows contract logic upgrades while preserving state
- **On-chain SVG**: Fully on-chain (no IPFS or external storage)
- **Chain-specific gradients**: Each chain deployment has unique colors (Base, Bob, & Ink)
- **Advanced SVG Features**:
  - Grain texture with feTurbulence filter

  - Drop shadows and blend modes
  - ForeignObject for text wrapping
- **Input validation**: 400 byte text limit, 64 byte mood limit
- **XML escaping**: Security against injection attacks
- **Gas efficient**: Optimized gas costs (~170k for basic mint, ~30% reduction from V2.3.0)

### What's NOT in V1

- ❌ Cross-chain NFT transfers (LayerZero ONFT)
- ❌ NFT bridging between Base, Bob, and Ink
- ✅ These features planned for V2 via UUPS upgrade

---

## V1 vs V2 Roadmap

### V1 (Current) - Single Chain NFTs
**Launch Target:** Testnet Week 1, Mainnet Week 4

- ✅ UUPS upgradeable ERC721
- ✅ On-chain SVG generation
- ✅ Mint on Base (independent)
- ✅ Mint on Bob (independent)
- ✅ Mint on Ink (independent)
- ✅ Chain-specific colors
- ✅ Full metadata on-chain
- ❌ No cross-chain transfers yet

**User Experience:**
- Users mint journal entries on either Base or Bob
- Each chain is independent
- NFTs stay on the chain where minted

### V2 (Future) - Omnichain NFTs
**Launch Target:** 4-6 weeks after V1

- ✅ Everything from V1
- ✅ LayerZero V2 ONFT integration
- ✅ Bridge NFTs between Base ↔ Bob ↔ Ink
- ✅ Preserve metadata cross-chain
- ✅ UUPS upgrade (no redeployment needed!)

**User Experience:**
- Mint on Base, bridge to Bob (or vice versa)
- Same token ID across chains
- Unified cross-chain gallery

### Contract Addresses - V2.4.0

| Network | Chain ID | Proxy Address | Implementation |
|---------|----------|---------------|----------------|
| Base Sepolia | 84532 | 0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 | 0x64C9A8b7c432A960898cdB3bB45204287F59B814 |
| Bob Testnet | 808813 | 0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 | 0xB4e9f62cc1899DB3266099F65CeEcE8Cc267f3D2 |
| Ink Sepolia | 763373 | 0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 | TBD |
| Base Mainnet | 8453 | TBD | TBD |
| Bob Mainnet | 60808 | TBD | TBD |
| Ink Mainnet | TBD | TBD | TBD |

---

## Architecture

### UUPS Proxy Pattern

```
┌─────────────────┐
│   User/Frontend │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ERC1967Proxy  │  ← Stores state & delegates calls
│   (Proxy)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OnChainJournal  │  ← Contains logic
│ (Implementation)│
└─────────────────┘
```

**Why UUPS?**
- Cheaper upgrades than Transparent Proxy
- Upgrade logic in implementation (not proxy)
- More gas efficient for users
- Owner-controlled upgrades

### Contract Structure

```solidity
OnChainJournal (UUPS Upgradeable)
├── ERC721Upgradeable (NFT functionality)
├── OwnableUpgradeable (Access control)
├── UUPSUpgradeable (Upgrade mechanism)
└── Custom logic
    ├── mintEntry(text, mood) - Mint new journal NFT (simplified)
    ├── generateSVG(entry) - Create on-chain SVG
    ├── tokenURI(tokenId) - Return base64-encoded metadata JSON
    ├── _generateSVGPart1() - SVG defs, gradients, filters
    ├── _generateSVGPart2() - SVG content layer
    ├── _generateGradients() - Chain-specific gradient definitions
    ├── _generateFilter() - Grain texture filter
    └── _escapeString() - XML security
```

### State Variables

```solidity
uint256 private _nextTokenId;           // Token counter
string public color1;                   // Primary gradient color
string public color2;                   // Secondary gradient color
string public chainName;                // Chain identifier
mapping(uint256 => JournalEntry) private journalEntries;  // Entry data
```

### Data Structure

```solidity
struct JournalEntry {
    string text;            // Journal entry text (max 400 bytes)
    string mood;            // Mood emoji (max 64 bytes)
    uint256 timestamp;      // Block timestamp when minted
    uint256 blockNumber;    // Block number when minted
    address minter;         // Original minter address
    uint256 originChainId;  // Chain where minted
}
```

### SVG Architecture

The contract generates SVGs entirely on-chain using string concatenation. This ensures the artwork is permanent and doesn't rely on external servers (IPFS/Arweave).

**Key Components:**
1.  **Backgrounds**:
    - **Base/Bob**: CSS radial gradients with a grain filter (`feTurbulence`) for texture.
    - **Ink**: SVG path-based wave pattern.
2.  **Typography**:
    - **Base/Bob**: Serif font (`Georgia`) for a classic journal feel.
    - **Ink**: Sans-serif font (`Arial`) for a modern look.

4.  **Text Wrapping**:
    - Native SVG `<tspan>` elements with calculated `dy` offsets (no `foreignObject` for better compatibility).

### Chain Styles

| Chain | Theme | Background | Font |
|-------|-------|------------|------|
| **Base** | Blue | Gradient + Grain | Serif |
| **Bob** | Orange | Gradient + Grain | Serif |
| **Ink** | Purple | Wave Pattern | Sans-serif |

---

## Setup

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Node.js 18+ (for frontend integration)
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd MintMyMood/contracts
   ```

2. **Install dependencies**
   ```bash
   forge install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Required environment variables**
   ```bash
   # Deployer private key (NEVER commit this!)
   PRIVATE_KEY=your_private_key_here

   # RPC endpoints
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BOB_SEPOLIA_RPC_URL=https://testnet.rpc.gobob.xyz
   INK_SEPOLIA_RPC_URL=https://rpc-gel-sepolia.inkonchain.com

   # API keys for verification
   BASESCAN_API_KEY=your_basescan_api_key
   ```

---

## Development

### Build Contracts

```bash
forge build
```

Expected output:
```
Compiling 53 files with Solc 0.8.24
Solc 0.8.24 finished in 3.84s
Compiler run successful!
```

### Format Code

```bash
forge fmt
```

### Check Contract Size

```bash
forge build --sizes
```

### Gas Snapshots

```bash
forge snapshot
```

---

## Testing

### Run All Tests

```bash
forge test
```

### Run with Verbosity

```bash
# -v: Show test names
# -vv: Show logs
# -vvv: Show stack traces
# -vvvv: Show setup traces
# -vvvvv: Show execution traces

forge test -vv
```

### Run Specific Test

```bash
forge test --match-test test_MintEntry -vv
```

### Run Test Suite

```bash
forge test --match-contract OnChainJournalTest
```

### Gas Report

```bash
forge test --gas-report
```

### Test Coverage

```bash
forge coverage
```

### Current Test Suite

```
✅ 18 Tests Passing:

Initialization (3 tests)
├── test_Initialize
├── test_CannotReinitialize

Minting (4 tests)
├── test_MintEntry
├── test_MintMultipleEntries
├── test_MultipleusersMinting

Validation (5 tests)
├── test_RevertWhen_TextTooLong
├── test_RevertWhen_MoodTooLong
├── test_MintWith_MaxTextLength
├── test_MintWith_MaxMoodLength

Metadata & SVG (3 tests)
├── test_TokenURI
├── test_GenerateSVG
├── test_SVGEscaping

Admin (3 tests)
├── test_UpdateColors
├── test_RevertWhen_NonOwnerUpdatesColors
├── test_Version

Upgradeability (2 tests)
├── test_UpgradeContract
└── test_RevertWhen_NonOwnerUpgrades
```

---

## Deployment

### Deploy to Anvil (Local Testing)

1. **Start Anvil**
   ```bash
   anvil
   ```

2. **Deploy contract** (in a new terminal)
   ```bash
   forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
     --rpc-url http://127.0.0.1:8545 \
     --broadcast
   ```

3. **Use Anvil's default account**
   ```bash
   # Default Anvil account #0
   PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

### Deploy to Base Sepolia

```bash
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url base_sepolia \
  --broadcast \
  --verify
```

### Deploy to Bob Sepolia

```bash
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url bob_sepolia \
  --broadcast
```

### Deploy to Ink Sepolia

```bash
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url ink_sepolia \
  --broadcast
```

### Deploy to Mainnet

⚠️ **PRODUCTION DEPLOYMENT - PROCEED WITH CAUTION**

1. **Audit the contract** (recommended)
2. **Test on testnet thoroughly**
3. **Prepare multisig for ownership** (Gnosis Safe)
4. **Deploy**

```bash
# Base Mainnet
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url base \
  --broadcast \
  --verify

# Bob Mainnet
forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal \
  --rpc-url bob \
  --broadcast
```

5. **Transfer ownership to multisig**
   ```bash
   cast send <PROXY_ADDRESS> \
     "transferOwnership(address)" <MULTISIG_ADDRESS> \
     --rpc-url base \
     --private-key $PRIVATE_KEY
   ```

### Verify Contract on Etherscan

If `--verify` didn't work during deployment:

```bash
forge verify-contract <PROXY_ADDRESS> \
  src/OnChainJournal.sol:OnChainJournal \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY
```

---

## Upgrading

### When to Upgrade

- Critical bug fixes
- Feature additions
- Gas optimizations
- Security improvements

### Upgrade Process

1. **Deploy new implementation**
   ```solidity
   // OnChainJournalV2.sol
   contract OnChainJournalV2 is OnChainJournal {
       // New features here
       function newFeature() public {
           // Implementation
       }
   }
   ```

2. **Test thoroughly**
   ```bash
   forge test --match-contract OnChainJournalV2Test
   ```

3. **Create upgrade script**
   ```solidity
   // script/UpgradeToV2_5_0.s.sol
   contract UpgradeToV2_5_0 is Script {
       function run() external {
           address proxy = vm.envAddress("PROXY_ADDRESS");
           // Deploy new implementation (compiled from updated source)
           OnChainJournal newImplementation = new OnChainJournal();

           vm.broadcast();
           OnChainJournal(proxy).upgradeToAndCall(address(newImplementation), "");
       }
   }
   ```

4. **Execute upgrade**

   **Prerequisites:**
   - Ensure your `.env` file has `PRIVATE_KEY` and the relevant RPC URLs set.
   - Ensure you have the correct `PROXY_ADDRESS` for the chain you are upgrading.

   **Base Sepolia:**
   ```bash
   PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 \
   forge script script/UpgradeToV2_5_0.s.sol:UpgradeToV2_5_0 \
     --rpc-url base_sepolia \
     --broadcast
   ```

   **Bob Testnet:**
   ```bash
   PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 \
   forge script script/UpgradeToV2_5_0.s.sol:UpgradeToV2_5_0 \
     --rpc-url bob_sepolia \
     --broadcast
   ```

   **Ink Sepolia:**
   ```bash
   PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 \
   forge script script/UpgradeToV2_5_0.s.sol:UpgradeToV2_5_0 \
     --rpc-url ink_sepolia \
     --broadcast
   ```

5. **Verify state persisted**
   ```bash
   cast call <PROXY_ADDRESS> "version()(string)" --rpc-url base_sepolia
   ```

### Upgrade Safety Checks

✅ **Always verify:**
- State variables remain in same order
- New variables added at the end
- No variables deleted
- No type changes
- Initializer not re-run

❌ **Never:**
- Change existing state variable order
- Delete state variables
- Change variable types
- Use `selfdestruct`
- Use `delegatecall` carelessly

---

## Security Considerations

### Input Validation

- Text limited to 400 bytes (prevents gas griefing)
- Mood limited to 64 bytes
- All user input XML-escaped

### Access Control

- Owner-only upgrade function
- Owner-only color update
- Ownable pattern for admin functions

### Upgrade Security

- UUPS pattern requires implementation to authorize upgrades
- Owner must call `upgradeToAndCall()`
- Cannot be upgraded by proxy storage manipulation

### XML/SVG Security

All user input is escaped:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&apos;`

### Recommendations

1. **Use multisig for production** (Gnosis Safe)
2. **Timelock upgrades** (24-48h delay)
3. **Monitor events** for unexpected behavior
4. **Rate limiting** (consider adding in V2)
5. **Emergency pause** (consider adding if needed)

---

## Troubleshooting

### Common Issues

#### "Out of gas" during minting

**Cause:** Large text or complex UTF-8 characters
**Solution:** Keep text under 400 bytes, use simple emojis

#### "Undeclared identifier" compile error

**Cause:** Wrong Solidity version
**Solution:** Ensure `solc_version = "0.8.24"` in `foundry.toml`

#### "Failed to verify" contract

**Cause:** Constructor arguments mismatch
**Solution:** Use proxy address, not implementation

#### Tests fail with "forge: command not found"

**Cause:** Foundry not in PATH
**Solution:**
```bash
source ~/.zshenv
# or
foundryup
```

### Debug Tips

1. **Check contract on block explorer**
   ```bash
   # Read public variables
   cast call <ADDRESS> "color1()(string)" --rpc-url base_sepolia
   cast call <ADDRESS> "owner()(address)" --rpc-url base_sepolia
   ```

2. **Inspect proxy storage**
   ```bash
   cast storage <PROXY_ADDRESS> --rpc-url base_sepolia
   ```

3. **Check implementation address**
   ```bash
   # EIP-1967 implementation slot
   cast storage <PROXY_ADDRESS> \
     0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
     --rpc-url base_sepolia
   ```

4. **Test SVG generation locally**
   ```bash
   forge test --match-test test_GenerateSVG -vvvv
   ```

### Getting Help

- **Foundry Issues**: https://github.com/foundry-rs/foundry/issues
- **OpenZeppelin Forum**: https://forum.openzeppelin.com/
- **Project Issues**: https://github.com/yourusername/mintmymood/issues

---

## Next Steps

### Sprint 3: Cross-Chain Integration

- Research LayerZero V2 OFT pattern for ERC721
- Implement cross-chain bridging
- Test cross-chain message passing
- Deploy LayerZero endpoints

### Sprint 4: Frontend Integration

- Connect wagmi to deployed contracts
- Implement real minting flow
- Add transaction status tracking
- Sync SVG preview with on-chain generation

### Future Enhancements

- Gasless minting (Gelato/Biconomy)
- Batch minting
- NFT burning/deletion
- Custom color palettes
- Rarity traits
- Social features (likes, comments)

---

## Contract Functions Reference

### Public Functions

```solidity
// Minting
function mintEntry(
    string memory _text,
    string memory _mood
) public returns (uint256)

// View functions
function tokenURI(uint256 tokenId) public view returns (string memory)
function generateSVG(JournalEntry memory entry) public view returns (string memory)
function version() external pure returns (string memory)

// Admin functions (owner only)
function updateColors(string memory _color1, string memory _color2) external
function updateChainName(string memory _newChainName) external
function upgradeToAndCall(address newImplementation, bytes memory data) external
```

### Constants

```solidity
uint256 public constant MAX_TEXT_LENGTH = 400;
uint256 public constant MAX_MOOD_LENGTH = 64;
```

---

**Last Updated:** November 14, 2025
**Contract Version:** V2.5.0
**Foundry Version:** 1.4.1-stable
