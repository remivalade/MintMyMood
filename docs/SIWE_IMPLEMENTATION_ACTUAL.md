# SIWE Authentication - Actual Implementation (Sprint 3.3)

**Status**: ✅ **COMPLETE**
**Date**: November 4, 2025
**Specification**: EIP-4361 (Sign-In with Ethereum)
**Architecture**: Supabase Native `signInWithWeb3()` + Database Triggers + Direct REST API

---

## Implementation Summary

Sprint 3.3 successfully migrated from custom JWT-based SIWE to Supabase's native Web3 authentication. The implementation differs from the original plan in several key ways due to discoveries during development.

### Key Achievements

✅ **~500 lines of authentication code removed**
✅ **Production-grade security** via Supabase
✅ **Automatic session management** and token refresh
✅ **Database trigger** for automatic profile creation
✅ **Direct REST API workaround** for profile fetching
✅ **Wallet disconnect** triggers Supabase sign out

---

## Key Differences from Original Plan

### 1. Database Trigger for Profile Creation

**Original Plan**: Manual `upsert()` call in `useAuth.ts` after authentication.

**Actual Implementation**: Postgres trigger automatically creates profile when user signs in.

**Why**: Eliminates race condition between `signInWithWeb3()` completing and manual profile creation. The trigger fires atomically when Supabase creates the `auth.users` entry.

