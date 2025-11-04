import { useEffect, useRef } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Wallet, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Custom styled wrapper around RainbowKit's ConnectButton
 * Maintains our design system while using real wallet connection
 *
 * Sprint 3.3: Integrates Supabase native SIWE authentication after wallet connection
 */
export function ConnectButton() {
  const { authenticate, signOut, isAuthenticating } = useAuth();
  const { isAuthenticated, walletAddress: authWalletAddress, isLoading } = useAuthStore();

  // Use wagmi hook to get wallet connection state
  const { address, isConnected } = useAccount();

  // Guard to prevent duplicate auth triggers (React Strict Mode causes double mounting)
  const hasTriggeredAuth = useRef(false);
  const lastAttemptedAddress = useRef<string | null>(null);
  const wasConnected = useRef(false);

  // Handle wallet disconnect → sign out from Supabase
  useEffect(() => {
    if (wasConnected.current && !isConnected && isAuthenticated) {
      signOut();
    }
    wasConnected.current = isConnected;
  }, [isConnected, isAuthenticated, signOut]);

  // Auto-trigger SIWE authentication when wallet connects
  useEffect(() => {
    if (isLoading) return; // Wait for session restoration

    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      const addressLower = address.toLowerCase();

      // Check if this wallet address is already authenticated
      if (!authWalletAddress || authWalletAddress.toLowerCase() !== addressLower) {
        // Prevent duplicate auth calls
        if (hasTriggeredAuth.current && lastAttemptedAddress.current === addressLower) {
          return;
        }

        hasTriggeredAuth.current = true;
        lastAttemptedAddress.current = addressLower;
        authenticate(addressLower);
      }
    }

    // Reset guard on disconnect
    if (!isConnected || !address) {
      hasTriggeredAuth.current = false;
      lastAttemptedAddress.current = null;
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating, authWalletAddress, isLoading, authenticate]);

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

        // Check if wallet matches authenticated wallet
        const walletMismatch = connected && isAuthenticated &&
          account?.address.toLowerCase() !== authWalletAddress?.toLowerCase();

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

                  {/* Authentication Status Indicator */}
                  {isAuthenticating ? (
                    <div
                      className="px-3 py-2 rounded-lg bg-yellow-100 backdrop-blur-sm flex items-center gap-2"
                      title="Authenticating..."
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                      <span className="text-xs text-yellow-700 font-mono">Signing...</span>
                    </div>
                  ) : walletMismatch ? (
                    <button
                      onClick={() => authenticate(account.address.toLowerCase())}
                      type="button"
                      className="px-3 py-2 hover:bg-red-200 rounded-lg transition-all hover:shadow-sm bg-red-100 backdrop-blur-sm flex items-center gap-2"
                      title="Re-authenticate with this wallet"
                    >
                      <ShieldAlert className="w-3 h-3 text-red-700" />
                      <span className="text-xs text-red-700 font-mono">Auth mismatch</span>
                    </button>
                  ) : isAuthenticated ? (
                    <div
                      className="px-3 py-2 rounded-lg bg-green-100 backdrop-blur-sm flex items-center gap-2"
                      title="Authenticated"
                    >
                      <ShieldCheck className="w-3 h-3 text-green-700" />
                      <span className="text-xs text-green-700 font-mono">Authenticated</span>
                    </div>
                  ) : null}

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
