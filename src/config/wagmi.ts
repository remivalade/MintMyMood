import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  rabbyWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { getSupportedChains } from './chains';
import { mainnet } from 'wagmi/chains';

/**
 * Wagmi Configuration for MintMyMood
 *
 * Uses RainbowKit for beautiful wallet connection UI
 * Automatically switches between testnet/mainnet based on environment
 *
 * NOTE: Mainnet is always included for ENS resolution, even in testnet mode
 */

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'VITE_WALLETCONNECT_PROJECT_ID is not set. ' +
    'Get one at https://cloud.walletconnect.com/'
  );
}

// Get supported chains and always include mainnet for ENS resolution
const supportedChains = getSupportedChains();
const allChains = [...supportedChains, mainnet] as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'MintMyMood',
  projectId,
  chains: allChains,
  ssr: false, // We're using Vite, not Next.js
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        rabbyWallet, // Your preferred wallet first!
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
      ],
    },
    {
      groupName: 'More Options',
      wallets: [
        walletConnectWallet,
        injectedWallet, // Catches other installed wallets
      ],
    },
  ],
});
