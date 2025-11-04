/**
 * Authentication Store - Supabase Native Web3 Auth
 * Sprint 3.3: SIWE Native Migration
 *
 * This store is the source of truth for auth state.
 * It's initialized by listening to Supabase's built-in auth events.
 *
 * Key Features:
 * - Syncs with Supabase onAuthStateChange listener
 * - Automatically restores sessions from localStorage
 * - Provides wallet_address derived from profiles table
 *
 * See: docs/SIWE_IMPLEMENTATION_PLAN.md
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Track if session is being restored

  // Actions
  initialize: () => void;
}

// Flag to prevent multiple initializations (React Strict Mode causes double mounting)
let isInitialized = false;
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  session: null,
  user: null,
  walletAddress: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading while checking for session

  /**
   * Initialize the auth store
   * Call this in App.tsx on mount
   *
   * Steps:
   * 1. Check for active session in localStorage (Supabase manages this)
   * 2. Fetch wallet_address from profiles table if session exists
   * 3. Listen for future auth changes (SIGN_IN, SIGN_OUT, etc.)
   */
  initialize: () => {
    // Guard: Prevent multiple initializations
    if (isInitialized) {
      console.log('[useAuthStore] Already initialized, skipping...');
      return;
    }

    isInitialized = true;
    console.log('[useAuthStore] Initializing auth store...');

    // Listen for auth changes (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    // NOTE: We rely ENTIRELY on onAuthStateChange, not getSession()
    // This is because Supabase Web3 auth uses a session storage mechanism that
    // onAuthStateChange handles reliably, but getSession() may hang.
    // Clean up previous subscription if it exists
    if (authSubscription) {
      console.log('[useAuthStore] Cleaning up previous auth subscription...');
      authSubscription.unsubscribe();
    }

    // Track if we've already processed a session to avoid duplicate fetches
    let hasProcessedSession = false;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[useAuthStore] Auth event: ${event}, session:`, session ? session.user.id : 'null');

        // Handle all session states (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED)
        if (session) {
          // Skip if we've already processed this session (avoid SIGNED_IN + INITIAL_SESSION duplicate)
          if (hasProcessedSession && event === 'INITIAL_SESSION') {
            console.log(`[useAuthStore] Skipping INITIAL_SESSION - already processed SIGNED_IN`);
            return;
          }

          hasProcessedSession = true;

          // User has an active session (either restored, signed in, or token refreshed)
          console.log(`[useAuthStore] Processing session for user: ${session.user.id}`);
          console.log(`[useAuthStore] Fetching profile for user...`);

          // Fetch wallet_address from profiles table
          // Note: Profile might not exist yet during initial sign-in (race condition)
          // We'll retry with increasing delays if needed
          const fetchProfile = async (retryCount = 0): Promise<string | null> => {
            try {
              // WORKAROUND: Direct REST API call since Supabase client queries aren't firing
              // when session comes from onAuthStateChange with Web3 auth
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

              if (!response.ok) {
                console.error(`[useAuthStore] Profile fetch failed: ${response.status}`);
                return null;
              }

              const data = await response.json();

              const profile = data[0]; // PostgREST returns array
              const walletAddress = profile?.wallet_address || null;

              if (walletAddress) {
                return walletAddress;
              }

              // If profile not found and this is INITIAL_SESSION or SIGNED_IN, retry up to 3 times
              // with increasing delays (500ms, 1000ms, 1500ms)
              if (!profile && retryCount < 3 && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                const delay = (retryCount + 1) * 500;
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchProfile(retryCount + 1);
              }

              if (!profile && retryCount >= 3) {
                console.warn('[useAuthStore] Profile not found after 3 retries');
              }

              return null;
            } catch (err) {
              console.error('[useAuthStore] Profile fetch error:', err);
              return null;
            }
          };

          const walletAddress = await fetchProfile();

          set({
            session,
            user: session.user,
            walletAddress,
            isAuthenticated: true,
            isLoading: false, // Auth process complete
          });

        } else {
          // No session (either INITIAL_SESSION with no session, or SIGNED_OUT)
          hasProcessedSession = false; // Reset flag on sign out
          set({
            session: null,
            user: null,
            walletAddress: null,
            isAuthenticated: false,
            isLoading: false, // Loading complete - confirmed no session
          });
        }
      }
    );

    // Store the subscription for cleanup
    authSubscription = authListener.subscription;

    console.log('[useAuthStore] ✅ Auth listener initialized');
  },
}));
