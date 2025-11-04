# Developer Guide

A comprehensive guide to understanding and working with the MintMyMood codebase.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Key Concepts](#key-concepts)
4. [Development Workflow](#development-workflow)
5. [Common Tasks](#common-tasks)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)

---

## Architecture Overview

MintMyMood is a full-stack Web3 application with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 18 + TypeScript + Vite + Tailwind + RainbowKit      │
│  (SIWE Authentication + JWT Management)                     │
└──────────┬────────────┬────────────┬─────────────────────────┘
           │            │            │
           │            │            │
   ┌───────▼────┐  ┌────▼────┐  ┌───▼──────────┐
   │ Backend API│  │Supabase │  │Smart Contracts│
   │ (Express)  │  │(Postgres│  │  (Solidity)   │
   │            │  │   RLS)  │  │               │
   │• SIWE Auth │  │• Thoughts│  │• Base Sepolia │
   │• ENS Signs │  │• Users   │  │• Bob Testnet  │
   └────────────┘  └──────────┘  └───────────────┘
```

### Core Flow

0. **Authentication** → User connects wallet and signs SIWE message (proves wallet ownership)
1. **Writing Interface** → User writes a thought (auto-saves to Supabase after 3 seconds)
2. **Mood Selection** → User selects an emoji mood
3. **Mint Preview** → User previews the NFT and chooses to mint or discard
4. **Minting** → Transaction sent to smart contract (with ENS verification)
5. **Gallery** → Shows all thoughts (both minted and ephemeral) fetched from Supabase

---

## Project Structure

```
MintMyMood/
├── src/                              # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── WritingInterface.tsx     # Page 1: Writing editor (auto-save)
│   │   ├── MoodSelection.tsx        # Page 2: Mood emoji picker
│   │   ├── MintPreview.tsx          # Page 3: NFT preview before minting
│   │   ├── Gallery.tsx              # Gallery view with filters
│   │   ├── ThoughtDetail.tsx        # Individual thought view
│   │   ├── ThoughtCard.tsx          # Card component for gallery
│   │   ├── Header.tsx               # Shared header with wallet connection
│   │   ├── WalletModal.tsx          # Wallet connection modal
│   │   ├── MintingModal.tsx         # Minting status modal
│   │   └── ui/                      # Radix UI primitives
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # SIWE authentication hook
│   │   ├── useEnsName.ts            # ENS name resolution (Ethereum Mainnet)
│   │   └── useMintJournalEntry.ts   # Smart contract minting hook
│   │
│   ├── store/
│   │   ├── useAuthStore.ts          # Authentication state (Zustand)
│   │   └── useThoughtStore.ts       # Zustand global state
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client with JWT auth
│   │   ├── supabaseHelper.ts        # JWT expiry handler wrapper
│   │   ├── signatureApi.ts          # ENS signature API client
│   │   └── wagmi.ts                 # wagmi + RainbowKit config
│   │
│   ├── contracts/
│   │   ├── OnChainJournal.abi.json  # Contract ABI
│   │   └── config.ts                # Contract addresses per chain
│   │
│   ├── utils/
│   │   └── generateLocalSVG.ts      # Local SVG matching on-chain output
│   │
│   ├── App.tsx                      # Main app component with routing
│   └── main.tsx                     # Entry point
│
├── contracts/                        # Smart Contracts (Foundry)
│   ├── src/
│   │   └── OnChainJournal.sol       # UUPS Upgradeable ERC721
│   ├── test/
│   │   └── OnChainJournal.t.sol     # Foundry tests (28/28 passing)
│   ├── script/
│   │   ├── Deploy.s.sol             # Initial deployment script
│   │   └── Upgrade.s.sol            # UUPS upgrade script
│   └── foundry.toml                 # Foundry configuration
│
├── backend/
│   ├── api/
│   │   ├── server.js                # Express.js signature service
│   │   └── package.json
│   └── supabase/
│       └── migrations/              # Database migrations
│
├── docs/                             # Documentation
│   ├── QUICK_START.md               # 5-minute setup guide
│   ├── DEVELOPER_GUIDE.md           # This file
│   ├── CONTRACT_GUIDE.md            # Smart contract details
│   ├── DEPLOYMENT.md                # Deployment instructions
│   ├── svg/
│   │   ├── README.md                # SVG design specifications
│   │   ├── BASE.svg                 # Base chain SVG reference
│   │   └── BOB.svg                  # Bob chain SVG reference
│   └── archive/                     # Historical sprint docs
│
├── .env.example                      # Environment variables template
├── README.md                         # Project overview
└── CLAUDE.md                         # AI assistant context
```

---

## Key Concepts

### 1. Ephemeral vs Permanent

- **Ephemeral thoughts**: Auto-delete after 7 days (currently 10 min for testing)
- **Permanent thoughts**: Minted as NFTs, stored forever on-chain
- Users can preview before committing to permanent minting

### 2. Auto-Save System

**Location**: `src/components/WritingInterface.tsx:62-79`

- Saves to Supabase after 3 seconds of no typing (debounced)
- Tracks draft IDs to prevent duplicate saves
- Uses Zustand store for state management
- Shows toast notifications on success/error
- **Requires authenticated JWT** in Authorization header (SIWE authentication)

```typescript
// Simplified auto-save logic
useEffect(() => {
  const timer = setTimeout(async () => {
    if (text.trim() && walletAddress) {
      // IMPORTANT: Requires authenticated JWT in Authorization header
      // Auto-save will fail if user is not authenticated via SIWE
      // Uses dbQuery() helper to handle JWT expiry gracefully
      await saveThought({ text, wallet_address: walletAddress });
      toast.success('Thought saved');
    }
  }, 3000);

  return () => clearTimeout(timer);
}, [text, walletAddress]);
```

### 3. ENS Verification System

**Note**: This is separate from SIWE authentication (which proves wallet ownership for database access). ENS verification proves ENS ownership for displaying verified names on NFTs.

**Problem**: Without verification, anyone can mint with any ENS name (identity fraud)

**Solution**: Hybrid signature verification

1. Frontend requests signature from backend API (`/api/ens-signature`)
2. Backend verifies ENS ownership and signs the mint request
3. Smart contract verifies signature using ECDSA
4. NFT displays `✓ ensname.eth` for verified ENS

**Locations**:
- Backend API: `backend/api/server.js`
- Smart contract: `contracts/src/OnChainJournal.sol:mintEntry()`
- Frontend: `src/lib/signatureApi.ts` + `src/hooks/useMintJournalEntry.ts`

### 4. State Management

**Authentication State** (Zustand): `src/store/useAuthStore.ts`
- JWT token storage
- Wallet address
- Authentication status
- JWT expiry checking

**Global State** (Zustand): `src/store/useThoughtStore.ts`
- Thoughts array
- CRUD operations (save, fetch, delete)
- Minting operations

**Local State**: Component-level (React hooks)
- View navigation (`App.tsx`)
- Form inputs
- Modal visibility

**Web3 State**: wagmi hooks
- Wallet connection
- Contract reads/writes
- Transaction status

### 5. SIWE Authentication System

**Problem**: Without authentication, anyone could insert thoughts with any wallet address (no proof of ownership)

**Solution**: Sign-In with Ethereum (EIP-4361)

**Flow**:
1. User connects wallet (RainbowKit)
2. Frontend requests nonce from backend (`GET /api/auth/nonce`)
3. Backend generates nonce and stores in `auth_nonces` table (5-minute expiry)
4. Frontend constructs EIP-4361 message and prompts wallet signature
5. User signs message with their wallet
6. Frontend sends signature to backend (`POST /api/auth/verify`)
7. Backend verifies signature using `siwe` library
8. Backend consumes nonce (one-time use) and issues JWT token (24-hour expiry)
9. Frontend stores JWT in localStorage
10. All Supabase queries include JWT in Authorization header
11. RLS policies enforce per-wallet data isolation

**Components**:
- Backend API: `backend/api/server.js` (nonce generation, signature verification, JWT issuance)
- Frontend Hook: `src/hooks/useAuth.ts` (authentication flow)
- Supabase Client: `src/lib/supabase.ts` (singleton client with JWT header management)
- Auth Store: `src/store/useAuthStore.ts` (global authentication state)
- DB Helper: `src/lib/supabaseHelper.ts` (JWT expiry handler)

**Key Features**:
- **Nonce-based replay protection**: Each nonce is single-use and expires in 5 minutes
- **JWT expiry**: Tokens expire after 24 hours, requiring re-authentication
- **Singleton Supabase client**: ONE client instance with dynamic auth header updates (critical for performance and Realtime)
- **Graceful expiry handling**: `dbQuery()` wrapper automatically signs out on JWT expiry
- **React 18 Strict Mode protection**: Ref-based lock prevents double authentication
- **Session restoration**: JWT persists in localStorage, restored on page reload

**Security**:
- Rate limiting: 100 auth requests/hour per IP
- Nonce cleanup: Automatic deletion of expired nonces
- RLS enforcement: JWT claims verified by PostgreSQL RLS policies
- ECDSA verification: Backend verifies signature before issuing JWT

**See**: [SIWE_IMPLEMENTATION_PLAN.md](SIWE_IMPLEMENTATION_PLAN.md) for complete technical documentation.

### 6. JWT Management & Session Handling

**Storage**: JWTs are stored in `localStorage` (keys: `siwe_jwt`, `siwe_wallet`)

**Lifecycle**:
1. **Issuance**: Backend creates JWT after successful SIWE verification (24-hour expiry)
2. **Storage**: `setAuthJWT()` stores JWT and updates Supabase client header
3. **Restoration**: `initAuth()` restores session on app load (called in `App.tsx`)
4. **Usage**: All Supabase queries automatically include JWT via singleton client
5. **Expiry**: `dbQuery()` wrapper detects 401 errors and triggers sign-out
6. **Clearing**: `signOut()` removes JWT from localStorage and client header

**JWT Claims** (issued by backend):
```json
{
  "sub": "uuid-v5-from-wallet",      // User ID (deterministic UUID)
  "aud": "authenticated",              // Audience (required by Supabase)
  "role": "authenticated",             // Role (required by RLS)
  "wallet_address": "0x...",           // Custom claim for RLS policies
  "exp": 1730678400,                   // 24-hour expiry
  "iat": 1730592000                    // Issued at
}
```

**Critical Implementation Details**:

1. **Singleton Client Pattern**:
   - ONE `supabase` client instance exported from `src/lib/supabase.ts`
   - Header updated dynamically via `setAuthHeader(jwt)`
   - Components import and use directly: `import { supabase } from '@/lib/supabase'`
   - **Why**: Performance, Realtime subscriptions, simplicity

2. **Session Restoration Must Update Store**:
   - `initAuth()` calls BOTH `setAuthHeader()` AND `useAuthStore.getState().setAuth()`
   - **Why**: Without updating store, ConnectButton triggers re-authentication loop

3. **React 18 Strict Mode Protection**:
   - `useAuth` uses ref-based lock (`authLockRef`) to prevent concurrent auth
   - `authenticate()` wrapped in `useCallback` to prevent re-triggering
   - **Why**: Strict Mode double-invokes effects, causing two auth attempts with different nonces

**Error Handling**:
```typescript
// dbQuery() wrapper handles JWT expiry automatically
try {
  const { data } = await dbQuery(
    supabase.from('thoughts').select('*')
  );
} catch (error) {
  // If JWT expired, user is signed out and sees "Session expired" toast
  // Components should check isAuthenticated and prompt re-authentication
}
```

**Troubleshooting**:
- "Session expired immediately": JWT_SECRET mismatch between backend and Supabase
- "Infinite re-auth loop": `initAuth()` not updating Zustand store
- "Double signature prompts": Missing ref lock in `useAuth`

### 7. Smart Contract Architecture

**Pattern**: UUPS Upgradeable Proxy

```
User → Proxy (0xC2De...) → Implementation (0x95a7...)
                          (can be upgraded)
```

**Key Functions**:
- `mintEntry(text, mood, ensName, signature, nonce, expiry)` - Mint NFT
- `tokenURI(tokenId)` - Returns base64-encoded JSON metadata
- `generateSVG(entry)` - On-chain SVG generation
- `upgradeToAndCall(newImpl, data)` - UUPS upgrade (owner only)

**Chain-Specific Gradients**:
- Base: Blue `#0052FF` → `#3c8aff`
- Bob: Orange `#FF6B35` → `#F7931E`

---

## Development Workflow

### Daily Workflow

```bash
# 1. Start development servers (in 2 terminals)
npm run dev                      # Frontend (port 3000)
cd backend/api && npm start      # Backend API (port 3001) - REQUIRED for auth & ENS

# 2. Make changes to code

# 3. Test changes
# - Frontend: Check http://localhost:3000
# - Contracts: cd contracts && forge test

# 4. Commit
git add .
git commit -m "feat: description of changes"
```

### Smart Contract Workflow

```bash
cd contracts

# Compile contracts
forge build

# Run tests (28/28 should pass)
forge test

# Run specific test with verbose output
forge test --match-test testMintEntry -vvv

# Check gas usage
forge test --gas-report

# Deploy to testnet
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### Database Changes

1. Create migration file in `backend/supabase/migrations/`
2. Write SQL (table changes, RLS policies, etc.)
3. Run migration in Supabase dashboard (SQL Editor)
4. Update TypeScript types if needed

**SIWE Authentication Migrations**:
- `005_auth_nonces_table.sql` - Creates `auth_nonces` table for SIWE nonce storage
- `006_remove_dev_policies.sql` - Removes temporary dev RLS policies, enables production RLS with JWT verification

---

## Common Tasks

### Add a New React Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="p-4">
      <h1>{title}</h1>
    </div>
  );
}
```

Usage:
```typescript
import MyComponent from './components/MyComponent';
<MyComponent title="Hello" />
```

### Add a New Zustand Store Action

```typescript
// src/store/useThoughtStore.ts
const useThoughtStore = create<ThoughtStore>((set, get) => ({
  // ... existing state

  // New action
  myNewAction: async (param: string) => {
    set({ isLoading: true });
    try {
      // Do something
      const result = await supabase.from('thoughts').select();
      set({ thoughts: result.data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

### Add a New Smart Contract Function

1. Edit `contracts/src/OnChainJournal.sol`
2. Add function:
```solidity
function myNewFunction(uint256 tokenId) public view returns (string memory) {
    require(_ownerOf(tokenId) != address(0), "Token does not exist");
    return journalEntries[tokenId].text;
}
```
3. Write test in `contracts/test/OnChainJournal.t.sol`
4. Run `forge test`
5. Deploy upgrade (see [DEPLOYMENT.md](DEPLOYMENT.md))

### Update Contract Addresses (After Deployment)

1. Edit `src/contracts/config.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  84532: '0xYourNewAddress', // Base Sepolia
  808813: '0xYourNewAddress', // Bob Testnet
};
```
2. Regenerate ABI: `forge build && cat out/OnChainJournal.sol/OnChainJournal.json | jq .abi > ../src/contracts/OnChainJournal.abi.json`

---

## Environment Variables

### Frontend (`.env`)

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WalletConnect (required)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Backend API (optional - for ENS minting)
VITE_BACKEND_URL=http://localhost:3001

# Environment
VITE_ENVIRONMENT=development
```

### Backend API (`backend/api/.env`)

```bash
# SIWE Authentication (Sprint 3.2)
JWT_SECRET=your-secret-min-32-chars         # MUST match Supabase dashboard JWT secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Config
PORT=3001
FRONTEND_URL=http://localhost:3000

# ENS Verification (separate feature)
SIGNER_PRIVATE_KEY=0x...
```

### Smart Contracts (`contracts/.env`)

```bash
# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BOB_TESTNET_RPC_URL=https://testnet.rpc.gobob.xyz

# Deployer wallet
DEPLOYER_PRIVATE_KEY=0x...

# Etherscan API keys (for verification)
BASESCAN_API_KEY=your-key
BOBSCAN_API_KEY=your-key

# Contract addresses (filled after deployment)
JOURNAL_PROXY_BASE_SEPOLIA=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
JOURNAL_PROXY_BOB_TESTNET=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8
```

---

## Testing

### Frontend Testing

Manual testing checklist:

```bash
npm run dev

# Test flow:
0. ✓ Wallet connection → auto-triggers SIWE
0a. ✓ Sign SIWE message → get JWT
0b. ✓ Reload page → JWT restored from localStorage
1. ✓ Connect wallet
2. ✓ Write thought → auto-saves after 3 seconds
3. ✓ Select mood emoji
4. ✓ Preview mint (shows SVG)
5. ✓ Switch chains (Base/Bob)
6. ✓ Mint NFT (requires testnet ETH)
7. ✓ View in gallery
8. ✓ Delete ephemeral thought
```

### Smart Contract Testing

```bash
cd contracts
forge test -vvv

# All 28 tests should pass:
# ✓ Initialization tests (3)
# ✓ Minting tests (8)
# ✓ ENS signature verification (9)
# ✓ SVG generation (5)
# ✓ Admin functions (3)
```

### Database Testing

```bash
# Test Supabase connection
npx tsx backend/supabase/test-connection.ts

# Check:
# ✓ Connection successful
# ✓ Can insert thought
# ✓ Can read thought
# ✓ RLS policies working
```

---

## Design Philosophy

**Skeuomorphic Minimalism** - Clean digital interface with subtle textures that evoke physical journaling.

### Colors
- **Paper Cream**: `#F9F7F1` (main background)
- **Soft Black**: `#2D2D2D` (primary text)
- **Leather Brown**: `#8B7355` (accent)

### Typography
- **Lora** (serif) - User-generated journal text
- **Inter** (sans-serif) - UI elements

### Layout
- 8pt grid system
- 680px max content width (centered)
- Generous whitespace

---

## Database Schema

### `thoughts` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wallet_address | text | User's wallet (lowercase) |
| text | text | Journal entry text (max 400 bytes) |
| mood | text | Emoji mood |
| created_at | timestamp | Creation timestamp |
| expires_at | timestamp | Expiry (null if minted) |
| is_minted | boolean | Mint status |
| origin_chain_id | integer | Chain where minted |
| current_chain_id | integer | Current chain (for future bridging) |
| token_id | text | NFT token ID |
| mint_tx_hash | text | Mint transaction hash |
| nft_metadata | jsonb | NFT metadata |

**Indexes**: wallet_address, is_minted, expires_at

### `auth_nonces` table

| Column | Type | Description |
|--------|------|-------------|
| wallet_address | text | Primary key (wallet address) |
| nonce | text | Random 8-character nonce for SIWE |
| expires_at | timestamp | 5-minute expiry for nonce |
| created_at | timestamp | Creation timestamp |

**Purpose**: Temporary storage for SIWE nonces to prevent replay attacks.
**Cleanup**: Automatic via `cleanup_expired_nonces()` function.

### `users` table

| Column | Type | Description |
|--------|------|-------------|
| wallet_address | text | Primary key (lowercase) |
| created_at | timestamp | Account creation timestamp |

**Purpose**: User accounts created on first SIWE authentication.

---

## Row Level Security (RLS) Policies

MintMyMood uses PostgreSQL Row Level Security to enforce per-wallet data isolation. RLS policies verify JWT claims to ensure users can only access their own data.

**How RLS Works with SIWE**:
1. Frontend includes JWT in `Authorization: Bearer <token>` header
2. Supabase extracts JWT claims via `auth.jwt()` function
3. RLS policies compare `auth.jwt()->>'wallet_address'` to row's `wallet_address`
4. Only matching rows are accessible

**Production Policies** (from `006_remove_dev_policies.sql`):

```sql
-- thoughts table: Users can only access their own thoughts
CREATE POLICY "Users can view own thoughts"
  ON thoughts FOR SELECT
  USING (wallet_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Users can insert own thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (wallet_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Users can update own thoughts"
  ON thoughts FOR UPDATE
  USING (wallet_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Users can delete own thoughts"
  ON thoughts FOR DELETE
  USING (wallet_address = auth.jwt()->>'wallet_address');
```

**Migration History**:
- `004_temporary_dev_policies.sql` - Temporary permissive policies for development (REMOVED in Sprint 3.2)
- `006_remove_dev_policies.sql` - Production-ready JWT-based RLS policies (Sprint 3.2)

**Testing RLS**:
```bash
# Test with 2 wallets - each should only see their own thoughts
# Wallet 1: 0xABC...
# Wallet 2: 0xDEF...
# Each signs SIWE, creates thoughts, and verifies isolation
```

**Security**:
- No user can read, insert, update, or delete another user's thoughts
- JWT verification happens at database level (PostgreSQL)
- Even if frontend is compromised, RLS enforces isolation
- Service role key (backend) bypasses RLS for admin operations

---

## Common Authentication Issues

### Issue: "Session expired" immediately after login

**Cause**: JWT_SECRET mismatch between backend and Supabase dashboard

**Fix**:
1. Check `backend/api/.env` → `JWT_SECRET` value
2. Check Supabase Dashboard → Project Settings → API → JWT Settings → JWT Secret
3. Ensure they match exactly (min 32 characters)

### Issue: Infinite re-authentication loop on page reload

**Cause**: `initAuth()` not updating Zustand store

**Fix**: Verify `src/lib/supabase.ts:initAuth()` calls:
1. `setAuthHeader(jwt)` - Updates Supabase client ✅
2. `useAuthStore.getState().setAuth(jwt, walletAddress)` - Updates store ✅

### Issue: Double signature prompts on page reload (React 18 Strict Mode)

**Cause**: Two concurrent authentication attempts with different nonces

**Fix**: Verify `src/hooks/useAuth.ts`:
1. `authenticate` wrapped in `useCallback` (line 63) ✅
2. `authLockRef` check at start of `authenticate()` (lines 65-68) ✅

### Issue: "Failed to save thought" after authentication

**Cause**: User record doesn't exist in `users` table

**Fix**: Verify `backend/api/server.js` creates user on authentication:
```javascript
// Should be in /api/auth/verify endpoint
await supabase.from('users').upsert({
  wallet_address: walletAddress
}, { onConflict: 'wallet_address' });
```

### Issue: Can see other users' thoughts

**Cause**: Production RLS policies not applied

**Fix**: Run migration `006_remove_dev_policies.sql` in Supabase dashboard

### Issue: "Nonce mismatch" error

**Cause**: Trying to reuse an old signature or nonce expired

**Fix**: Nonces are single-use and expire in 5 minutes. Request a fresh nonce and sign again.

---

## Key Files Reference

### Most Important Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/App.tsx` | Main app, routing logic | 300 |
| `src/store/useThoughtStore.ts` | Global state management | 250 |
| `src/components/WritingInterface.tsx` | Writing + auto-save | 200 |
| `src/components/MintPreview.tsx` | Minting flow | 250 |
| `src/hooks/useMintJournalEntry.ts` | Smart contract minting | 150 |
| `contracts/src/OnChainJournal.sol` | Smart contract | 500 |
| `backend/api/server.js` | ENS signature service | 100 |

---

## Tech Stack Deep Dive

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool (fast HMR)
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **wagmi v2**: Web3 React hooks
- **viem**: Ethereum library (TypeScript-first)
- **RainbowKit**: Wallet connection UI
- **Zustand**: Lightweight state management
- **Sonner**: Toast notifications

### Backend
- **Supabase**: PostgreSQL database + auth
- **Express.js**: ENS signature API
- **Rate limiting**: 10 signatures/hour per IP

### Blockchain
- **Foundry**: Smart contract development
- **Solidity 0.8.20**: Contract language
- **OpenZeppelin**: UUPS upgradeable contracts
- **Base Sepolia**: Testnet deployment
- **Bob Testnet**: Testnet deployment

---

## Next Steps

- **Deploy to testnet**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Understand contracts**: See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
- **Contribute**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Questions? Check existing docs or open an issue on GitHub.** 🚀
