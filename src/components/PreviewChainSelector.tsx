import { useSwitchChain, useAccount } from 'wagmi';
import { getSupportedChains, getChainMetadata } from '../config/chains';
import { usePreviewChain } from '../context/PreviewChainContext';

/**
 * Chain Selector for Preview Page
 * Allows viewing different chain styles even when wallet is not connected
 * If wallet IS connected, actually switches the chain
 */
export function PreviewChainSelector() {
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { currentChainId, setPreviewChainId } = usePreviewChain();
  const supportedChains = getSupportedChains();

  const handleChainClick = (chainId: number) => {
    if (isConnected) {
      // If connected, actually switch the chain
      switchChain({ chainId });
    } else {
      // If not connected, just update preview state
      setPreviewChainId(chainId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Select your layout:</span>
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {supportedChains.map((chain) => {
          const metadata = getChainMetadata(chain.id);
          const isActive = currentChainId === chain.id;

          return (
            <button
              key={chain.id}
              onClick={() => handleChainClick(chain.id)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }
              `}
              style={isActive ? {
                background: `linear-gradient(135deg, ${metadata?.colors.from}, ${metadata?.colors.to})`,
                color: 'white'
              } : undefined}
            >
              {metadata?.shortName || chain.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
