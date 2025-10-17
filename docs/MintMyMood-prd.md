# MintMyMood - Product Requirements Document

**Version:** 1.0 - V1 Launch (Base & Bob)
**Last Updated:** October 17, 2025
**Target:** Ship V1 in 4 weeks, V2 omnichain in 8-10 weeks

---

## 1. Core Concept

**What:** A minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs - also known as "The On-Chain Journal."

**Key Innovation:** Thoughts are ephemeral by default (auto-delete after 7 days), but can be made permanent forever by minting as NFTs. This creates meaningful, intentional minting.

**Target:** Crypto-native users who already have wallets and value digital permanence.

---

## 1.5. V1 vs V2 Roadmap

### V1: Base & Bob Launch (Current Scope)
**Timeline:** 4 weeks to testnet, 6 weeks to mainnet

**Features:**
- ✅ UUPS Upgradeable ERC721 contracts
- ✅ On-chain SVG generation with chain-specific gradients
- ✅ Independent deployments on Base and Bob
- ✅ Mint journal entries on either chain
- ✅ Full metadata stored on-chain (no IPFS)
- ✅ Supabase backend for ephemeral thoughts
- ❌ NO cross-chain bridging (yet)

**User Experience:**
- Users choose Base or Bob when minting
- NFTs stay on the chain where minted
- Separate galleries for each chain
- Simple, focused, and fast to ship

### V2: Omnichain Expansion (Future)
**Timeline:** 8-10 weeks after V1 launch

**Why V2 for Omnichain:**
Due to the technical complexity of combining UUPS upgradeability with LayerZero V2 ONFT functionality, we've strategically decided to launch V1 with single-chain deployments first. This allows us to:
1. Ship faster and gather user feedback
2. Properly test and audit core functionality
3. Research and implement LayerZero ONFT integration correctly
4. Upgrade contracts via UUPS (no redeployment needed!)

**V2 Features (via UUPS Upgrade):**
- ✅ LayerZero V2 ONFT integration
- ✅ Cross-chain NFT bridging (Base ↔ Bob ↔ other chains)
- ✅ Unified cross-chain gallery
- ✅ Origin chain tracking and display
- ✅ Same token ID across chains
- ✅ Expansion to Ink, HyperEVM, and other chains

**User Experience:**
- Mint on any chain
- Bridge NFTs between chains seamlessly
- View all NFTs in one unified gallery
- Origin chain always visible via gradient color

---

## 2. Critical Design Decisions

### Ephemeral vs Permanent

**The Core Tension:**
- **Default:** Thoughts auto-delete after 7 days
- **Minting:** Makes thought permanent forever on-chain
- **Value Prop:** "Capture fleeting thoughts. Keep what matters."

**Timer Display:**
- Each entry shows countdown: "Deletes in 18 hours"
- Visual urgency (red as time runs low)
- After minting: Timer disappears, replaced by chain badge


### Storage Strategy (Simple & Cheap)

- PostgreSQL database (500MB, 2GB bandwidth)
- Built-in auth (but we use wallet)
- Simple REST API
- Cost: $0/month until scale



### Security - Realistic Approach

**V1 (Minimal):**
- Entries stored in Supabase (not encrypted)
- Only wallet owner can read their entries (database row-level security)
- Good enough for non-sensitive journaling
- **No complex encryption in V1**

**Future (if needed):**
- Client-side encryption before sending to Supabase
- User manages encryption key
- More private, more complex

### NFT as SVG (No IPFS!)

**Smart Contract Approach:**
- Mint NFT with on-chain SVG metadata
- Full entry text in SVG (no external dependencies)
- Each chain has different color scheme

**SVG Elements**
- different background depending on blockchain,
- block id of the minted nft,
- mood (emoji),
- text (max 400 characters),
- beginning and end of the wallet address of minter OR ENS if we have it,
- Name of the blockchain
- MintMyMood.

**Advantages:**
- No IPFS needed ($0 cost)
- No external dependencies
- Fully on-chain (true permanence)
- Portable across wallets/explorers

### Gasless Sponsorship Strategy

To develop later but keep in mind.

