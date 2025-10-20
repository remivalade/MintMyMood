import { useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from 'wagmi';
import { getContractAddress, OnChainJournalABI } from '../contracts/config';
import { useThoughtStore } from '../store/useThoughtStore';
import { useEnsName } from './useEnsName';

/**
 * Hook for minting journal entries as NFTs
 *
 * Handles:
 * - Contract interaction via wagmi
 * - ENS resolution
 * - Transaction tracking
 * - Database updates after minting
 */
export function useMintJournalEntry() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { ensName } = useEnsName(address);
  const { markAsMinted } = useThoughtStore();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Mint a journal entry
   */
  const mint = async (thoughtId: string, text: string, mood: string) => {
    const contractAddress = getContractAddress(chainId);

    if (!contractAddress) {
      throw new Error(`No contract deployed on chain ${chainId}`);
    }

    // Call the contract
    writeContract({
      address: contractAddress,
      abi: OnChainJournalABI,
      functionName: 'mintEntry',
      args: [text, mood, ensName || ''],
      gas: 500000n, // Set explicit gas limit to avoid estimation issues
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

  return {
    mint,
    updateDatabase,
    hash,
    isLoading: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error: writeError || confirmError,
  };
}
