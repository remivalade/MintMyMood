# Bob Testnet Manual Contract Verification Guide

Due to TLS certificate issues with the Bob Testnet explorer API, manual verification through the browser is required.

## Contract Details

**Implementation Address**: `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012`
**Explorer URL**: https://bob-sepolia.explorer.gobob.xyz/address/0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012
**Status**: ✅ VERIFIED!

## Verification Steps

1. **Navigate to the contract page**:
   - Go to: https://bob-sepolia.explorer.gobob.xyz/address/0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012
   - **UPDATE**: Contract is now verified! ✅
   - Click on the "Code" tab
   - Click "Verify & Publish" button

2. **Fill in Contract Details**:
   - **Contract Address**: `0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012`
   - **Contract Name**: `OnChainJournal`
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: `v0.8.24+commit.e11b9ed9`
   - **Open Source License Type**: MIT

3. **Optimization Settings**:
   - **Optimization**: Yes (Enabled)
   - **Optimizer Runs**: `200`
   - **Via IR**: Yes (Enabled)

4. **Constructor Arguments (ABI-encoded)**:
   ```
   (empty - no constructor arguments, uses initializer pattern)
   ```

5. **Contract Source Code**:
   - Use the flattened contract file: `OnChainJournal_flat.sol`
   - Location: `/Users/remi/Documents/GitHub.nosync/MintMyMood/contracts/OnChainJournal_flat.sol`
   - Copy the entire contents of this file into the verification form

## Compiler Settings (Advanced)

If the verification form has advanced options:

```json
{
  "language": "Solidity",
  "sources": {
    "src/OnChainJournal.sol": {
      "content": "(see flattened file)"
    }
  },
  "settings": {
    "optimizer": {
      "enabled": true,
      "runs": 200
    },
    "viaIR": true,
    "evmVersion": "paris",
    "outputSelection": {
      "*": {
        "*": [
          "evm.bytecode",
          "evm.deployedBytecode",
          "abi"
        ]
      }
    }
  }
}
```

## Alternative: Use Standard JSON Input

If the explorer supports Standard JSON Input format, use:

```bash
forge verify-contract 0xfdDDdb3E4ED11e767E6C2e0927bD783Fa0751012 \
  src/OnChainJournal.sol:OnChainJournal \
  --chain bob-sepolia \
  --verifier blockscout \
  --verifier-url https://bob-sepolia.explorer.gobob.xyz/api \
  --watch
```

Note: This may fail due to TLS issues, but worth trying.

## Verification Information

**Contract Version**: V2.3.0
**Deployment Date**: October 21, 2025
**Deployer**: `0x1319938D4D9A1596937eF136905bEaFF3Ac0c753`

**Key Features**:
- UUPS Upgradeable Pattern
- ERC721 NFT
- On-chain SVG generation
- ENS signature verification
- Chain-specific gradients (Bob: Orange #FF6B35 → #F7931E)

## Troubleshooting

### If verification fails:

1. **Check compiler version exactly matches**: `v0.8.24+commit.e11b9ed9`
2. **Ensure Via IR is enabled**: This is critical for matching bytecode
3. **Verify optimizer runs**: Must be exactly `200`
4. **Check for extra whitespace**: Copy-paste errors can cause mismatches

### If the explorer shows bytecode mismatch:

The contract is deployed and functional - verification is cosmetic only. Users can still:
- View contract transactions
- Call read functions
- Send transactions to the contract
- View NFT metadata

## Manual Verification Not Working?

If the Bob explorer continues to have issues, the contract remains **fully functional** without verification. The contract is:
- ✅ Deployed at the correct address
- ✅ Tested and working (see test mints)
- ✅ Upgradeable via UUPS
- ✅ Same code as Base Sepolia (which IS verified)

You can reference the verified Base Sepolia implementation for source code:
https://sepolia.basescan.org/address/0x95a7BbfFBffb2D1e4b73B8F8A9435CE48dE5b47A

## Files Needed

1. **Flattened Source**: `OnChainJournal_flat.sol` (already generated)
2. **ABI**: Available in `src/contracts/OnChainJournal.abi.json`
3. **Bytecode**: Can be retrieved from explorer or deployment artifacts

---

**Note**: The previous Bob explorer URL (`testnet-explorer.gobob.xyz`) had TLS certificate issues. The correct URL is `bob-sepolia.explorer.gobob.xyz`.
**Impact**: Low - Contract is functional, verification is for code transparency only
