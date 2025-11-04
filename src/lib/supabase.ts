/**
 * Supabase Client - Native Web3 Auth
 * Sprint 3.3: SIWE Native Migration
 *
 * Simplified client using Supabase's built-in auth system.
 * No custom JWT management needed - Supabase handles everything!
 *
 * Features:
 * - Automatic session persistence in localStorage
 * - Automatic token refresh
 * - Built-in onAuthStateChange listener
 *
 * See: docs/SIWE_IMPLEMENTATION_PLAN.md
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env'
  );
}

/**
 * Single Supabase client instance
 *
 * This client automatically:
 * - Manages session persistence in localStorage
 * - Refreshes tokens when they expire
 * - Includes auth token in all requests
 * - Fires onAuthStateChange events
 *
 * No manual JWT management needed!
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Don't detect PKCE flow (we're using Web3)
    storageKey: 'sb-auth-token', // Explicit storage key
  },
  global: {
    headers: {
      'x-client-info': 'mintmymood-web3-auth',
    },
  },
});
