# MintMyMood - Product Requirements Document (Simplified)

**Version:** 1.0 - Realistic Scope  
**Target:** Ship in 4 weeks with minimal costs

---

## 1. Core Concept

**What:** A minimalist journaling app where thoughts can be made permanent as on-chain SVG NFTs.

**Key Innovation:** Minting NFT makes creating minted NFT meaningful and fun.

**Target:** Crypto-native users who already have wallets.

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

**Option A: Supabase Free Tier**
- PostgreSQL database (500MB, 2GB bandwidth)
- Built-in auth (but we use wallet)
- Simple REST API
- Cost: $0/month until scale
- **Recommended for V1**

**Option B: VPS (Hetzner/DigitalOcean)**
- Small VPS: €4-5/month
- PostgreSQL + simple API
- More control, more work
- Better for privacy (self-hosted)

**Option C: Local-only (no server)**
- Data only on device
- Can't access from other devices
- Simplest, $0 cost
- But limited functionality

**Let's start locally with a postgresql database**

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
- Example structure:
```svg
<svg viewBox="0 0 500 500">
  <rect fill="[chain-color]"/>
  <text>[Full entry text]</text>
  <text>[Timestamp]</text>
  <text>[Mood emoji]</text>
</svg>
```

**Chain Colors :**
- Bob: Orange gradient (#FF6B35 → #F7931E)
- Ink: Purple
- Base: Blue
- HyperEVM: green

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

- **Bob:** Orange Gradient (`#FF6B35` → `#F7931E`)
- **Ink:** Purple (`#5D3FD3`)
- **Base:** Blue (`#0052FF`)
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

```sql
-- Users table (automatic via wallet address)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Thoughts table
CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL, -- denormalized for RLS
  text TEXT NOT NULL,
  mood TEXT, -- 'happy', 'neutral', 'sad', 'angry', 'anxious', 'none'
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL, -- created_at + 24h (or chosen duration)
  is_minted BOOLEAN DEFAULT FALSE,
  chain TEXT, -- 'base', 'zora', 'optimism', 'ethereum', 'polygon'
  token_id TEXT,
  tx_hash TEXT
);

-- Row Level Security
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own thoughts"
  ON thoughts FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claim.wallet_address'));

CREATE POLICY "Users can only insert their own thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (wallet_address = current_setting('request.jwt.claim.wallet_address'));

-- Automatic cleanup of expired thoughts (Supabase cron function)
CREATE OR REPLACE FUNCTION delete_expired_thoughts()
RETURNS void AS $$
BEGIN
  DELETE FROM thoughts 
  WHERE expires_at < NOW() AND is_minted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Schedule: Run every hour
-- (Set up in Supabase dashboard: Database → Cron Jobs)
```

### Smart Contract (On-Chain SVG NFT)

**Deployment Strategy: One Contract Per Chain**

To simplify development, reduce gas costs, and maintain flexibility for V1, we will employ a "one contract per chain" deployment strategy.

Instead of a single, complex contract that dynamically changes SVG colors based on the chain ID, we will deploy a separate, independent instance of the `OnChainJournal` contract to each target blockchain.

For each deployment, the contract's `generateSVG` function will be hardcoded with the specific color gradient for that chain (e.g., the contract on Base will have the blue gradient, the one on Bob will have the orange gradient).

The frontend application will be responsible for managing the list of contract addresses and interacting with the correct one based on the user's selected chain.

**Solidity Contract:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Onchain journalThoughts is ERC721 {
    using Strings for uint256;
    
    uint256 private _tokenIdCounter;
    
    struct Thought {
        string text;
        uint256 timestamp;
        string mood;
    }
    
    mapping(uint256 => Thought) public thoughts;
    
    constructor() ERC721("Onchain journal Thoughts", "THOUGHT") {}
    
    function mint(string memory text, string memory mood) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        thoughts[tokenId] = Thought({
            text: text,
            timestamp: block.timestamp,
            mood: mood
        });
        
        return tokenId;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Thought memory thought = thoughts[tokenId];
        string memory svg = generateSVG(thought.text, thought.timestamp, thought.mood);
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Thought #', tokenId.toString(), '",',
                        '"description": "A permanent thought from Onchain journal",',
                        '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    function generateSVG(string memory text, uint256 timestamp, string memory mood) 
        internal 
        pure 
        returns (string memory) 
    {
        // Chain color determined by network (Base = orange, Zora = purple, etc.)
        string memory bgColor = "#FF6B35"; // Default orange for Base
        
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">',
                '<defs>',
                '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:', bgColor, ';stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#F7931E;stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="500" height="500" fill="url(#grad)" rx="20"/>',
                '<text x="30" y="50" font-family="serif" font-size="14" fill="rgba(255,255,255,0.7)">',
                'Timestamp: ', Strings.toString(timestamp),
                '</text>',
                '<text x="470" y="50" font-size="32" text-anchor="end">',
                mood,
                '</text>',
                '<foreignObject x="30" y="80" width="440" height="360">',
                '<div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:serif;font-size:18px;line-height:1.6;">',
                text,
                '</div>',
                '</foreignObject>',
                '<text x="30" y="480" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.6)">',
                'On-Chain Journal',
                '</text>',
                '</svg>'
            )
        );
    }
}
```

**Chain Colors (add to contract or frontend):**
- Base: `#FF6B35` → `#F7931E` (orange)
- Zora: `#8B5CF6` → `#A78BFA` (purple)
- Optimism: `#FF0420` → `#FF4144` (red)
- Ethereum: `#627EEA` → `#8B9FFA` (blue)
- Polygon: `#8247E5` → `#A374F4` (purple)

