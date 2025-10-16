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

/**
 * Wagmi Configuration for MintMyMood
 *
 * Uses RainbowKit for beautiful wallet connection UI
 * Automatically switches between testnet/mainnet based on environment
 */

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'VITE_WALLETCONNECT_PROJECT_ID is not set. ' +
    'Get one at https://cloud.walletconnect.com/'
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: 'MintMyMood',
  projectId,
  chains: getSupportedChains(),
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
