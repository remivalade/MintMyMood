/**
 * useAuth Hook - Supabase Native Web3 Authentication
 * Sprint 3.3: SIWE Native Migration
 *
 * This hook uses Supabase's single-call signInWithWeb3() which handles
 * message generation and signing automatically via window.ethereum
 *
 * See: docs/SIWE_IMPLEMENTATION_PLAN.md
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * Authenticate user with SIWE
   * @param address - User's Ethereum wallet address (lowercase)
   */
  const authenticate = async (address: string): Promise<boolean> => {
    if (isAuthenticating) {
      return false;
    }

    setIsAuthenticating(true);

    try {
      toast.info('Please sign the message in your wallet', {
        duration: 10000,
        id: 'siwe-signing',
      });

      // Supabase handles the entire SIWE flow:
      // 1. Generates EIP-4361 message
      // 2. Prompts wallet to sign via window.ethereum
      // 3. Verifies signature
      // 4. Creates session & user in auth.users
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
      });

      toast.dismiss('siwe-signing');

      if (error) {
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error('No session or user returned from Supabase');
      }

      // Profile is automatically created via database trigger (015_auto_create_profile_trigger.sql)
      // Success! The onAuthStateChange listener will update UI state
      toast.success('Successfully authenticated!', {
        description: `Welcome ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      return true;
    } catch (error) {
      console.error('[useAuth] Authentication error:', error);

      let errorMessage = 'Failed to sign in';
      if ((error as Error).message?.includes('User rejected')) {
        errorMessage = 'Signature rejected';
      } else if ((error as Error).message?.includes('expired')) {
        errorMessage = 'Signature expired - please try again';
      }

      toast.error(errorMessage, {
        description: (error as Error).message,
      });

      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[useAuth] Sign out error:', error);
        toast.error('Failed to sign out', {
          description: error.message,
        });
      } else {
        toast.success('Signed out');
      }
    } catch (error) {
      console.error('[useAuth] Sign out error:', error);
    }

    // The onAuthStateChange listener will handle state cleanup
  };

  return {
    authenticate,
    signOut,
    isAuthenticating,
  };
}
