import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Thought, UserStats } from '../types';

/**
 * Zustand Store for Thought Management
 *
 * Handles all state related to thoughts (ephemeral and minted)
 */

interface ThoughtStore {
  // State
  thoughts: Thought[];
  currentThought: Partial<Thought>;
  selectedThought: Thought | null;
  isLoading: boolean;
  error: string | null;
  stats: UserStats | null;

  // Actions
  fetchThoughts: (walletAddress: string) => Promise<void>;
  saveThought: (thought: Partial<Thought>) => Promise<Thought | null>;
  updateThought: (id: string, updates: Partial<Thought>) => Promise<void>;
  deleteThought: (id: string) => Promise<void>;
  setCurrentThought: (thought: Partial<Thought>) => void;
  setSelectedThought: (thought: Thought | null) => void;
  clearCurrentThought: () => void;
  fetchStats: (walletAddress: string) => Promise<void>;

  // Mint-specific actions
  markAsMinted: (
    thoughtId: string,
    chainId: number,
    tokenId: string,
    contractAddress: string,
    txHash: string
  ) => Promise<void>;

  // Bridge-specific actions
  updateAfterBridge: (
    thoughtId: string,
    newChainId: number,
    newContractAddress: string,
    bridgeTxHash: string
  ) => Promise<void>;
}

export const useThoughtStore = create<ThoughtStore>((set, get) => ({
  // Initial state
  thoughts: [],
  currentThought: {},
  selectedThought: null,
  isLoading: false,
  error: null,
  stats: null,

  // Fetch all thoughts for a wallet
  fetchThoughts: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ thoughts: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching thoughts:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Save a new thought (or update existing draft)
  saveThought: async (thought: Partial<Thought>) => {
    set({ isLoading: true, error: null });
    try {
      const thoughtData = {
        wallet_address: thought.wallet_address!.toLowerCase(),
        text: thought.text!,
        mood: thought.mood!,
        is_minted: thought.is_minted ?? false,
        expires_at: thought.expires_at || new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min default
      };

      // If thought has an id, update it; otherwise insert
      if (thought.id) {
        const { data, error } = await supabase
          .from('thoughts')
          .update(thoughtData)
          .eq('id', thought.id)
          .select()
          .single();

        if (error) throw error;

        // Update in local state
        set(state => ({
          thoughts: state.thoughts.map(t => t.id === data.id ? data : t),
          isLoading: false,
        }));

        return data;
      } else {
        const { data, error } = await supabase
          .from('thoughts')
          .insert(thoughtData)
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        set(state => ({
          thoughts: [data, ...state.thoughts],
          isLoading: false,
        }));

        return data;
      }
    } catch (error: any) {
      console.error('Error saving thought:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Update existing thought
  updateThought: async (id: string, updates: Partial<Thought>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('thoughts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set(state => ({
        thoughts: state.thoughts.map(t => t.id === id ? { ...t, ...updates } : t),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating thought:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Delete a thought
  deleteThought: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      set(state => ({
        thoughts: state.thoughts.filter(t => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error deleting thought:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Set current thought (for create/edit flow)
  setCurrentThought: (thought: Partial<Thought>) => {
    set({ currentThought: thought });
  },

  // Set selected thought (for detail view)
  setSelectedThought: (thought: Thought | null) => {
    set({ selectedThought: thought });
  },

  // Clear current thought
  clearCurrentThought: () => {
    set({ currentThought: {} });
  },

  // Fetch user stats
  fetchStats: async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { user_wallet_address: walletAddress.toLowerCase() });

      if (error) throw error;

      set({ stats: data });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  },

  // Mark thought as minted
  markAsMinted: async (
    thoughtId: string,
    chainId: number,
    tokenId: string,
    contractAddress: string,
    txHash: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .rpc('update_thought_after_mint', {
          thought_id: thoughtId,
          p_origin_chain_id: chainId,
          p_token_id: tokenId,
          p_contract_address: contractAddress,
          p_tx_hash: txHash,
        });

      if (error) throw error;

      // Update local state
      set(state => ({
        thoughts: state.thoughts.map(t =>
          t.id === thoughtId
            ? {
                ...t,
                is_minted: true,
                origin_chain_id: chainId,
                current_chain_id: chainId,
                token_id: tokenId,
                contract_address: contractAddress,
                tx_hash: txHash,
              }
            : t
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error marking as minted:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Update thought after bridging
  updateAfterBridge: async (
    thoughtId: string,
    newChainId: number,
    newContractAddress: string,
    bridgeTxHash: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .rpc('update_thought_after_bridge', {
          thought_id: thoughtId,
          new_chain_id: newChainId,
          new_contract_address: newContractAddress,
          bridge_tx_hash: bridgeTxHash,
        });

      if (error) throw error;

      // Update local state
      set(state => ({
        thoughts: state.thoughts.map(t =>
          t.id === thoughtId
            ? {
                ...t,
                current_chain_id: newChainId,
                contract_address: newContractAddress,
                last_bridge_tx: bridgeTxHash,
                bridge_count: t.bridge_count + 1,
              }
            : t
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating after bridge:', error);
      set({ error: error.message, isLoading: false });
    }
  },
}));
