import { useEffect, useState } from 'react';
import { useEnsName as useWagmiEnsName } from 'wagmi';
import { normalize } from 'viem/ens';
import { mainnet } from 'wagmi/chains';

/**
 * Custom hook to resolve ENS name for an address
 * Falls back to formatted address if no ENS name found
 */
export function useEnsName(address: `0x${string}` | undefined) {
  const [displayName, setDisplayName] = useState<string>('');

  // Use wagmi's useEnsName hook to resolve ENS
  const { data: ensName } = useWagmiEnsName({
    address: address,
    chainId: mainnet.id,
  });

  useEffect(() => {
    if (address) {
      if (ensName) {
        setDisplayName(ensName);
      } else {
        // Format address as 0x1A2b...dE3F
        setDisplayName(`${address.slice(0, 6)}...${address.slice(-4)}`);
      }
    } else {
      setDisplayName('');
    }
  }, [address, ensName]);

  return {
    displayName,
    ensName,
    isEns: !!ensName,
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
