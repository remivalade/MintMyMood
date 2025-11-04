/**
 * Supabase Query Helper with Auth Error Handling
 * Sprint 3.3: SIWE Native Migration
 *
 * Wraps all Supabase queries to handle auth errors gracefully.
 * Supabase automatically manages session expiry and token refresh.
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * import { dbQuery } from '@/lib/supabaseHelper';
 *
 * async function getThoughts() {
 *   try {
 *     const { data } = await dbQuery(
 *       supabase.from('thoughts').select('*')
 *     );
 *     return data;
 *   } catch (error) {
 *     console.error('Query failed:', error.message);
 *   }
 * }
 * ```
 */

import { supabase } from './supabase';
import { toast } from 'sonner';

/**
 * Wrap all Supabase queries with this helper to handle JWT expiry
 *
 * @param query - Promise from Supabase query (e.g., supabase.from('thoughts').select('*'))
 * @returns Query result with data
 * @throws Error if JWT expired or other error occurs
 */
export async function dbQuery<T = any>(query: Promise<any>): Promise<{ data: T; error: null }> {
  try {
    const result = await query;
    const { data, error, ...rest } = result;

    // Check for JWT expiry / authentication errors
    if (error) {
      const isAuthError =
        error.code === '401' ||
        error.code === 'PGRST301' ||  // PostgREST auth error
        error.message?.includes('JWT') ||
        error.message?.includes('expired') ||
        error.message?.includes('invalid') ||
        error.message?.includes('token');

      if (isAuthError) {
        console.error('🔐 Auth error detected, signing out.');

        // 1. Sign out via Supabase (will trigger onAuthStateChange)
        await supabase.auth.signOut();

        // 2. Show user-friendly toast notification
        toast.error('Session expired', {
          description: 'Please connect your wallet and sign in again.',
          duration: 5000,
        });

        // 3. Throw specific error to stop component logic
        throw new Error('Session expired. Please sign in again.');
      }

      // If it's another error, throw it
      console.error('Database error:', error);
      throw error;
    }

    // If successful, return the data
    return { data, error: null, ...rest };

  } catch (e: any) {
    // Re-throw the error so the component can catch it
    throw e;
  }
}

/**
 * Type-safe version of dbQuery for select queries
 *
 * @param query - Supabase select query
 * @returns Array of data
 */
export async function dbSelect<T = any>(query: Promise<any>): Promise<T[]> {
  const { data } = await dbQuery<T[]>(query);
  return data || [];
}

/**
 * Type-safe version of dbQuery for single row queries
 *
 * @param query - Supabase single() query
 * @returns Single data object or null
 */
export async function dbSingle<T = any>(query: Promise<any>): Promise<T | null> {
  const { data } = await dbQuery<T>(query);
  return data;
}

/**
 * Type-safe version of dbQuery for insert/update/delete operations
 *
 * @param query - Supabase mutation query
 * @returns Mutated data or empty array
 */
export async function dbMutate<T = any>(query: Promise<any>): Promise<T[]> {
  const { data } = await dbQuery<T[]>(query);
  return data || [];
}