1. **NFT Holder Gating:**
   - Check `balanceOf(userAddress, specificNFT)`
   - If > 0: sponsor gas
   - If = 0: user pays

2. **First Mint Per Chain:**
   - Track mints in database
   - If `userFirstMintOnChain(chain) == false`: sponsor
   - Else: user pays

3. **Time-Based:**
   - 1 gasless mint per week per user
   - Reset timer after 7 days

**Implementation:** Use Gelato or Biconomy relay (both support conditional sponsorship). Adding conditions later = change one function, no contract redeployment needed.

---

## 2.5. Design Guide: Skeuomorphic Minimalism

This guide establishes the visual identity for Onchain journal, blending a clean, modern interface with the warmth and intimacy of physical journaling. Our philosophy is **Skeuomorphic Minimalism**: we use subtle textures, shadows, and typography to evoke the feeling of paper without sacrificing digital clarity or performance.

### Color Palette

The palette is designed to be calming, readable, and premium.

- **Primary Background (Paper Cream):** `#F9F7F1`
  - Used for the main writing area and as a base for most screens.
- **Secondary Background (Light Ivory):** `#FFFEF0`
  - Used for secondary panels or cards to create subtle depth.
- **Primary Text (Soft Black):** `#2D2D2D`
  - For all body copy and primary headings. Avoids the harshness of pure black.
- **Secondary Text (Medium Gray):** `#5A5A5A`
  - For metadata, placeholders, and less important UI elements.
- **Accent (Leather Brown):** `#8B7355`
  - Used sparingly for key UI elements like selected states or important icons.
- **System - Error/Delete:** `#D9534F`
  - For delete buttons, error messages, and the urgent timer state.
- **System - Success:** `#5CB85C`
  - For success confirmations and positive feedback.

#### Chain Palette (For NFT Gradients & Badges)

These colors provide immediate visual identification for minted thoughts.

**V1 Chains:**
- **Base:** Blue (`#0052FF` solid)
- **Bob:** Orange Gradient (`#FF6B35` → `#F7931E`)

**V2 Future Chains:**
- **Ink:** Purple (`#5D3FD3`)
- **HyperEVM:** Green (`#00F0A0`)

### Typography

We use a dual-font system to distinguish between the user's content and the app's interface.

- **Content Font (Serif):** `Lora`
  - Used for all user-generated text within the journal entries. It's elegant, highly readable, and evokes a classic print feel.
