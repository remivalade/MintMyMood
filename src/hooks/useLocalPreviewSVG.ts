import { useMemo } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { useEnsName } from './useEnsName';
import { usePreviewChain } from '../context/PreviewChainContext';
import { generateSVG } from '../utils/generateSVG';

/**
 * Hook to generate NFT preview SVG locally (client-side)
 * This is more robust than calling the contract for previews
 */
export function useLocalPreviewSVG(text: string, mood: string) {
  const { currentChainId } = usePreviewChain();
  const { address } = useAccount();
  const { ensName } = useEnsName(address);
  const { data: blockNumber } = useBlockNumber({ chainId: currentChainId });

  const svg = useMemo(() => {
    if (!text) return null;

    return generateSVG({
      text,
      mood,
      chainId: currentChainId,
      walletAddress: address || '0x0000000000000000000000000000000000000000',
      ensName: ensName || undefined,
      blockNumber: blockNumber?.toString() || '000000',
    });
  }, [text, mood, currentChainId, address, ensName, blockNumber]);

  return {
    svg,
    isLoading: false,
    error: null,
  };
}
