# SIWE Authentication Implementation (Supabase Native)

**Status**: 🚧 **IN PROGRESS** - Sprint 3.3
**Specification**: EIP-4361 (Sign-In with Ethereum)
**Architecture**: Supabase Native `signInWithWeb3()`

---

## Overview

MintMyMood uses **Supabase's native SIWE (Sign-In with Ethereum)** implementation to provide secure, wallet-based authentication. This approach leverages Supabase's built-in Web3 authentication, eliminating the need for custom JWT handling while maintaining production-grade security.

### Why SIWE?

**The Problem Without SIWE:**
- Anyone could insert thoughts with any user ID (no proof of ownership)
- No cryptographic verification that users control their claimed wallets
- Database would be vulnerable to impersonation attacks

**The Solution:**
- Users sign an EIP-4361 compliant message to prove wallet ownership
- Supabase Auth verifies the signature and issues a native session JWT
- The Supabase client automatically manages sessions and applies JWT
- RLS policies use `auth.uid()` to enforce per-wallet data isolation
- Only authenticated wallet owners can access their own data

### Key Benefits

✅ **No custom backend needed** for authentication (~500 lines of code removed)
✅ **Production-grade security** via Supabase's battle-tested auth system
✅ **Automatic token refresh** built into Supabase client
✅ **Simpler codebase** with single source of truth via `onAuthStateChange`
✅ **Lower operational costs** - no separate auth server to maintain

---

## Architecture

### Authentication Flow

```
1. User connects wallet (RainbowKit + wagmi)
   ↓
2. Frontend calls supabase.auth.signInWithWeb3()
   ← { message: "EIP-4361 message with Supabase nonce..." }
   ↓
3. Frontend prompts user to sign message (using wagmi's signMessageAsync)
   User signs with their wallet
   ↓
4. Frontend sends signature back to Supabase
   POST supabase.auth.signInWithWeb3({ message, signature })
   ↓
5. Supabase Auth server verifies signature
   Creates user in auth.users table
   Issues a secure, native Supabase JWT
   ↓
6. Supabase client automatically stores session
   The onAuthStateChange listener fires
   ↓
7. Zustand auth store is updated with user/session
   UI updates to "Authenticated"
   ↓
8. All Supabase queries automatically include the JWT
   RLS policies use auth.uid() to enforce data isolation
```

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **useAuth Hook** | Frontend authentication logic (wraps `signInWithWeb3`) | `src/hooks/useAuth.ts` |
| **Supabase Client** | Database client (manages its own auth) | `src/lib/supabase.ts` |
| **ConnectButton** | UI component that triggers SIWE | `src/components/ConnectButton.tsx` |
| **Auth Store** | Global auth state (syncs with `onAuthStateChange`) | `src/store/useAuthStore.ts` |

---

## Backend Architecture

### ENS Signature Service (Preserved)

**IMPORTANT**: The backend serves **two separate purposes**:
1. ~~SIWE Authentication~~ ✅ **REPLACED by Supabase native auth**
2. **ENS Signature Verification** ⚠️ **MUST BE PRESERVED**

The ENS signature service is **completely separate from authentication** and is **required for minting functionality**.

#### Purpose of ENS Signatures

When a user mints a thought as an NFT:
- The smart contract needs to verify the user owns their claimed ENS name
- Backend signs the mint request with a trusted signer wallet
- Smart contract verifies the ECDSA signature on-chain
- This prevents users from claiming fake ENS names on their NFTs

#### Backend Structure (After Migration)

```javascript
// backend/api/server.js
// Simplified to ONLY handle ENS signatures

const express = require('express');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiter for ENS signatures
const ensLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: 'Too many signature requests, please try again later'
});

// Trusted signer wallet
const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);

// ENS Signature Endpoint (KEEP THIS)
app.post('/api/ens-signature', ensLimiter, async (req, res) => {
  const { address, ensName, nonce } = req.body;

  // Expiry: 5 minutes from now
  const expiry = Math.floor(Date.now() / 1000) + 300;

  // Create hash matching smart contract expectations
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
});

// REMOVED: GET /api/auth/nonce (Supabase handles this)
// REMOVED: POST /api/auth/verify (Supabase handles this)

app.listen(process.env.PORT || 3001);
```

---

## Database Schema

### Table: `auth.users` (Built-in)

This table is automatically managed by Supabase when users sign in with Web3. The `id` (UUID) from this table is used in RLS policies via `auth.uid()`.

**No manual management required** - Supabase creates entries automatically on successful authentication.

### Table: `public.profiles` (New)

