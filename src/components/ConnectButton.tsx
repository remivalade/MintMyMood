import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

/**
 * Custom styled wrapper around RainbowKit's ConnectButton
 * Maintains our design system while using real wallet connection
 */
export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="p-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm"
                    title="Connect Wallet"
                  >
                    <Wallet className="w-4 h-4 text-gray-600" />
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-3 py-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-red-100 backdrop-blur-sm flex items-center gap-2"
                    title="Wrong Network"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-xs text-red-700 font-mono">Wrong network</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Chain Switcher */}
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-2 py-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm"
                    title="Switch Network"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Account Button */}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-3 py-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm flex items-center gap-2"
                    title="Account"
                  >
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-gray-700 font-mono">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
