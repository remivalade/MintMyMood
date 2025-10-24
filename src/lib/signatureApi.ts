/**
 * Signature API Client
 *
 * Communicates with the backend signature service to get verified ENS signatures
 * for minting journal entries.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface SignatureResponse {
  signature: string;
  expiry: number;
  ensName: string;
  signerAddress: string;
}

export interface SignatureRequest {
  address: string;
  ensName: string;
  nonce: number;
}

/**
 * Requests a signature from the backend for ENS verification
 *
 * @param address - The wallet address that will mint
 * @param ensName - The ENS name (or empty string if none)
 * @param nonce - The current nonce for this address from the contract
 * @returns Signature data needed for minting
 */
export async function getENSSignature(
  address: string,
  ensName: string,
  nonce: number
): Promise<SignatureResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ens-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        ensName: ensName || '', // Ensure empty string for no ENS
        nonce,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get ENS signature:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to signature service. Please try again.');
    }

    throw error;
  }
}

/**
 * Health check for the signature service
 *
 * @returns True if service is healthy, false otherwise
 */
export async function checkSignatureServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Signature service health check failed:', error);
    return false;
  }
}
