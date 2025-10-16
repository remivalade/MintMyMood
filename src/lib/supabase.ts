import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client
 *
 * Singleton client for all database operations
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// =====================================================
// AUTHENTICATION HELPERS
// =====================================================

/**
 * Sign in with wallet address (generates a custom token)
 * This is a placeholder - actual implementation will use SIWE
 * (Sign-In with Ethereum) for proper wallet authentication
 */
export async function signInWithWallet(walletAddress: string): Promise<void> {
  // TODO: Implement proper SIWE authentication
  // For now, we'll use a simple approach for development

  // Set custom claims in JWT
  const { error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        wallet_address: walletAddress.toLowerCase(),
      },
    },
  });

  if (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user's wallet address
 */
export function getCurrentWalletAddress(): string | null {
  const session = supabase.auth.getSession();
  return session ? (session as any).user?.user_metadata?.wallet_address ?? null : null;
}
