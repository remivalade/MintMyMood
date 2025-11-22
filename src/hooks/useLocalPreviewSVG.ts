import { useMemo } from 'react';
import { useBlockNumber } from 'wagmi';
import { usePreviewChain } from '../context/PreviewChainContext';
import { generateSVG } from '../utils/generateSVG';

/**
 * Hook to generate NFT preview SVG locally (client-side)
 * This is more robust than calling the contract for previews
 *
 * V2.4.0: Removed address/ENS display
 */
export function useLocalPreviewSVG(text: string, mood: string) {
  const { currentChainId } = usePreviewChain();
  const { data: blockNumber } = useBlockNumber({ chainId: currentChainId });

  const svg = useMemo(() => {
    if (!text) return null;
    if (!currentChainId) return null;

    return generateSVG({
      text,
      mood,
      chainId: currentChainId,
      blockNumber: blockNumber?.toString() || '000000',
    });
  }, [text, mood, currentChainId, blockNumber]);

  return {
    svg,
    isLoading: false,
    error: null,
  };
}
