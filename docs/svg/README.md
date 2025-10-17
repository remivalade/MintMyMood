# SVG Design Reference

This directory contains reference SVG designs for on-chain journal NFTs. These designs are the source of truth for the visual appearance of minted journal entries.

## Purpose

These SVG files serve as:
- **Design References** - Visual mockups for the final on-chain NFT appearance
- **Implementation Guide** - Specifications for smart contract SVG generation
- **Testing Assets** - Reference files for comparing on-chain output

## Chain-Specific Designs

### Base (BASE.svg)
- **Primary Color:** `#0000ff` (Base blue background)
- **Gradient Color 1:** `#3c8aff` (lighter blue)
- **Gradient Color 2:** `#f9f7f1ff` (cream overlay)
- **Gradient Transform:** `rotate(-202, 0.5, 0.5)` and `rotate(202, 0.5, 0.5)`
- **Block Number Example:** #660125
- **Chain Display:** "BASE"

### Bob (BOB.svg)
- **Primary Color:** `#f25d00` (Bob orange background)
- **Gradient Color 1:** `#ff9500` (lighter orange)
- **Gradient Color 2:** `#f9f7f1ff` (cream overlay)
- **Gradient Transform:** `rotate(-202, 0.5, 0.5)` and `rotate(202, 0.5, 0.5)`
- **Block Number Example:** #170429
- **Chain Display:** "BOB"

## Required SVG Elements

All on-chain SVGs must include these elements:

1. **Mood Emoji** (top right, 70px font-size)
   - Displays the user's selected mood
   - Position: `x="450" y="90"`

2. **Block Number** (top left with typewriter animation)
   - Label: "minted on block" (14px, 70% opacity)
   - Number: Block number at mint time (16px, 80% opacity)
   - Animated typewriter effect (4s loop)

3. **Journal Text** (center area)
   - Max 400 characters
   - Georgia serif font, 18px
   - White color with text shadow
   - Wrapped in foreignObject for proper line breaks
   - Centered vertically and horizontally

4. **Wallet Address or ENS Name** (below text)
   - Format: "0x1A2b...dE3F" or "vitalik.eth"
   - Monospace font, 14px, 80% opacity
   - Position: Below journal text

5. **Chain Name** (bottom left)
   - "BASE" or "BOB"
   - Monospace font, 16px, 70% opacity
   - Position: `x="35" y="465"`

6. **Branding** (bottom right)
   - "MintMyMood"
   - Monospace font, 16px, 70% opacity
   - Position: `x="465" y="465"` (right-aligned)

## Advanced SVG Features

### Grain Texture Filter
- **Type:** `feTurbulence` with fractal noise
- **Base Frequency:** 0.63
- **Octaves:** 2
- **Blend Mode:** soft-light at 66% opacity
- Creates subtle paper-like texture

### Animations
- **Typewriter Effect:** CSS @keyframes animation on block number
  - 4-second loop
  - Steps(8) for typewriter effect
  - Reveals and hides block number

### Drop Shadow
- **Offset:** dx="4" dy="4"
- **Blur:** stdDeviation="5"
- **Color:** Black at 40% opacity
- Applied to card background

### Gradients
- **Linear Gradients:** Two overlapping gradients create depth
- **Mix Blend Mode:** Soft-light for subtle color mixing
- **Opacity Layers:** Multiple rects with varying opacity

## Smart Contract Implementation

These designs are implemented in `contracts/src/OnChainJournal.sol`:

### Key Functions
- `generateSVG(JournalEntry memory entry)` - Main SVG generation
- `_generateSVGPart1()` - Defs, gradients, filters, background
- `_generateSVGPart2()` - Content layer with text and metadata
- `_generateGradients()` - Chain-specific gradient definitions
- `_generateFilter()` - Grain texture filter
- `_formatAddress()` - ENS name or formatted address

### Chain Configuration
Each deployment initializes with chain-specific colors:

```solidity
// Base deployment
initialize("#0000ff", "#3c8aff", "BASE", owner);

// Bob deployment
initialize("#f25d00", "#ff9500", "BOB", owner);
```

## Design Specifications

### Dimensions
- **Viewbox:** `0 0 500 500`
- **Card Size:** 484x484px (with 8px margin)
- **Border Radius:** 15px
- **Text Area:** 400x334px (foreignObject)

### Typography
- **Mood:** Sans-serif, 70px
- **Block Label:** Monospace, 14px
- **Block Number:** Monospace, 16px
- **Journal Text:** Georgia serif, 18px, line-height 1.5
- **Address/ENS:** Monospace, 14px
- **Chain/Brand:** Monospace, 16px

### Colors
- **Background:** Chain-specific (blue or orange)
- **Text:** White with opacity variations
- **Text Shadow:** `rgba(0,0,0,0.4)` and `rgba(255,255,255,0.15)`
- **Gradients:** Cream overlay for depth

## Usage Notes

### For Designers
- Use these SVG files as reference when designing for new chains
- Maintain consistent layout and element positioning
- Only change background colors and chain name
- Test with various text lengths (short, medium, 400 chars)

### For Developers
- Reference these files when implementing contract SVG generation
- Ensure on-chain output matches these designs exactly
- Test edge cases (special characters, emoji, max length)
- Use `forge test --match-test test_GenerateSVG -vvvv` to inspect output

### For Testing
1. Mint test NFT on testnet
2. View SVG in block explorer
3. Compare with reference SVG in this directory
4. Verify all elements render correctly
5. Test animations in supported viewers

## Adding New Chains

To add a new chain:

1. **Create Reference SVG:**
   - Copy BASE.svg or BOB.svg
   - Update filename: `[CHAIN_NAME].svg`
   - Change gradient colors (3 instances)
   - Update chain name in bottom left
   - Update block number example

2. **Update Smart Contract:**
   - Add chain colors to deployment script
   - Deploy with: `initialize(color1, color2, chainName, owner)`
   - Test SVG generation

3. **Update Documentation:**
   - Add chain to this README.md
   - Update CONTRACT_GUIDE.md
   - Update DEPLOYMENT_CHECKLIST_V1.md

## Technical Reference

For complete technical details, see:
- `docs/CONTRACT_GUIDE.md` - Contract deployment and architecture
- `contracts/src/OnChainJournal.sol` - Full implementation
- `contracts/test/OnChainJournal.t.sol` - SVG generation tests

## Questions?

If you need clarification on the SVG design specifications or implementation, refer to:
- This README for design specs
- `CONTRACT_GUIDE.md` for technical implementation
- PRD (`docs/MintMyMood-prd.md`) for product requirements
