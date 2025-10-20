import { useSwitchChain, useChainId } from 'wagmi';
import { getSupportedChains } from '../config/chains';
import { getChainMetadata } from '../config/chains';

/**
 * Chain Switcher Component
 * Allows users to switch between Base Sepolia and Bob Testnet
 */
export function ChainSwitcher() {
  const { chains, switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const supportedChains = getSupportedChains();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Chain:</span>
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {supportedChains.map((chain) => {
          const metadata = getChainMetadata(chain.id);
          const isActive = currentChainId === chain.id;

          return (
            <button
              key={chain.id}
              onClick={() => switchChain({ chainId: chain.id })}
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
