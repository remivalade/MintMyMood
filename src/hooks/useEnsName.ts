import { useEnsName as useWagmiEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

/**
 * Custom hook to resolve ENS name for an address
 * Falls back to formatted address if no ENS name found
 */
export function useEnsName(address: `0x${string}` | undefined) {
  // Use wagmi's useEnsName hook to resolve ENS
  const { data: ensName, isLoading } = useWagmiEnsName({
    address: address,
    chainId: mainnet.id,
  });

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

  return {
    displayName,
    ensName,
    isEns: !!ensName,
    isLoading,
  };
}

/**
 * Helper function to get ENS name for minting
 * Returns empty string if no ENS found
 */
export async function getEnsNameForMinting(
  address: `0x${string}`,
  publicClient: any
): Promise<string> {
  try {
    const ensName = await publicClient.getEnsName({
      address: address,
    });
    return ensName || '';
  } catch (error) {
    console.warn('ENS resolution failed:', error);
    return '';
  }
}
