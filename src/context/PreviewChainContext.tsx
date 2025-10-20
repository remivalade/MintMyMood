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

  // Local state for preview when not connected
  const [previewChainId, setPreviewChainId] = useState(supportedChains[0].id);

  // Sync preview chain with connected chain when wallet connects
  useEffect(() => {
    if (isConnected && connectedChainId) {
      setPreviewChainId(connectedChainId);
    }
  }, [isConnected, connectedChainId]);

  // Use connected chain if wallet is connected, otherwise use local preview state
  const currentChainId = isConnected ? connectedChainId : previewChainId;

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
