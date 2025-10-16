/**
 * Smart Contract Addresses and ABIs
 *
 * This file will be updated with actual addresses after contract deployment
 */

export interface ContractConfig {
  address: `0x${string}`;
  abi: any; // Will be replaced with actual ABI type
}

// =====================================================
// CONTRACT ADDRESSES
// =====================================================

// Testnet addresses (Base Sepolia, Bob Sepolia)
export const TESTNET_CONTRACTS: Record<number, ContractConfig> = {
  // Base Sepolia (84532)
  84532: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BASE_SEPOLIA as `0x${string}`,
    abi: [], // Will add ABI after contract is compiled
  },

  // Bob Sepolia (808813)
  808813: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BOB_SEPOLIA as `0x${string}`,
    abi: [], // Will add ABI after contract is compiled
  },
};

// Mainnet addresses (Base, Bob)
export const MAINNET_CONTRACTS: Record<number, ContractConfig> = {
  // Base (8453)
  8453: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BASE as `0x${string}`,
    abi: [], // Will add ABI after contract is compiled
  },

  // Bob (60808)
  60808: {
    address: import.meta.env.VITE_JOURNAL_PROXY_BOB as `0x${string}`,
    abi: [], // Will add ABI after contract is compiled
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getContractConfig(chainId: number): ContractConfig | undefined {
  const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
  const contracts = isProduction ? MAINNET_CONTRACTS : TESTNET_CONTRACTS;
  return contracts[chainId];
}

export function isContractDeployed(chainId: number): boolean {
  const config = getContractConfig(chainId);
  return !!config?.address && config.address !== '0x' && config.address !== undefined;
}

// =====================================================
// CONTRACT METHODS (to be used with wagmi hooks)
// =====================================================

export const CONTRACT_FUNCTIONS = {
  // Minting
  MINT: 'mint',

  // Bridging (LayerZero)
  SEND_FROM: 'sendFrom',
  ESTIMATE_SEND_FEE: 'estimateSendFee',

  // View functions
  TOKEN_URI: 'tokenURI',
  OWNER_OF: 'ownerOf',
  BALANCE_OF: 'balanceOf',

  // UUPS Upgrade (admin only)
  UPGRADE_TO: 'upgradeTo',
} as const;

// =====================================================
// PLACEHOLDER ABI
// =====================================================

// This will be replaced with actual ABI from compiled contract
// For now, it's a placeholder to prevent TypeScript errors

export const ONCHAIN_JOURNAL_ABI = [
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'text', type: 'string' },
      { name: 'mood', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // More functions will be added after contract compilation
] as const;