Links the secure `auth.users.id` to public data like wallet address.

```sql
-- Migration: 011_create_profiles_table.sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles (for ENS/wallet display)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy: Users can only create their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Table: `public.thoughts` (Updated Schema)

**CRITICAL**: Keep existing schema structure, only change the user identifier.

```sql
-- Migration: 012_update_thoughts_user_id.sql

-- Add new user_id column (don't drop wallet_address yet - for safety)
ALTER TABLE public.thoughts
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_thoughts_user_id ON thoughts(user_id);

-- After migration verified, optionally drop wallet_address
-- ALTER TABLE public.thoughts DROP COLUMN wallet_address;

-- Keep ALL existing columns:
-- id, created_at, text, mood, is_minted, expires_at
-- origin_chain_id, current_chain_id, token_id, contract_address
-- tx_hash, nft_metadata, last_bridge_tx, bridge_count
```

**Schema Notes:**
- ✅ Keep `id` as UUID (NOT BIGINT)
- ✅ Keep `text` column name (NOT `content`)
- ✅ Keep ALL NFT metadata columns for minting functionality
- ✅ Add `user_id` for new auth system
- ⚠️ Optionally keep `wallet_address` temporarily for migration safety

### Tables to Drop (After Migration Complete)

```sql
-- Migration: 013_cleanup_old_auth_tables.sql
-- ONLY run after migration fully verified

DROP TABLE IF EXISTS auth_nonces;  -- No longer needed
DROP TABLE IF EXISTS users;         -- Replaced by auth.users + profiles
```

---

## Row Level Security (RLS)

### Updated RLS Policies

Policies are simpler and more secure using `auth.uid()` which comes directly from the trusted Supabase JWT.

```sql
-- Migration: 014_update_rls_policies.sql

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can insert their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can update their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can delete their own thoughts" ON thoughts;

-- Create new auth.uid() based policies
CREATE POLICY "Users can view own thoughts"
  ON public.thoughts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thoughts"
  ON public.thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts"
  ON public.thoughts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts"
  ON public.thoughts FOR DELETE
  USING (auth.uid() = user_id);

-- Keep service role policy for cleanup functions
CREATE POLICY "Service role can manage all thoughts"
  ON public.thoughts FOR ALL
  USING (auth.role() = 'service_role');
```

**How it works:**
- User authenticates via `signInWithWeb3`
- Supabase issues a JWT with `sub` (subject) claim containing `auth.users.id`
- `auth.uid()` securely reads this `sub` claim from the JWT
- RLS compares it to the `user_id` column in the thoughts table
- Only rows where `auth.uid()` matches `user_id` are accessible

---

## Frontend Implementation

### File: `src/lib/supabase.ts` (Simplified)

The Supabase client is greatly simplified. We let the client manage its own session persistence and token refreshing.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ONE client instance
// Uses default auth settings - client manages session automatically
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// REMOVED: setAuthHeader() - not needed
// REMOVED: setAuthJWT() - not needed
// REMOVED: signOut() - use supabase.auth.signOut() instead
// REMOVED: initAuth() - replaced by useAuthStore.initialize()
```

### File: `src/store/useAuthStore.ts` (Rewritten)

The auth store is now the source of truth, driven by Supabase's built-in auth events.

```typescript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  walletAddress: null,
  isAuthenticated: false,

  initialize: () => {
    // 1. Check for an active session when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      const walletAddress = session?.user?.user_metadata?.wallet_address || null;
      set({
        session,
        user: session?.user ?? null,
        walletAddress,
        isAuthenticated: !!session
      });
    });

    // 2. Listen for auth changes (SIGN_IN, SIGN_OUT, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const walletAddress = session?.user?.user_metadata?.wallet_address || null;
        set({
          session,
          user: session?.user ?? null,
          walletAddress,
          isAuthenticated: !!session
        });
      }
    );

    // Cleanup listener on app unmount (if needed)
    // return () => authListener?.subscription.unsubscribe();
  },
}));
```

### File: `src/hooks/useAuth.ts` (Rewritten)

The `useAuth` hook is much simpler, orchestrating the two-step `signInWithWeb3` flow.

```typescript
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSignMessage } from 'wagmi';
import { toast } from 'sonner';

export function useAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { signMessageAsync } = useSignMessage();

  const authenticate = async (address: string) => {
    if (isAuthenticating) {
      console.log('⚠️ Authentication already in progress');
      return false;
    }

    setIsAuthenticating(true);

    try {
      // Step 1: Request the EIP-4361 message from Supabase Auth
      const { data: messageData, error: nonceError } =
        await supabase.auth.signInWithWeb3({
          chain: 'ethereum',
        });

      if (nonceError || !messageData) {
        throw nonceError || new Error('No message received from Supabase');
      }

      const messageToSign = messageData.message;

      toast.info('Please sign the message in your wallet');

      // Step 2: Prompt user to sign the message
      const signature = await signMessageAsync({ message: messageToSign });

      // Step 3: Verify the signature with Supabase Auth
      const { data, error: verifyError } = await supabase.auth.signInWithWeb3({
        message: messageToSign,
        signature,
      });

      if (verifyError) throw verifyError;

      // Step 4: Create profile (CRITICAL - not optional!)
      if (data.session && address) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.session.user.id,
              wallet_address: address.toLowerCase()
            },
            { onConflict: 'id' }
          );

        if (profileError) {
          console.error('Failed to create profile:', profileError);
          // Rollback auth on profile creation failure
          await supabase.auth.signOut();
          throw new Error('Profile creation failed');
        }
      }

      toast.success('Authentication successful!');

      // Success! The onAuthStateChange listener will update UI
      return true;

    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to authenticate', {
        description: (error as Error).message,
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.info('Signed out successfully');
  };

  return { authenticate, signOut, isAuthenticating };
}
```

### File: `src/components/ConnectButton.tsx` (Simplified)

The ConnectButton logic is simpler - it only cares if a wallet is connected but the user isn't authenticated.

```typescript
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';

export function ConnectButton() {
  const { authenticate, isAuthenticating } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const { address, isConnected } = useAccount();

  // Auto-trigger SIWE when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      authenticate(address);
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating, authenticate]);

  // UI renders authentication status
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openConnectModal }) => (
        <div>
          {isAuthenticating && <Badge>Signing...</Badge>}
          {isAuthenticated && <Badge>Authenticated</Badge>}
          {/* ... rest of UI */}
        </div>
      )}
    </RainbowConnectButton.Custom>
  );
}
```

### File: `src/App.tsx` (Session Restoration)

Initialize the auth store listener when the app first loads.

```typescript
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  // Restore session and listen for auth changes
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // ... rest of app
}
```

### File: `src/store/useThoughtStore.ts` (Updated Queries)

Update queries to use `user_id` instead of `wallet_address`.

```typescript
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export const useThoughtStore = create<ThoughtState>((set, get) => ({
  thoughts: [],

  fetchThoughts: async () => {
    try {
      const { user } = useAuthStore.getState();

      if (!user?.id) {
        console.warn('No authenticated user');
        return;
      }

      // Query using user_id instead of wallet_address
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)  // Changed from wallet_address
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ thoughts: data || [] });
    } catch (error) {
      console.error('Failed to fetch thoughts:', error);
    }
  },

  saveThought: async (thought: Partial<Thought>) => {
    try {
      const { user } = useAuthStore.getState();

      if (!user?.id) {
        throw new Error('Must be authenticated to save thoughts');
      }

      const { data, error } = await supabase
        .from('thoughts')
        .insert({
          ...thought,
          user_id: user.id,  // Use user_id from auth
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set(state => ({ thoughts: [data, ...state.thoughts] }));

      return data;
    } catch (error) {
      console.error('Failed to save thought:', error);
      throw error;
    }
  },

  // ... rest of CRUD operations updated similarly
}));
```

### Files to Delete

After migration is complete and tested:
- ❌ `src/lib/supabaseHelper.ts` - No longer needed
- ❌ Old `useAuth.ts` implementation with custom JWT logic

---

## Environment Variables

### Backend (`backend/api/.env`)

Simplified to only ENS signature service:

```bash
# ENS Signature Service
SIGNER_PRIVATE_KEY=0x...  # Trusted signer wallet
PORT=3001
FRONTEND_URL=http://localhost:3000

# REMOVED: JWT_SECRET (Supabase manages this)
# REMOVED: SUPABASE_URL (no longer accessing DB from backend)
# REMOVED: SUPABASE_SERVICE_ROLE_KEY (no longer accessing DB from backend)
```

### Frontend (`/.env`)

No changes needed:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API (for ENS signatures only)
VITE_BACKEND_URL=http://localhost:3001

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

---

## Migration Checklist

### Phase 1: Database Migration

- [ ] **Backup database** (critical!)
- [ ] Run migration `011_create_profiles_table.sql`
- [ ] Run migration `012_update_thoughts_user_id.sql`
- [ ] Run migration `014_update_rls_policies.sql`
- [ ] Test RLS policies work with `auth.uid()`
- [ ] Run migration `013_cleanup_old_auth_tables.sql` (after testing)

### Phase 2: Backend Cleanup

- [ ] Remove all SIWE auth endpoints from `server.js`
- [ ] Keep only `/api/ens-signature` endpoint
- [ ] Remove Supabase client imports
- [ ] Remove JWT signing dependencies
- [ ] Update CORS settings
- [ ] Test ENS signature endpoint still works

### Phase 3: Frontend Migration

- [ ] Simplify `src/lib/supabase.ts`
- [ ] Rewrite `src/store/useAuthStore.ts`
- [ ] Rewrite `src/hooks/useAuth.ts`
- [ ] Update `src/App.tsx` with `initialize()`
- [ ] Simplify `src/components/ConnectButton.tsx`
- [ ] Update `src/store/useThoughtStore.ts` queries
- [ ] Delete `src/lib/supabaseHelper.ts`

### Phase 4: Testing

- [ ] Test first-time authentication + profile creation
- [ ] Test session restoration on page reload
- [ ] Test gallery access (RLS working)
- [ ] Test thought CRUD operations
- [ ] Test minting with ENS signatures
- [ ] Test sign out functionality
- [ ] Test wallet switching
- [ ] Test with 2+ wallets (RLS isolation)

### Phase 5: Documentation

- [ ] Update `README.md`
- [ ] Update `DEVELOPER_GUIDE.md`
- [ ] Update `QUICK_START.md`
- [ ] Update environment variable docs

---

## Testing Checklist

### Manual Testing

- [ ] **First-time authentication**: Connect wallet → Sign message → See "Authenticated" badge → Profile created in DB
- [ ] **Page reload**: Refresh page → No signature prompt → Stays authenticated (session restored)
- [ ] **Gallery access**: Navigate to `/gallery` → See only own thoughts (RLS working)
- [ ] **Thought creation**: Create thought → Saves to database → Appears in gallery
- [ ] **Minting**: Mint thought → ENS signature obtained → Contract call succeeds → NFT created
- [ ] **Sign out**: Click sign out → Authentication cleared → Can't access protected routes
- [ ] **Wallet switch**: Switch wallets → Triggers re-authentication → New profile/session

### Security Testing

- [ ] **RLS isolation**: Test with 2 wallets → Each sees only their own thoughts
- [ ] **Profile uniqueness**: Try to create duplicate profile → Should fail
- [ ] **Unauthorized access**: Try to query another user's data → Should fail RLS
- [ ] **ENS verification**: Mint with ENS → Verify signature works → Check on-chain data

---

## Troubleshooting

### Issue: "User is logged in, but I can't see my data"

**Cause**: RLS policies still using old `wallet_address` check.

**Fix**: Verify migration `014_update_rls_policies.sql` was applied. Policies should use `auth.uid() = user_id`.

### Issue: "Auth state is not updating in the UI"

**Cause**: `onAuthStateChange` listener not set up correctly.

**Fix**: Verify `useAuthStore.initialize()` is called in `App.tsx` on mount.

### Issue: "Profile creation failed" error

**Cause**: Foreign key constraint or duplicate wallet address.

**Fix**: Check that `auth.users` entry exists before profile creation. Verify wallet address is lowercase.

### Issue: "Minting broken - no signature"

**Cause**: Backend ENS endpoint removed during migration.

**Fix**: Verify `backend/api/server.js` still has `/api/ens-signature` endpoint and is running.

---

## Key Differences from Custom JWT Approach

| Aspect | Custom JWT (Old) | Supabase Native (New) |
|--------|------------------|------------------------|
| **Nonce Generation** | Custom backend endpoint | Supabase Auth handles internally |
| **Signature Verification** | Custom SIWE library in backend | Supabase Auth verifies |
| **JWT Issuance** | Manual signing with HS256 | Supabase issues RS256 JWT |
| **Session Management** | Manual localStorage | Supabase client handles automatically |
| **Token Refresh** | Manual (24h expiry, no refresh) | Automatic token refresh |
| **Backend Required** | Yes (for auth + ENS) | Only for ENS signatures |
| **RLS Policies** | `auth.jwt()->>'wallet_address'` | `auth.uid()` |
| **Code Complexity** | ~500 lines | ~100 lines |
| **Security** | Custom implementation | Battle-tested Supabase Auth |

---

## References

- [Supabase Web3 Auth Documentation](https://supabase.com/docs/guides/auth/web3)
- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [wagmi useSignMessage Hook](https://wagmi.sh/react/hooks/useSignMessage)
- [Supabase Auth Events](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#auth-helpers)
