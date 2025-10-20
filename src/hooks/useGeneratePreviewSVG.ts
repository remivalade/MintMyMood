import { useReadContract, useAccount, useBlockNumber } from 'wagmi';
import { getContractAddress, OnChainJournalABI } from '../contracts/config';
import { useEnsName } from './useEnsName';
import { usePreviewChain } from '../context/PreviewChainContext';

/**
 * Hook to generate NFT preview SVG by calling the contract's generateSVG function
 * This ensures the preview matches exactly what will be minted on-chain
 * Uses preview chain context to allow viewing different chains without wallet connection
 */
export function useGeneratePreviewSVG(text: string, mood: string) {
  const { currentChainId } = usePreviewChain();
  const { address } = useAccount();
  const { ensName } = useEnsName(address);
  const { data: blockNumber } = useBlockNumber({ chainId: currentChainId });

  const contractAddress = getContractAddress(currentChainId);

  // Build the JournalEntry struct to pass to generateSVG
  const journalEntry = {
    text,
    mood,
    timestamp: BigInt(Math.floor(Date.now() / 1000)), // Current timestamp
    blockNumber: blockNumber || 0n, // Current block number
    owner: address || '0x0000000000000000000000000000000000000000',
    originChainId: BigInt(currentChainId),
    ensName: ensName || '',
  };

  // Call the generateSVG function on the contract
  const { data: svg, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: OnChainJournalABI,
    functionName: 'generateSVG',
    args: [journalEntry],
    query: {
      enabled: !!contractAddress && text.length > 0,
    },
  });

  return {
    svg: svg as string | undefined,
    isLoading,
    error,
  };
}
