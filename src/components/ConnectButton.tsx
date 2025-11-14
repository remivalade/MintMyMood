import { useEffect, useRef } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Wallet, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Custom styled wrapper around RainbowKit's ConnectButton
 * Maintains our design system while using real wallet connection
 *
 * Sprint 3.3: Integrates Supabase native SIWE authentication
 * Sprint 3.5: Improved UX - orange dot for unauthenticated, green check for authenticated
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
  const rejectedAuth = useRef(false); // Track if user rejected authentication

  // Handle wallet disconnect → sign out from Supabase
  useEffect(() => {
    if (wasConnected.current && !isConnected && isAuthenticated) {
      signOut();
    }
    wasConnected.current = isConnected;
  }, [isConnected, isAuthenticated, signOut]);

  // Auto-trigger SIWE authentication when wallet connects (if not already authenticated)
  useEffect(() => {
    if (isLoading) return; // Wait for session restoration

    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      const addressLower = address.toLowerCase();

      // Check if this wallet address is already authenticated
      if (!authWalletAddress || authWalletAddress.toLowerCase() !== addressLower) {
        // Prevent duplicate auth calls or re-triggering after rejection
        if ((hasTriggeredAuth.current && lastAttemptedAddress.current === addressLower) || rejectedAuth.current) {
          return;
        }

        hasTriggeredAuth.current = true;
        lastAttemptedAddress.current = addressLower;
        authenticate(addressLower).then((success) => {
          if (!success) {
            // User rejected - don't auto-trigger again
            rejectedAuth.current = true;
          }
        });
      }
    }

    // Reset guard on disconnect
    if (!isConnected || !address) {
      hasTriggeredAuth.current = false;
      lastAttemptedAddress.current = null;
      rejectedAuth.current = false;
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

        // Debug logging
        if (connected) {
          console.log('ConnectButton state:', {
            isAuthenticated,
            isAuthenticating,
            isLoading,
            address: account?.address,
            authWalletAddress
          });
        }

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

                  {/* Account Button with Authentication Status */}
                  <button
                    onClick={() => {
                      // If not authenticated, trigger authentication
                      if (!isAuthenticated && !isAuthenticating && account?.address) {
                        authenticate(account.address.toLowerCase());
                      } else {
                        // If authenticated, open account modal
                        openAccountModal();
                      }
                    }}
                    type="button"
                    className="px-3 py-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm flex items-center gap-2"
                    title={isAuthenticating ? "Authenticating..." : isAuthenticated ? "Authenticated - Click for account details" : "Click to sign in with Ethereum"}
                  >
                    {/* Status indicator */}
                    {isAuthenticating ? (
                      <div className="rounded-full animate-pulse" style={{ backgroundColor: '#eab308', width: '8px', height: '8px' }} />
                    ) : isAuthenticated ? (
                      <Check className="w-3 h-3" style={{ color: '#22c55e', strokeWidth: 2.5 }} />
                    ) : (
                      <div className="rounded-full" style={{ backgroundColor: '#fb923c', width: '8px', height: '8px' }} />
                    )}

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