### Frontend Stack

**Framework:** Next.js (React)
- Pages: `/write`, `/gallery`, `/mint/[id]`
- API routes: `/api/thoughts/*` (proxy to Supabase)

**Web3:**
- wagmi + viem for wallet connection
- Multi-chain support (Base, Zora, Optimism, Ethereum, Polygon)
- Gelato/Biconomy for gasless (TBD based on testing)

**Styling:** Tailwind CSS

**State:** Zustand (lightweight)

---

## 5. Feature Specifications

### Page 1: Writing Interface

**Layout:**
```
┌─────────────────────────────────────┐
│ [⏱ Deletes in 24h]    [Connect]   │ ← Header (60px)
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
- Character limit: 5000 characters (display counter at 4500+)
- Timer in header counts down from creation time

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

**Chain Dropdown:**
```
Base          ~$0.001  ✓ Gasless
Zora          ~$0.001  ✓ Gasless
Optimism      ~$0.002  Pay gas
Ethereum      ~$0.15   Pay gas
Polygon       ~$0.001  Pay gas
```

**Behavior:**
- Selecting chain changes preview card gradient color
- "Mint on [Chain]" button updates dynamically
- "Discard" → Confirms "Delete this thought? It cannot be recovered" → Deletes from DB

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
- Minted badge: Colored dot (chain color) in corner
- Timer: Red text when < 6h remaining

---


---

## 7. Development Phases (4 Weeks)

### Week 1: Core Writing + Gallery
- [ ] Next.js setup + Tailwind
- [ ] Supabase setup + schema
- [ ] Page 1: Writing interface with auto-save
- [ ] Page 6: Gallery view with cards
- [ ] Auto-delete cron job (Supabase function)

**Deliverable:** Can write thoughts, see gallery, thoughts auto-delete.

### Week 2: Mood + Preview
- [ ] Page 2: Mood selection
- [ ] Page 3: Mint preview with SVG generation
- [ ] Chain selector (frontend only)
- [ ] "Discard" functionality

**Deliverable:** Complete write → mood → preview flow (no actual minting yet).

### Week 3: Web3 Integration
- [ ] Smart contract (deploy on testnets)
- [ ] Page 4: Wallet connection (wagmi)
- [ ] Page 5: Minting flow (transaction handling)
- [ ] Gallery: Minted badge display
- [ ] Chain color variations in SVG

**Deliverable:** Can actually mint NFTs on testnets.

### Week 4: Mainnet + Polish
- [ ] Deploy contracts to mainnets (5 chains)
- [ ] Gasless relay integration (Gelato/Biconomy)
- [ ] Error handling (all flows)
- [ ] Loading states + animations
- [ ] Responsive design (mobile/desktop)
- [ ] Testing with real wallets + real ETH

**Deliverable:** Production-ready app on mainnet.

---

## 8. Tech Stack Summary

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- wagmi + viem (Web3)
- Zustand (state)

**Backend:**
- Supabase (PostgreSQL + Auth + Cron)
- OR: Node.js API + PostgreSQL on VPS

**Blockchain:**
- Solidity smart contracts (OpenZeppelin ERC721)
- Deploy on: Base, Zora, Optimism, Ethereum, Polygon
- Gelato Relay (gasless, TBD)

**Hosting:**
- Vercel (frontend) - Free tier
- Supabase (backend) - Free tier
- Total: $0/month initially

---

## 9. Cost Estimate

### One-Time Costs
- Domain: $10-15/year
- Contract deployment (5 chains): ~$100
- **Total:** ~$115

### Monthly Costs (V1)
- Hosting: $0 (Vercel free tier)
- Database: $0 (Supabase free tier)
- Gasless relay: $50-100 (your budget)
- **Total:** $50-100/month

### Future Costs (If Scale)
- Vercel Pro: $20/month (if needed)
- Supabase Pro: $25/month (if > 500MB data)
- VPS alternative: €5/month
- Gasless: Scale with usage

