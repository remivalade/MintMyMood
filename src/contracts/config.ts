/**
 * Smart Contract Configuration
 *
 * Contains contract addresses, ABIs, and typed hooks for interacting with OnChainJournal
 */

import { baseSepolia, bobSepolia, inkSepolia, base, bob, ink } from '../config/chains';
import OnChainJournalABI from './OnChainJournal.abi.json';

// Contract addresses from environment variables
const CONTRACTS = {
  // Testnets
  [baseSepolia.id]: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BASE_SEPOLIA as `0x${string}`,
  },
  [bobSepolia.id]: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BOB_SEPOLIA as `0x${string}`,
  },
  [inkSepolia.id]: {
    address: import.meta.env.VITE_JOURNAL_PROXY_INK_SEPOLIA as `0x${string}`,
  },
  // Mainnets
  [base.id]: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BASE as `0x${string}`,
  },
  [bob.id]: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BOB as `0x${string}`,
  },
  [ink.id]: {
    address: import.meta.env.VITE_JOURNAL_PROXY_INK as `0x${string}`,
  },
} as const;

/**
 * Get contract address for a specific chain
 */
export function getContractAddress(chainId: number): `0x${string}` | undefined {
  return CONTRACTS[chainId as keyof typeof CONTRACTS]?.address;
}

/**
 * OnChainJournal Contract Configuration
 * Use this with wagmi hooks
 */
export const onChainJournalContract = {
  abi: OnChainJournalABI,
  address: CONTRACTS,
} as const;

/**
 * Contract ABI export
 */
export { OnChainJournalABI };

/**
 * Type-safe contract addresses
 */
export const CONTRACT_ADDRESSES = CONTRACTS;