**Migration**: `015_auto_create_profile_trigger.sql`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, wallet_address, ens_name)
  VALUES (
    NEW.id,
    LOWER(NEW.raw_user_meta_data->'custom_claims'->>'address'),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Critical Detail**: Supabase Web3 auth stores wallet address at `raw_user_meta_data.custom_claims.address`, **NOT** `raw_user_meta_data.wallet_address`.

### 2. Direct REST API Instead of Supabase Client

**Original Plan**: Use `supabase.from('profiles').select()...` query builder.

**Actual Implementation**: Direct `fetch()` calls to Supabase's REST API.

**Why**: The Supabase JS client's query builder was **not sending HTTP requests** when the session came from `onAuthStateChange` with Web3 auth. This appears to be a bug or edge case in the Supabase SDK.

**Code**: `src/store/useAuthStore.ts:104-118`

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${session.user.id}&select=wallet_address`;

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
const profile = data[0]; // PostgREST returns array
const walletAddress = profile?.wallet_address || null;
```

### 3. No getSession() Call on Initialization

**Original Plan**: Call `supabase.auth.getSession()` first, then set up `onAuthStateChange` listener.

**Actual Implementation**: Rely **entirely** on `onAuthStateChange`.

**Why**: `getSession()` was **hanging indefinitely** when used with Supabase Web3 auth. The promise never resolved. `onAuthStateChange` fires `INITIAL_SESSION` event reliably for session restoration.

**Code**: `src/store/useAuthStore.ts:64-67`

```typescript
// Listen for auth changes (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
// NOTE: We rely ENTIRELY on onAuthStateChange, not getSession()
// This is because Supabase Web3 auth uses a session storage mechanism that
// onAuthStateChange handles reliably, but getSession() may hang.
```

### 4. Single-Call signInWithWeb3()

**Original Plan**: Two-step flow (get message, sign message, verify signature).

**Actual Implementation**: Supabase handles **everything internally** in one call.

**Code**: `src/hooks/useAuth.ts:40-42`

```typescript
// Supabase handles the entire SIWE flow:
// 1. Generates EIP-4361 message
// 2. Prompts wallet to sign via window.ethereum
// 3. Verifies signature
// 4. Creates session & user in auth.users
const { data, error } = await supabase.auth.signInWithWeb3({
  chain: 'ethereum',
});
```

**Why**: Supabase's native implementation is simpler and handles the wallet prompting automatically.

### 5. Wallet Disconnect → Supabase Sign Out

**Original Plan**: Not specified.

**Actual Implementation**: When RainbowKit disconnects wallet, we also call `supabase.auth.signOut()`.

**Code**: `src/components/ConnectButton.tsx:27-32`

```typescript
// Handle wallet disconnect → sign out from Supabase
useEffect(() => {
  if (wasConnected.current && !isConnected && isAuthenticated) {
    signOut();
  }
  wasConnected.current = isConnected;
}, [isConnected, isAuthenticated, signOut]);
```

**Why**: Prevents session mismatch when user disconnects wallet but Supabase session remains active.

---

## Final Architecture

### Authentication Flow

```
1. User connects wallet (RainbowKit + wagmi)
   ↓
2. ConnectButton detects wallet connection
   Auto-triggers authenticate(address)
   ↓
3. useAuth.authenticate() calls supabase.auth.signInWithWeb3()
   Supabase prompts wallet signature via window.ethereum
   ↓
4. User signs EIP-4361 message in wallet
   ↓
5. Supabase verifies signature server-side
   Creates entry in auth.users table
   ↓
6. Database trigger fires automatically
   Creates profile in public.profiles table
   ↓
7. onAuthStateChange fires SIGNED_IN event
   ↓
8. useAuthStore fetches profile via direct REST API
   Updates global state with session + wallet address
   ↓
9. UI shows "Authenticated" badge
```

### Session Restoration Flow

```
1. Page loads
   ↓
2. useAuthStore.initialize() sets up onAuthStateChange listener
   ↓
3. Supabase fires INITIAL_SESSION event with restored session
   (session stored in localStorage by Supabase)
   ↓
4. useAuthStore fetches profile via direct REST API
   ↓
5. UI shows "Authenticated" immediately (no signature prompt)
```

### Sign Out Flow

```
1. User disconnects wallet in RainbowKit
   ↓
2. ConnectButton detects disconnect
   Calls signOut()
   ↓
3. supabase.auth.signOut() clears session
   ↓
4. onAuthStateChange fires SIGNED_OUT event
   ↓
5. useAuthStore clears all state
   ↓
6. UI updates to unauthenticated state
```

---

## File Structure

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/supabase.ts` | Added auth config options |
| `src/store/useAuthStore.ts` | Complete rewrite - direct REST API + onAuthStateChange only |
| `src/hooks/useAuth.ts` | Simplified to single `signInWithWeb3()` call |
| `src/components/ConnectButton.tsx` | Added disconnect-to-signout flow |

### New Files

| File | Purpose |
|------|---------|
| `backend/supabase/migrations/015_auto_create_profile_trigger.sql` | Auto-create profile on user sign-in |

### Deleted Files

None (kept for backward compatibility during migration).

---

## Database Changes

### Migration: 015_auto_create_profile_trigger.sql

**Purpose**: Automatically create profile when user signs in via Web3.

**Key Points**:
- Trigger fires AFTER INSERT on `auth.users`
- Extracts wallet address from `raw_user_meta_data->'custom_claims'->>'address'`
- Uses `ON CONFLICT DO NOTHING` for safety
- Function is `SECURITY DEFINER` to bypass RLS

---

## Testing Results

| Test | Result | Notes |
|------|--------|-------|
| First-time authentication | ✅ PASS | Signs message, creates session, profile auto-created |
| Session restoration | ✅ PASS | No signature on refresh, authenticated immediately |
| Duplicate fetch prevention | ✅ PASS | INITIAL_SESSION skipped after SIGNED_IN |
| Sign out | ✅ PASS | Wallet disconnect triggers Supabase sign out |
| Re-authentication | ✅ PASS | Sign out → reconnect → sign → authenticated |
| Wallet switching | ✅ PASS | Different wallets get separate user IDs |
| RLS isolation | ✅ PASS | Each wallet only sees own data |

---

## Known Issues & Workarounds

### Issue 1: Supabase Client Query Builder Not Firing

**Symptoms**: `supabase.from('profiles').select()...` creates promise but never sends HTTP request.

**Root Cause**: Unclear - appears to be edge case with Web3 auth sessions.

**Workaround**: Direct `fetch()` to Supabase REST API with manual Authorization header.

**Impact**: Minimal - works perfectly, just bypasses SDK layer.

### Issue 2: getSession() Hangs

**Symptoms**: `supabase.auth.getSession()` promise never resolves.

**Root Cause**: Web3 auth session storage mechanism not compatible with getSession().

**Workaround**: Rely entirely on `onAuthStateChange` which fires `INITIAL_SESSION` event.

**Impact**: None - onAuthStateChange is more reliable for real-time updates anyway.

### Issue 3: ENS Not Stored in Profile

**Status**: 🔍 **TO INVESTIGATE**

**Observation**: Profile table has `ens_name` column but it's always NULL.

**Likely Cause**: Database trigger doesn't extract ENS from `raw_user_meta_data`.

**Next Step**: Check if Supabase Web3 auth includes ENS in metadata, or if we need to resolve it separately.

---

## Performance Considerations

### Optimizations Implemented

1. **Duplicate fetch prevention**: Skip INITIAL_SESSION if SIGNED_IN already processed
2. **Retry logic**: 3 retries with exponential backoff (500ms, 1000ms, 1500ms) for profile fetch
3. **Guard flags**: Prevent duplicate authentication triggers from React Strict Mode

### Network Requests

- **First-time auth**: 2 requests (signInWithWeb3, fetch profile)
- **Session restoration**: 1 request (fetch profile)
- **Sign out**: 1 request (signOut)

---

## Security Notes

### RLS Policies

All RLS policies use `auth.uid()` which securely reads the user ID from Supabase's JWT:

```sql
CREATE POLICY "Users can view own thoughts"
  ON public.thoughts FOR SELECT
  USING (auth.uid() = user_id);
```

### Token Management

- Supabase manages all JWT issuance and refresh
- Access tokens auto-refresh before expiry
- Sessions persist in localStorage (Supabase default)

### SIWE Verification

- Supabase verifies EIP-4361 signatures server-side
- No custom signature verification needed
- Replay protection handled by Supabase

---

## Future Improvements

1. **Investigate ENS storage**: Determine if ENS can be auto-populated in profile
2. **Add offline support**: Cache profile data for offline access
3. **Optimize bundle size**: Consider lazy-loading auth components
4. **Add session timeout UI**: Show warning before session expires

---

## References

- [Supabase Web3 Auth Documentation](https://supabase.com/docs/guides/auth/auth-web3)
- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**Sprint 3.3 Complete**: All core authentication functionality working in production. ✅
