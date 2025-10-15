# Smart Contracts

This directory contains the on-chain journal smart contracts.

## OnChainJournal.sol

The main ERC721 contract for minting journal entries as on-chain SVG NFTs.

### Deployment Strategy

One contract instance per chain, each with chain-specific gradient colors hardcoded.

See `docs/CONTRACT_GUIDE.md` for detailed deployment instructions.
