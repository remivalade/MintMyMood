# SVG Generation & Design

This directory contains reference SVGs used for the on-chain NFT generation. 

## Design Philosophy

**Skeuomorphic Minimalism**: We aim for a clean digital interface with subtle textures that evoke physical journaling.

- **Fonts**: `Lora` (serif) for content, `Inter` (sans-serif) for metadata.
- **Layout**: 8pt grid system.

## How it Works

The SVGs here (`BASE.svg`, `BOB.svg`, etc.) are **references**. actual generation happens in two places which MUST be kept in sync:

1. **Smart Contracts**: `contracts/src/OnChainJournal.sol` generates the official NFT image string on-chain.
2. **Frontend Preview**: `src/utils/generateSVG.ts` generates a pixel-perfect preview for the user before minting.

> [!WARNING]
> If you change the design in one place, you MUST update the other.

## Chain Specific Designs

Each chain has a unique color identity:
- **Base**: Blue gradients.
- **Bob**: Orange gradients.
- **Ink**: Purple gradients.
