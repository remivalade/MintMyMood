import { useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount, useReadContract } from 'wagmi';
import { getContractAddress, OnChainJournalABI } from '../contracts/config';
import { useThoughtStore } from '../store/useThoughtStore';
import { useEnsName } from './useEnsName';
import { getENSSignature } from '../lib/signatureApi';
import { useState } from 'react';

/**
 * Hook for minting journal entries as NFTs with ENS signature verification
 *
 * Handles:
 * - ENS resolution
 * - Backend signature request
 * - Contract interaction via wagmi
 * - Transaction tracking
 * - Database updates after minting
 */
export function useMintJournalEntry() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { ensName } = useEnsName(address);
  const { markAsMinted } = useThoughtStore();
  const [isGettingSignature, setIsGettingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<Error | null>(null);

  const contractAddress = getContractAddress(chainId);

  // Read current nonce for the user
  const { data: nonce } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: OnChainJournalABI,
    functionName: 'nonces',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

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
   * Mint a journal entry with signature verification
   */
  const mint = async (thoughtId: string, text: string, mood: string) => {
    setSignatureError(null);

    if (!contractAddress) {
      throw new Error(`No contract deployed on chain ${chainId}`);
    }

    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (nonce === undefined) {
      throw new Error('Unable to fetch nonce');
    }

    try {
      // Step 1: Get signature from backend
      setIsGettingSignature(true);
      console.log('Requesting signature for:', { address, ensName, nonce });

      const signatureData = await getENSSignature(
        address,
        ensName || '',
        Number(nonce)
      );

      console.log('Signature received:', {
        expiry: signatureData.expiry,
        ensName: signatureData.ensName,
        signerAddress: signatureData.signerAddress,
      });

      setIsGettingSignature(false);

      // Step 2: Call the contract with signature
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: OnChainJournalABI,
        functionName: 'mintEntry',
        args: [
          text,
          mood,
          signatureData.ensName,
          signatureData.signature as `0x${string}`,
          BigInt(nonce),
          BigInt(signatureData.expiry),
        ],
        gas: 600000n, // Increased gas limit for signature verification
      });
    } catch (error) {
      setIsGettingSignature(false);
      setSignatureError(error as Error);
      console.error('Minting error:', error);
      throw error;
    }
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
    setSignatureError(null);
    setIsGettingSignature(false);
  };

  return {
    mint,
    updateDatabase,
    resetMint,
    hash,
    isLoading: isWritePending || isConfirming || isGettingSignature,
    isGettingSignature,
    isSuccess: isConfirmed,
    error: signatureError || writeError || confirmError,
    nonce: nonce ? Number(nonce) : undefined,
  };
}