- **UI Font (Sans-Serif):** `Inter` (or system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`)
  - Used for all buttons, labels, headings, and navigation. It's clean, neutral, and legible at all sizes.

#### Type Scale (8pt Grid)

- **H1 / Page Title:** `Inter`, 24px, Bold
- **H2 / Section Title:** `Inter`, 20px, Bold
- **Body / Journal Entry:** `Lora`, 18px, Regular (Line height: 1.6)
- **Button / UI Label:** `Inter`, 16px, Medium
- **Metadata / Caption:** `Inter`, 14px, Regular

### Layout & Spacing

- **Grid System:** Adhere to an 8pt grid for all spacing and component sizing to ensure consistency.
- **Whitespace:** Be generous with whitespace. It's our primary tool for creating a calm, focused, and uncluttered experience.
- **Content Area:** The main writing and reading interface should have a `max-width` of `680px` and be centered on the screen for optimal readability.
- **Responsive Breakpoints:**
  - **Mobile (< 768px):** Single-column layout.
  - **Desktop (> 768px):** Multi-column layout for the gallery, but the writing/reading view remains centered and constrained.

### Component Styling

- **Paper Texture:** Apply a very subtle, high-resolution paper or vellum texture as a background overlay at **3-5% opacity**. This adds tactile depth without distracting from the content.
- **Buttons:**
  - **Primary:** Solid background color (Accent or Chain-specific), `Inter` font, 4px corner radius. Add a subtle inner shadow on press.
  - **Secondary:** Ghost style (colored border, transparent background) or simple text-only button.
- **Cards (Gallery):**
  - Use the Secondary Background color (`#FFFEF0`).
  - Apply a soft, two-layer box shadow: `0 1px 3px rgba(45,45,45,0.08), 0 2px 8px rgba(45,45,45,0.12)`.
  - On hover/press, the shadow should deepen slightly to provide physical feedback.
- **NFT Preview:** The preview card must be a pixel-perfect representation of the final on-chain SVG, including the correct gradient and typography.

### Micro-interactions & Animation

- **Purpose:** Animations should be purposeful, providing feedback or guiding the user. They must be swift (200-300ms) and subtle.
- **Feedback:** Buttons should visually depress on click. Successful actions can trigger a gentle "pop" or a brief, elegant animation (like the confetti on mint success).
- **Transitions:** Page transitions should feel natural. For example, opening a thought from the gallery could feel like opening a page in a book.
- **Haptics:** On supported mobile devices, use gentle haptic feedback for key actions like starting a new entry, minting, or deleting a thought.

---

## 3. User Flows (Page-Based Navigation)

### Flow 1: First Time User

**Page 1: Writing Interface**
```
[Opens directly to editor]

Header: [Timer icon] "Your thought will disappear in 24h"
        [Connect Wallet] (top-right, small)

Editor: Large text area, cream background
        Placeholder: "What's on your mind?"
        Auto-save every 3 seconds

Footer: "Next" button (enabled when text > 0)
```

**Page 2: Mood Selection**
```
Header: "How does this make you feel?"

5 large emoji buttons:
😊 Happy    😐 Neutral    😔 Sad    😡 Angry    😰 Anxious
[None] button at bottom

Tap emoji → Goes to Page 3
```

**Page 3: Mint Preview**
```
Header: "Make it permanent?"

[Large preview of NFT card]
- Shows entry text (full)
- Shows timestamp
- Shows mood emoji
- Shows chain color (dropdown to change)

[Chain selector dropdown]
Base ▼  (changes card color on select)

[Mint on Base] button (primary)
[Discard] button (secondary) → Entry deletes immediately
```

**Page 4a: Wallet Connection** (if not connected)
```
"Connect wallet to mint"

[MetaMask] [Coinbase Wallet] [Rainbow] [WalletConnect]

After connecting → Returns to Page 3
```

**Page 4b: Minting** (if connected)
```
[Loading animation]
"Minting on Base..."
"Approve in your wallet"

Transaction hash: 0x123... (links to explorer)

[Success state]
✨ "Minted on Base!"
[View All Thoughts] button → Goes to Gallery
```

**Page 5: Gallery**
```
Header: "Your Thoughts"
        [+ Write] button (top-right)
        [Connect: 0x12...34] (if connected)

Grid of thought cards (2 columns mobile, 3-4 desktop):
- Each card shows entry preview (first 3 lines)
- Mood emoji (corner)
- Chain badge (if minted) - colored dot
- Timer (if not minted) - "Deletes in 12h"

Empty state: "It's a bit empty here. Mint your first thought!"
             [Write Your First Thought] button

Tap card → Opens entry detail (read-only if minted, editable if not)
```

### Flow 2: Returning User

**Direct to Gallery:**
```
Opens app → Gallery page (Page 5)
Shows all thoughts (minted + ephemeral)
[+ Write] button always visible

User taps [+ Write] → Page 1 (Editor)
User taps existing card → Entry detail
```

### Flow 3: Mint Existing Thought

**From Gallery:**
```
User taps unminted thought card → Entry detail

[Mint This] button at bottom
Timer showing: "Deletes in 6 hours"

Tap [Mint This] → Page 3 (Mint Preview)
... continues same flow
```

---

## 4. Technical Specifications

### Database Schema (Supabase)

**Overview:**
The database uses PostgreSQL with Row Level Security (RLS) for wallet-based access control. It's designed with omnichain support for V2 upgrades.

**Key Tables:**
- `users` - Wallet addresses and metadata
- `thoughts` - Journal entries (ephemeral and minted)

**Key Features:**
- **400 character limit** enforced at database level
- **Omnichain fields:** `origin_chain_id`, `current_chain_id`, `bridge_count`
- **Auto-expiration:** `delete_expired_thoughts()` function runs automatically
- **Row Level Security:** Users can only access their own thoughts
- **Indexes:** Optimized for wallet lookups, expiration checks, and chain filtering

**Schema Highlights:**
```sql
CREATE TABLE thoughts (
  id UUID PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 400),
  mood TEXT NOT NULL CHECK (char_length(mood) <= 10),
  expires_at TIMESTAMP NOT NULL,
  is_minted BOOLEAN DEFAULT FALSE,
  origin_chain_id INTEGER,      -- V1: Base (8453) or Bob (60808)
  current_chain_id INTEGER,     -- V2: Track after bridging
  token_id TEXT,
  contract_address TEXT,
  tx_hash TEXT,
  -- ... additional fields
);
```

**Complete Schema Documentation:**
See `backend/supabase/migrations/001_initial_schema.sql` for full implementation details.

### Smart Contract Architecture

#### V1: Independent Chain Deployments (Current)

**Deployment Strategy: One Contract Per Chain with UUPS Upgradeability**

For V1, we deploy independent, upgradeable instances of the `OnChainJournal` contract to each target blockchain. This approach provides:

1. **Simplicity:** No cross-chain complexity in V1
2. **Upgradeability:** UUPS proxy pattern allows adding ONFT in V2
3. **Gas Efficiency:** Each contract optimized for its chain
4. **Chain-Specific Colors:** Hardcoded gradients (Base = blue, Bob = orange)

**Technical Implementation:**
- **Pattern:** OpenZeppelin UUPS (Universal Upgradeable Proxy Standard)
- **Standard:** ERC721 compliant
- **SVG Generation:** Fully on-chain, no external dependencies
- **Input Validation:** 400 byte text limit, 64 byte mood limit
- **Security:** XML escaping to prevent SVG injection attacks

For each deployment, the contract's `generateSVG` function is initialized with chain-specific color gradients during proxy initialization. The frontend manages contract addresses and routes users to the correct contract based on their selected chain.

#### V2: Omnichain Upgrade (Future)

**Upgrade Path via UUPS:**

When V2 launches, we will upgrade the existing contracts to inherit from LayerZero's ONFT721 standard:

1. **New Implementation:** Deploy `OnChainJournalV2` with ONFT721 integration
2. **UUPS Upgrade:** Call `upgradeToAndCall()` on each proxy
3. **Preserve State:** All existing NFTs and data remain intact
4. **Add Features:** Cross-chain bridging, unified galleries, origin tracking

**LayerZero Integration:**
- **Protocol:** LayerZero V2 for cross-chain messaging
- **Bridge Mechanism:** "Lock and mint" - burn on source, mint on destination
- **Data Preservation:** Text, mood, origin chain ID travel with NFT
- **Governance:** Multisig + Timelock for upgrade authorization

**Cross-Chain Gating** (V2 Future Features):
- **Same-Chain Gating:** Direct `balanceOf()` calls to NFT contracts
- **Cross-Chain Gating:** Merkle tree proofs for gas-efficient verification
- **Event Layouts:** Special SVG designs for token-gated events

#### Smart Contract Implementation

**Contract:** `OnChainJournal.sol`

**Key Components:**
- **Pattern:** UUPS Upgradeable (OpenZeppelin v5)
- **Standard:** ERC721Upgradeable
- **Token Name:** "On-Chain Journal" (symbol: "JOURNAL")

**Core Data Structure:**
```solidity
struct JournalEntry {
    string text;           // Max 400 bytes
    string mood;           // Max 64 bytes (emoji)
    uint256 timestamp;     // Block timestamp
    address owner;         // Original minter
    uint256 originChainId; // Chain where minted
}
```

**Key Functions:**
- `mintEntry(text, mood)` - Mint new journal entry NFT
- `tokenURI(tokenId)` - Returns Base64-encoded JSON with embedded SVG
- `generateSVG(entry)` - Creates on-chain SVG with chain-specific colors
- `updateColors(color1, color2)` - Admin function to update gradient (emergency use)
- `upgradeToAndCall(newImplementation, data)` - UUPS upgrade function (owner only)

**Security Features:**
- Input validation (400 byte text, 64 byte mood limits)
- XML escaping via `_escapeString()` internal function
- Custom errors for gas efficiency
- Owner-only upgrade authorization

**Complete Contract Documentation:**
See `docs/CONTRACT_GUIDE.md` and `contracts/src/OnChainJournal.sol` for full implementation.

---

## 4.5. Security & Governance Best Practices

While a formal third-party audit is deferred for V1, we implement industry-standard practices to build user trust and secure the protocol.

### Source Code Verification

**Mandatory for both V1 and V2:**
- Publicly verify source code for **both Proxy and Implementation contracts** on block explorers (Basescan, etc.)
- Provides on-chain guarantee that deployed code matches public repository
- Enables community review and transparency
- Required for listing on NFT marketplaces

### Upgrade Governance (V1 Launch)

**Initial Setup:**
- Contract ownership: Deployer EOA (externally owned account)
- Used for initial deployment and testing
- **Temporary:** Will be transferred to multisig before mainnet launch

**Production Setup (Before Mainnet):**
- **Multisig Wallet:** 3-of-5 founders/trusted parties (Gnosis Safe)
  - Prevents single point of failure
  - Requires multiple approvals for upgrades
  - Protects against compromised keys

- **Timelock Contract:** 48-hour mandatory delay (OpenZeppelin TimelockController)
  - Enforces public notice period for upgrades
  - Community can review proposed changes
  - Time to react if malicious upgrade proposed
  - Increases transparency and trust

**Upgrade Flow:**
1. Deploy new implementation contract
2. Test thoroughly on testnet
3. Propose upgrade via multisig
4. 3-of-5 signers approve
5. Timelock enforces 48-hour wait
6. Execute upgrade after delay
7. Announce to community

### On-Chain SVG Security

**Input Sanitization:**
All user-provided strings (`text`, `mood`) **must be escaped** before inclusion in SVG to prevent "SVG injection" attacks.

**Escape Characters:**
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&apos;`

**Implementation:** Dedicated `_escapeString()` internal function in contract.

### Gas Optimization for On-Chain SVG

**Best Practice:** Use `abi.encodePacked()` for efficient string concatenation:
```solidity
string memory svg = string(abi.encodePacked(
    '<svg ...>',
    ' ... SVG parts ... ',
    '</svg>'
));
```

**Modular Code:** Separate SVG layout logic into internal functions:
- `_generateDefaultSVG()` - Standard layout
- `_generateEventSVG()` - Special event layouts (V2)
- Main `tokenURI()` acts as router

---

## 5. Feature Specifications (V1)

### Page 1: Writing Interface

**Layout:**
```
┌─────────────────────────────────────┐
│ [⏱ Deletes in 7 days]  [Connect]   │ ← Header (60px)
├─────────────────────────────────────┤
│                                     │
│                                     │
│  [Large text area]                  │
│  Cream background #F9F7F1           │
│  Lora 18px font                     │
│  Line height 1.6                    │
│  Max-width 680px, centered          │
│                                     │
│  Placeholder: "What's on your       │
│  mind?"                             │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Saved ✓                    [Next]  │ ← Footer (60px)
└─────────────────────────────────────┘
```

**Behavior:**
- Auto-save every 3 seconds to Supabase
- "Next" button disabled until text.length > 0
- Character limit: 400 bytes (enforced by smart contract)
- Display character counter when approaching limit
- Timer in header counts down from creation time (7 days default)

### Page 2: Mood Selection

**Layout:**
```
┌─────────────────────────────────────┐
│  How does this make you feel?       │ ← Header
├─────────────────────────────────────┤
│                                     │
│         😊        😐                │
│       Happy    Neutral              │
│                                     │
│         😔        😡                │
│        Sad      Angry               │
│                                     │
│         😰                          │
│      Anxious                        │
│                                     │
│                                     │
│           [None]                    │ ← Button (not emoji)
└─────────────────────────────────────┘
```

**Behavior:**
- Each emoji is 64px size
- Tappable area: 100x100px
- Selecting any option (including "None") → Goes to Mint Preview
- No back button (can navigate back via browser/gesture)

### Page 3: Mint Preview

**Layout:**
```
┌─────────────────────────────────────┐
│  Make it permanent?          [Back] │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │  [NFT Preview Card]           │ │
│  │  - Orange gradient (Base)     │ │
│  │  - Full entry text            │ │
│  │  - Timestamp + Mood emoji     │ │
│  │  - Matches final SVG          │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  Chain: [Base ▼]                    │ ← Dropdown
│                                     │
│  [Mint on Base]                     │ ← Primary button
│  [Discard]                          │ ← Secondary (red text)
└─────────────────────────────────────┘
```

**Chain Dropdown (V1):**
```
Base          ~$0.001  Pay gas
Bob           ~$0.001  Pay gas
```

**Future Chains (V2):**
```
Ink           TBD
HyperEVM      TBD
+ Other chains via LayerZero
```

**Behavior:**
- Selecting chain changes preview card gradient color (Base = blue, Bob = orange)
- "Mint on [Chain]" button updates dynamically
- "Discard" → Confirms "Delete this thought? It cannot be recovered" → Deletes from DB
- **V1 Note:** Each chain is independent - NFTs cannot be bridged between chains yet

### Page 4: Wallet Connection (If Needed)

**Layout:**
```
┌─────────────────────────────────────┐
│  Connect wallet to mint             │
├─────────────────────────────────────┤
│                                     │
│  Choose your wallet:                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [🦊 MetaMask]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [🔵 Coinbase Wallet]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [🌈 Rainbow]               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [⚡ WalletConnect]          │   │
│  └─────────────────────────────┘   │
│                                     │
│               [Cancel]              │
└─────────────────────────────────────┘
```

**Behavior:**
- Selecting wallet → Opens wallet approval
- After approval → Returns to Mint Preview
- Address appears in header: "0x12...34"

### Page 5: Minting Status

**During Transaction:**
```
┌─────────────────────────────────────┐
│  Minting on Base...                 │
├─────────────────────────────────────┤
│                                     │
│        [Animated spinner]           │
│                                     │
│  Approve in your wallet             │
│                                     │
│  This usually takes 15-30 seconds   │
│                                     │
│  Tx: 0x1234...5678 ↗                │ ← Links to explorer
│                                     │
└─────────────────────────────────────┘
```

**Success:**
```
┌─────────────────────────────────────┐
│  ✨ Minted on Base!                 │
├─────────────────────────────────────┤
│                                     │
│          [Confetti animation]       │
│                                     │
│  Your thought is now permanent      │
│                                     │
│  View on Base: 0x123...789 ↗        │
│                                     │
│  [View All Thoughts]                │ ← Primary
│  [Mint Another]                     │ ← Secondary
└─────────────────────────────────────┘
```

**Error:**
```
┌─────────────────────────────────────┐
│  ❌ Minting failed                  │
├─────────────────────────────────────┤
│                                     │
│  [Error description]                │
│  - Insufficient funds               │
│  - Transaction rejected             │
│  - Network error                    │
│                                     │
│  [Try Again]                        │
│  [Back to Preview]                  │
└─────────────────────────────────────┘
```

### Page 6: Gallery

**Layout:**
```
┌─────────────────────────────────────┐
│  Your Thoughts      [+]  [0x12...34]│ ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │ Entry 1 │  │ Entry 2 │          │ ← Cards
│  │ 😊      │  │ 😔  🟠  │          │   Mood + Badge
│  │ Preview │  │ Preview │          │
│  │ text... │  │ text... │          │
│  │         │  │         │          │
│  │ ⏱ 12h   │  │ Minted  │          │ ← Status
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │ Entry 3 │  │ Entry 4 │          │
│  └─────────┘  └─────────┘          │
│                                     │
└─────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────┐
│  Your Thoughts      [+]  [Connect]  │
├─────────────────────────────────────┤
│                                     │
│                                     │
│        [Empty journal icon]         │
│                                     │
│  It's a bit empty here.             │
│  Mint your first thought!           │
│                                     │
│  [Write Your First Thought]         │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Card Specs:**
- Width: 48% (2 columns mobile), 32% (3 columns desktop)
- Aspect ratio: ~4:5 (portrait-ish)
- Background: White with soft shadow
- Minted badge: Colored dot (chain color) in corner - Blue (Base), Orange (Bob)
- Timer: Red text when < 6h remaining
- **V1:** Gallery shows all thoughts from both Base and Bob deployments

---

## 6. V1 Deployment Timeline

### Sprint 2 (Weeks 2-3): Smart Contract Development ✅ COMPLETE
**Status:** Contract ready for testnet deployment

- ✅ Foundry setup with OpenZeppelin Upgradeable v5
- ✅ OnChainJournal.sol with UUPS pattern
- ✅ 18 comprehensive tests (all passing)
- ✅ Deployment scripts for Base & Bob
- ✅ Chain-specific color configuration
- ✅ Input validation (400 byte text, 64 byte mood)
- ✅ XML escaping for SVG security
- ⏳ **BLOCKED:** Awaiting final SVG layout specifications

### Sprint 3 (Week 4): Testnet Deployment & Integration
- [ ] Finalize SVG layout design
- [ ] Deploy to Base Sepolia testnet
- [ ] Deploy to Bob Testnet
- [ ] Update frontend with contract addresses
- [ ] Integration testing (mint flow, SVG rendering)
- [ ] Beta testing with real users
- [ ] Monitor gas costs

**Deliverable:** Fully functional testnet deployment

### Sprint 4 (Weeks 5-6): Mainnet Launch
- [ ] Security review (internal)
- [ ] Consider external audit (optional for V1)
- [ ] Set up multisig wallet (Gnosis Safe)
- [ ] Deploy to Base mainnet
- [ ] Deploy to Bob mainnet
- [ ] Transfer ownership to multisig
- [ ] Monitor for 1-2 weeks
- [ ] Public launch announcement

**Deliverable:** Production V1 on Base & Bob mainnet

### Post-Launch (Weeks 7-10): V2 Planning
- [ ] Gather user feedback
- [ ] Research LayerZero ONFT integration patterns
- [ ] Design V2 upgrade architecture
- [ ] Implement ONFT functionality
- [ ] Test cross-chain bridging thoroughly
- [ ] Deploy V2 upgrade via UUPS

**Deliverable:** V2 with omnichain functionality

---

## 7. Development Phases - LEGACY (Pre-V1/V2 Split)

**Note:** This section reflects the original 4-week plan before the strategic decision to defer omnichain to V2. Kept for reference.

### Week 1: Core Writing + Gallery ✅ COMPLETE (Sprint 1)
- ✅ Vite + React setup + Tailwind
- ✅ Supabase setup + schema
- ✅ Page 1: Writing interface with auto-save
- ✅ Page 6: Gallery view with cards
- ✅ Auto-delete database function (Supabase)
- ✅ Zustand state management
- ✅ RainbowKit wallet integration

**Deliverable:** ✅ Can write thoughts, see gallery, thoughts auto-delete.

### Week 2: Mood + Preview ✅ COMPLETE (Sprint 1)
- ✅ Page 2: Mood selection
- ✅ Page 3: Mint preview with SVG generation
- ✅ Chain selector (frontend mock)
- ✅ "Discard" functionality

**Deliverable:** ✅ Complete write → mood → preview flow (mock minting).

### Week 3: Smart Contracts ✅ COMPLETE (Sprint 2)
- ✅ Foundry setup
- ✅ OnChainJournal.sol (UUPS upgradeable)
- ✅ Comprehensive test suite (18/18 passing)
- ✅ Deployment scripts with chain detection
- ✅ Documentation (CONTRACT_GUIDE, DEPLOYMENT_CHECKLIST, V1_READY)

**Deliverable:** ✅ Production-ready smart contracts (awaiting SVG specs).

### Week 4-6: Testnet → Mainnet (Current Phase)
- [ ] Finalize SVG layout
- [ ] Deploy to Base Sepolia & Bob Testnet
- [ ] Real minting integration with frontend
- [ ] Beta testing
- [ ] Mainnet deployment with multisig

**Deliverable:** Production V1 on Base & Bob mainnet.

---

## 8. Tech Stack Summary

**Frontend:**
- Vite + React 18
- TypeScript
- Tailwind CSS
- wagmi v2 + viem (Web3)
- RainbowKit (wallet connection)
- Zustand (state management)
- Radix UI (component primitives)
- Sonner (toast notifications)

**Backend:**
- Supabase (PostgreSQL + Row Level Security)
- Automatic cleanup function for expired thoughts
- No auth server needed (wallet-based access)

**Blockchain (V1):**
- Solidity 0.8.24
- Foundry (dev framework)
- OpenZeppelin Upgradeable Contracts v5
- UUPS Proxy Pattern
- Deploy on: **Base & Bob only**
- On-chain SVG generation (no IPFS)

**Blockchain (V2 Future):**
- LayerZero V2 ONFT integration
- Cross-chain bridging
- Expand to Ink, HyperEVM, and other chains

**Hosting:**
- Vercel (frontend) - Free tier
- Supabase (backend) - Free tier
- Total: $0/month initially

---

## 9. Cost Estimate

### One-Time Costs (V1)
- Domain: $10-15/year
- Contract deployment (2 chains - Base & Bob testnets): ~$20-30
- Contract deployment (2 chains - Base & Bob mainnets): ~$50-100
- **Total V1:** ~$80-145

### One-Time Costs (V2 Future)
- V2 Upgrade deployment (2 chains): ~$50-100
- Additional chain deployments (Ink, HyperEVM, etc.): ~$20-40 per chain
- LayerZero trusted peer setup: ~$20-50 per chain pair
- **Total V2:** ~$150-300

### Monthly Costs (V1)
- Hosting: $0 (Vercel free tier)
- Database: $0 (Supabase free tier for <500MB)
- RPC endpoints: $0 (public RPCs initially)
- **Total:** $0/month initially

### Monthly Costs (V2 Future)
- Hosting: $0-20 (Vercel free → Pro if scaling)
- Database: $0-25 (Supabase free → Pro if > 500MB)
- RPC endpoints: $0-50 (may need dedicated RPCs for reliability)
- LayerZero messaging: Pay-per-use (users pay gas)
- **Total:** $0-95/month

### Future Costs (If Significant Scale)
- Vercel Pro: $20/month (for team features & analytics)
- Supabase Pro: $25/month (if > 500MB data or need better performance)
- Dedicated RPC: $50-200/month (Alchemy/Infura for reliability)
- Smart contract audit: $5,000-15,000 (one-time, recommended before V2 mainnet)
- Multisig setup: ~$50-100 (Gnosis Safe deployment)

---

## 10. Strategic Rationale: Why V1 First, V2 Later

### The Original Challenge
During Sprint 2, we discovered that combining LayerZero's ONFT721 standard with OpenZeppelin's UUPS upgradeable pattern is complex:

1. **Architectural Conflicts:** ONFT721 uses standard constructors while UUPS requires initializers
2. **Limited Documentation:** LayerZero V2's upgradeable ONFT patterns are not well-documented
3. **Testing Complexity:** Cross-chain testing requires multiple testnets, complex setup, and time
4. **Audit Risk:** Combining two advanced patterns increases security review surface area

### The Strategic Pivot
Rather than delay launch to solve these challenges, we chose a **progressive deployment strategy**:

**V1 Benefits:**
- ✅ Ship faster (4 weeks vs 8-10 weeks)
- ✅ Gather real user feedback early
- ✅ Validate product-market fit
- ✅ Thoroughly test core functionality
- ✅ Build community before adding complexity
- ✅ Simpler security review
- ✅ Lower initial costs

**V2 Upgrade Path:**
- ✅ UUPS allows seamless upgrade (no redeployment)
- ✅ Existing NFTs remain intact
- ✅ Time to properly research LayerZero integration
- ✅ Can implement learnings from V1
- ✅ Community input on V2 features
- ✅ Professional audit before cross-chain launch

### What This Means for Users

**V1 Experience:**
- Users mint journal entries on Base or Bob
- Each chain is independent
- NFTs stay on the chain where minted
- Simpler, faster, proven technology

**V2 Upgrade (Future):**
- Same contract addresses (via proxy upgrade)
- Existing NFTs gain bridging capability
- Cross-chain gallery view
- Origin chain always visible (via gradient color)
- No action required from users to upgrade

This approach follows the **"ship early, iterate often"** philosophy while maintaining technical excellence and user trust.

