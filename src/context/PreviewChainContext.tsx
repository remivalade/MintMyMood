import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useChainId, useAccount } from 'wagmi';
import { getSupportedChains } from '../config/chains';

interface PreviewChainContextType {
  previewChainId: number;
  setPreviewChainId: (chainId: number) => void;
  currentChainId: number; // Either connected chain or preview chain
}

const PreviewChainContext = createContext<PreviewChainContextType | undefined>(undefined);

export function PreviewChainProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const connectedChainId = useChainId();
  const supportedChains = getSupportedChains();

  // Initialize with connected chain if available, otherwise first supported chain
  const [previewChainId, setPreviewChainId] = useState(() => {
    return connectedChainId || supportedChains[0]?.id || 84532; // Default to Base Sepolia
  });

  // Sync preview chain when wallet first connects
  useEffect(() => {
    if (isConnected && connectedChainId) {
      setPreviewChainId(connectedChainId);
    }
  }, [isConnected, connectedChainId]);

  // Always use preview chain ID for the preview (user can manually select different chains)
  const currentChainId = previewChainId;

  return (
    <PreviewChainContext.Provider value={{ previewChainId, setPreviewChainId, currentChainId }}>
      {children}
    </PreviewChainContext.Provider>
  );
}

export function usePreviewChain() {
  const context = useContext(PreviewChainContext);
  if (context === undefined) {
    throw new Error('usePreviewChain must be used within a PreviewChainProvider');
  }
  return context;
}
