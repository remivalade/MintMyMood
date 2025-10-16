/**
 * TypeScript Type Definitions
 */

// =====================================================
// DATABASE TYPES
// =====================================================

export interface Thought {
  id: string;
  wallet_address: string;
  text: string;
  mood: string; // Emoji only
  created_at: string;
  updated_at: string;
  expires_at: string;
  is_minted: boolean;

  // Chain & NFT data (null if not minted)
  origin_chain_id: number | null;
  current_chain_id: number | null;
  token_id: string | null;
  contract_address: string | null;
  tx_hash: string | null;

  // Bridge tracking
  last_bridge_tx: string | null;
  bridge_count: number;
}

export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// UI TYPES
// =====================================================

export type View = 'writing' | 'gallery' | 'mood' | 'preview' | 'detail' | 'bridge';

export interface MoodOption {
  label: string;
  emoji: string;
  value: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { label: 'Peaceful', emoji: '😌', value: 'peaceful' },
  { label: 'Reflective', emoji: '💭', value: 'reflective' },
  { label: 'Inspired', emoji: '✨', value: 'inspired' },
  { label: 'Melancholic', emoji: '🌙', value: 'melancholic' },
  { label: 'Passionate', emoji: '🔥', value: 'passionate' },
  { label: 'Growing', emoji: '🌱', value: 'growing' },
  { label: 'Dreamy', emoji: '💫', value: 'dreamy' },
  { label: 'Energized', emoji: '⚡', value: 'energized' },
];

export function getMoodEmoji(moodValue: string): string {
  return MOOD_OPTIONS.find(m => m.value === moodValue)?.emoji ?? '💭';
}

export function getMoodLabel(moodValue: string): string {
  return MOOD_OPTIONS.find(m => m.value === moodValue)?.label ?? 'Reflective';
}

// =====================================================
// TRANSACTION TYPES
// =====================================================

export type TransactionStatus =
  | 'idle'
  | 'preparing'
  | 'waiting_approval'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'error';

export interface MintTransaction {
  status: TransactionStatus;
  txHash?: string;
  tokenId?: string;
  error?: string;
}

export interface BridgeTransaction {
  status: TransactionStatus;
  txHash?: string;
  fromChainId: number;
  toChainId: number;
  layerZeroMessageId?: string;
  error?: string;
}

// =====================================================
// STATS TYPES
// =====================================================

export interface UserStats {
  total_thoughts: number;
  minted_thoughts: number;
  ephemeral_thoughts: number;
  total_bridges: number;
  chains_used: number;
  oldest_thought: string | null;
  newest_thought: string | null;
}
