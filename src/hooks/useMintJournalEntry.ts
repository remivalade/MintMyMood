import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { getContractAddress, OnChainJournalABI } from '../contracts/config';
import { useThoughtStore } from '../store/useThoughtStore';

/**
 * Hook for minting journal entries as NFTs
 *
 * V2.4.0 Changes:
 * - Removed ENS signature verification (security fix)
 * - Simplified to only require text and mood
 * - No backend API dependency
 * - Faster and cheaper minting
 *
 * Handles:
 * - Contract interaction via wagmi
 * - Transaction tracking
 * - Database updates after minting
 */
export function useMintJournalEntry() {
  const chainId = useChainId();
  const { markAsMinted } = useThoughtStore();

  const contractAddress = getContractAddress(chainId);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Mint a journal entry (simplified - no signature needed)
   */
  const mint = async (thoughtId: string, text: string, mood: string) => {
    if (!contractAddress) {
      throw new Error(`No contract deployed on chain ${chainId}`);
    }

    console.log('Minting journal entry:', { text: text.substring(0, 50), mood, chainId });

    // Call the contract directly (no signature needed!)
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: OnChainJournalABI,
      functionName: 'mintEntry',
      args: [text, mood],
      gas: 400000n, // Reduced gas limit (no signature verification)
    });
  };

  /**
   * Update database after successful mint
   * Call this in a useEffect when isConfirmed becomes true
   */
  const updateDatabase = async (thoughtId: string, tokenId: string) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress || !hash) return;

    await markAsMinted(
      thoughtId,
      chainId,
      tokenId,
      contractAddress,
      hash
    );
  };

  /**
   * Reset all states (useful for retrying after errors)
   */
  const resetMint = () => {
    reset();
  };

  return {
    mint,
    updateDatabase,
    resetMint,
    hash,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error: writeError || confirmError,
  };
}
