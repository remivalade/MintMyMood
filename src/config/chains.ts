import { defineChain } from 'viem';

/**
 * Chain Configuration for MintMyMood Omnichain
 *
 * Each chain has:
 * - Chain ID and network details
 * - LayerZero endpoint ID (for bridging)
 * - Brand colors (for SVG NFT generation)
 * - Block explorer
 */

// =====================================================
// TESTNET CHAINS
// =====================================================

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
});

export const bobSepolia = defineChain({
  id: 808813, // Bob Sepolia chain ID
  name: 'Bob Sepolia',
  network: 'bob-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://bob-sepolia.rpc.gobob.xyz'],
    },
    public: {
      http: ['https://bob-sepolia.rpc.gobob.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bob Explorer',
      url: 'https://bob-sepolia.explorer.gobob.xyz',
    },
  },
  testnet: true,
});

// =====================================================
// MAINNET CHAINS
// =====================================================

export const base = defineChain({
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
  testnet: false,
});

export const bob = defineChain({
  id: 60808, // Bob mainnet chain ID
  name: 'Bob',
  network: 'bob',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gobob.xyz'],
    },
    public: {
      http: ['https://rpc.gobob.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bob Explorer',
      url: 'https://explorer.gobob.xyz',
    },
  },
  testnet: false,
});

// =====================================================
// CHAIN METADATA
// =====================================================

export interface ChainMetadata {
  chainId: number;
  name: string;
  shortName: string;
  isTestnet: boolean;
  layerZeroEndpointId: number;
  colors: {
    from: string;
    to: string;
  };
  icon?: string;
}

export const CHAIN_METADATA: Record<number, ChainMetadata> = {
  // Base Sepolia
  [baseSepolia.id]: {
    chainId: baseSepolia.id,
    name: 'Base Sepolia',
    shortName: 'Base',
    isTestnet: true,
    layerZeroEndpointId: 40245, // Base Sepolia LZ endpoint
    colors: {
      from: '#0052FF',
      to: '#1E3A8A',
    },
  },

  // Bob Sepolia
  [bobSepolia.id]: {
    chainId: bobSepolia.id,
    name: 'Bob Sepolia',
    shortName: 'Bob',
    isTestnet: true,
    layerZeroEndpointId: 40294, // Bob Sepolia LZ endpoint (verify this!)
    colors: {
      from: '#FF6B35',
      to: '#F7931E',
    },
  },

  // Base Mainnet
  [base.id]: {
    chainId: base.id,
    name: 'Base',
    shortName: 'Base',
    isTestnet: false,
    layerZeroEndpointId: 30184, // Base mainnet LZ endpoint
    colors: {
      from: '#0052FF',
      to: '#1E3A8A',
    },
  },

  // Bob Mainnet
  [bob.id]: {
    chainId: bob.id,
    name: 'Bob',
    shortName: 'Bob',
    isTestnet: false,
    layerZeroEndpointId: 30280, // Bob mainnet LZ endpoint (verify this!)
    colors: {
      from: '#FF6B35',
      to: '#F7931E',
    },
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getChainMetadata(chainId: number): ChainMetadata | undefined {
  return CHAIN_METADATA[chainId];
}

export function isTestnet(chainId: number): boolean {
  return CHAIN_METADATA[chainId]?.isTestnet ?? false;
}

export function getChainColors(chainId: number): { from: string; to: string } {
  return CHAIN_METADATA[chainId]?.colors ?? { from: '#000000', to: '#000000' };
}

export function getLayerZeroEndpointId(chainId: number): number | undefined {
  return CHAIN_METADATA[chainId]?.layerZeroEndpointId;
}

// =====================================================
// EXPORTS FOR WAGMI
// =====================================================

// Export testnet chains for development
export const TESTNET_CHAINS = [baseSepolia, bobSepolia] as const;

// Export mainnet chains for production
export const MAINNET_CHAINS = [base, bob] as const;

// Export all chains
export const ALL_CHAINS = [...TESTNET_CHAINS, ...MAINNET_CHAINS] as const;

// Get chains based on environment
export function getSupportedChains() {
  const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
  return isProduction ? MAINNET_CHAINS : TESTNET_CHAINS;
}
