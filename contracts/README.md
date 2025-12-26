# MintMyMood Smart Contracts

This directory contains the Solidity smart contracts for MintMyMood, built using [Foundry](https://book.getfoundry.sh/).

## 🔑 Key Components

- **`OnChainJournal.sol`**: The core logic. An upgradeable (UUPS) ERC721 token that stores user thoughts and generates SVG art on-chain.

## ⚡ Quick Commands

```bash
# Compile
forge build

# Run All Tests
forge test

# Run Specific Test (Verbose)
forge test --match-test testMintEntry -vvv

# Deploy (Simulate)
forge script script/Deploy.s.sol
```

## 📚 Documentation
- **[CONTRACT_GUIDE.md](../docs/CONTRACT_GUIDE.md)**: Detailed architecture and function reference.
- **[DEPLOYMENT.md](../docs/DEPLOYMENT.md)**: Step-by-step deployment guide for testnet/mainnet.

