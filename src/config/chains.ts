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

export const inkSepolia = defineChain({
  id: 763373, // Ink Sepolia chain ID
  name: 'Ink Sepolia',
  network: 'ink-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-gel-sepolia.inkonchain.com'],
    },
    public: {
      http: ['https://rpc-gel-sepolia.inkonchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ink Explorer',
      url: 'https://explorer-sepolia.inkonchain.com',
    },
  },
  testnet: true,
});

export const megaethSepolia = defineChain({
  id: 6342, // MegaETH Sepolia chain ID
  name: 'MegaETH Sepolia',
  network: 'megaeth-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://carrot.megaeth.com/rpc'],
    },
    public: {
      http: ['https://carrot.megaeth.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MegaETH Explorer',
      url: 'https://explorer-sepolia.megaeth.com', // Placeholder
    },
  },
  testnet: true,
});

export const hyperliquidSepolia = defineChain({
  id: 998, // HyperLiquid Sepolia chain ID
  name: 'HyperLiquid Sepolia',
  network: 'hyperliquid-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.hyperliquid-testnet.xyz/evm'],
    },
    public: {
      http: ['https://api.hyperliquid-testnet.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperLiquid Explorer',
      url: 'https://explorer-sepolia.hyperliquid.xyz', // Placeholder
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
  // Style properties for SVG generation
  chainColor: string;
  hoverColor?: string;
  background: string;
  textColor: string;
  secondaryColor: string;
  fontFamily: string;
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
}

export const CHAIN_METADATA: Record<number, ChainMetadata> = {
  // Classic (chainId 0 = neutral/default style)
  0: {
    chainId: 0,
    name: 'Classic',
    shortName: 'Classic',
    isTestnet: true,
    layerZeroEndpointId: 0,
    colors: {
      from: '#8B7355',
      to: '#6B5943',
    },
    chainColor: '#8B7355',
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
    textColor: '#2D2D2D',
    secondaryColor: '#5A5A5A',
    fontFamily: 'var(--font-serif)',
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    },
  },

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
    chainColor: '#0000ff',
    background: 'linear-gradient(135deg, #e6f0ff 0%, #cce0ff 50%, #99c2ff 100%)',
    textColor: '#001a4d',
    secondaryColor: '#0000ff',
    fontFamily: 'var(--font-sans)',
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://sepolia.basescan.org',
      },
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
    chainColor: '#f25d00',
    background: 'linear-gradient(135deg, #fff4ed 0%, #ffe0cc 50%, #ffc299 100%)',
    textColor: '#4d1f00',
    secondaryColor: '#f25d00',
    fontFamily: 'var(--font-sans)',
    blockExplorers: {
      default: {
        name: 'Bob Explorer',
        url: 'https://bob-sepolia.explorer.gobob.xyz',
      },
    },
  },

  // Ink Sepolia
  [inkSepolia.id]: {
    chainId: inkSepolia.id,
    name: 'Ink Sepolia',
    shortName: 'Ink',
    isTestnet: true,
    layerZeroEndpointId: 0, // TODO: Update with actual LZ endpoint
    colors: {
      from: '#5848d5',
      to: '#3d2fb3',
    },
    chainColor: '#5848d5',
    background: 'linear-gradient(135deg, #f0edff 0%, #ddd6ff 50%, #bfb3ff 100%)',
    textColor: '#1a0f4d',
    secondaryColor: '#5848d5',
    fontFamily: 'var(--font-serif)',
    blockExplorers: {
      default: {
        name: 'Ink Explorer',
        url: 'https://explorer-sepolia.inkonchain.com',
      },
    },
  },

  // MegaETH Sepolia
  [megaethSepolia.id]: {
    chainId: megaethSepolia.id,
    name: 'MegaETH Sepolia',
    shortName: 'MegaETH',
    isTestnet: true,
    layerZeroEndpointId: 0, // TODO: Update with actual LZ endpoint
    colors: {
      from: '#19191A',
      to: '#8A8484',
    },
    chainColor: '#19191A',
    hoverColor: '#DFD9D9',
    background: 'linear-gradient(135deg, #ffffff 0%, #DFD9D9 50%, #c9c3c3 100%)',
    textColor: '#2D2D2D',
    secondaryColor: '#8A8484',
    fontFamily: 'var(--font-sans)',
    blockExplorers: {
      default: {
        name: 'MegaETH Explorer',
        url: 'https://explorer-sepolia.megaeth.com',
      },
    },
  },

  // HyperLiquid Sepolia
  [hyperliquidSepolia.id]: {
    chainId: hyperliquidSepolia.id,
    name: 'HyperLiquid Sepolia',
    shortName: 'HyperLiquid',
    isTestnet: true,
    layerZeroEndpointId: 0, // TODO: Update with actual LZ endpoint
    colors: {
      from: '#97fce4',
      to: '#00a88f',
    },
    chainColor: '#97fce4',
    background: 'linear-gradient(135deg, #f0fffe 0%, #d9fef7 50%, #97fce4 100%)',
    textColor: '#003d35',
    secondaryColor: '#00a88f',
    fontFamily: 'var(--font-serif)',
    blockExplorers: {
      default: {
        name: 'HyperLiquid Explorer',
        url: 'https://explorer-sepolia.hyperliquid.xyz',
      },
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
    chainColor: '#0000ff',
    background: 'linear-gradient(135deg, #e6f0ff 0%, #cce0ff 50%, #99c2ff 100%)',
    textColor: '#001a4d',
    secondaryColor: '#0000ff',
    fontFamily: 'var(--font-sans)',
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://basescan.org',
      },
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
    chainColor: '#f25d00',
    background: 'linear-gradient(135deg, #fff4ed 0%, #ffe0cc 50%, #ffc299 100%)',
    textColor: '#4d1f00',
    secondaryColor: '#f25d00',
    fontFamily: 'var(--font-sans)',
    blockExplorers: {
      default: {
        name: 'Bob Explorer',
        url: 'https://explorer.gobob.xyz',
      },
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
export const TESTNET_CHAINS = [baseSepolia, bobSepolia, inkSepolia, megaethSepolia, hyperliquidSepolia] as const;

// Export mainnet chains for production
export const MAINNET_CHAINS = [base, bob] as const;

// Export all chains
export const ALL_CHAINS = [...TESTNET_CHAINS, ...MAINNET_CHAINS] as const;

// Get chains based on environment
export function getSupportedChains() {
  const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
  return isProduction ? MAINNET_CHAINS : TESTNET_CHAINS;
}
