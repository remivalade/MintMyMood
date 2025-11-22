import { Button } from './ui/button';
import { Sparkles, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { CHAIN_METADATA, baseSepolia, bobSepolia, inkSepolia, megaethSepolia, hyperliquidSepolia } from '../config/chains';
import { OnChainNFTPreview } from './OnChainNFTPreview';
import { usePreviewChain } from '../context/PreviewChainContext';
import { ConnectButton } from './ConnectButton';
import { moodEmojis } from '../types';

interface MintPreviewProps {
  content: string;
  mood: string;
  onMint: () => void;
  onDiscard: () => void;
  onConnectWallet: () => void;
}

// Map style keys to chain IDs
type NFTStyle = 'base' | 'bob' | 'ink' | 'megaeth' | 'hyperliquid';

const STYLE_TO_CHAIN_ID: Record<NFTStyle, number> = {
  base: baseSepolia.id,
  bob: bobSepolia.id,
  ink: inkSepolia.id,
  megaeth: megaethSepolia.id,
  hyperliquid: hyperliquidSepolia.id,
};

export function MintPreview({ content, mood, onMint, onDiscard, onConnectWallet }: MintPreviewProps) {
  const [selectedStyle, setSelectedStyle] = useState<NFTStyle>('base');
  const { chain: currentChain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { setPreviewChainId } = usePreviewChain();

  // Get the chain ID for the selected style
  const targetChainId = STYLE_TO_CHAIN_ID[selectedStyle];
  const styleConfig = CHAIN_METADATA[targetChainId];

  // Update preview chain when style changes
  useEffect(() => {
    setPreviewChainId(targetChainId);
  }, [targetChainId, setPreviewChainId]);

  // Check if user is on the correct chain
  const isOnCorrectChain = currentChain?.id === targetChainId;

  const handleMintButtonClick = () => {
    if (!isConnected) {
      onConnectWallet();
    } else if (!isOnCorrectChain) {
      // Need to switch chain first
      switchChain({ chainId: targetChainId });
    } else {
      // Already on correct chain, proceed with minting
      onMint();
    }
  };

  const getButtonContent = () => {
    if (!isConnected) {
      return (
        <>
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet to Mint</span>
        </>
      );
    }
    if (!isOnCorrectChain) {
      return (
        <>
          <Sparkles className="w-5 h-5" />
          <span>Switch to {styleConfig.shortName} to Mint</span>
        </>
      );
    }
    return (
      <>
        <Sparkles className="w-5 h-5" />
        <span>Mint now</span>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto flex flex-col"
      style={{ backgroundColor: 'var(--paper-cream)' }}
    >
      {/* Minimal floating nav */}
      <div className="absolute top-4 right-4 z-10">
        <ConnectButton />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:items-stretch pt-20 lg:pt-24">
        {/* Left side - NFT Preview */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-black/10">
              <OnChainNFTPreview
                content={content}
                mood={moodEmojis[mood]}
              />
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="mb-2" style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-h2)',
                fontWeight: '600',
                color: 'var(--soft-black)',
                textAlign: 'left'
              }}>
                Preview your thought
              </h2>
              <p style={{
                fontSize: 'var(--text-caption)',
                color: 'var(--medium-gray)',
                textAlign: 'left'
              }}>
                Select the style of your minted thought
              </p>
            </div>

            {/* Style Selectors */}
            <div className="mb-8">
              <div
                className="flex items-center gap-3 overflow-x-auto pb-2 px-2 pt-2 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {(Object.keys(STYLE_TO_CHAIN_ID) as NFTStyle[]).map((styleKey) => {
                  const chainId = STYLE_TO_CHAIN_ID[styleKey];
                  const config = CHAIN_METADATA[chainId];
                  const isSelected = selectedStyle === styleKey;
                  const isDisabled = styleKey === 'megaeth' || styleKey === 'hyperliquid';

                  return (
                    <button
                      key={styleKey}
                      onClick={() => !isDisabled && setSelectedStyle(styleKey)}
                      disabled={isDisabled}
                      className="flex-shrink-0 flex flex-col items-center gap-2 group relative"
                      title={isDisabled ? "soon™" : undefined}
                    >
                      <div
                        className={`relative w-12 h-12 transition-all duration-200 ${!isDisabled && 'group-hover:scale-110'}`}
                        style={{
                          borderRadius: '50%',
                          padding: isSelected ? '3px' : '2px',
                          background: isSelected
                            ? config.chainColor
                            : 'rgba(45, 45, 45, 0.15)',
                          boxShadow: isSelected ? `0 0 0 2px ${config.chainColor}20` : 'none',
                          width: '48px',
                          height: '48px',
                          opacity: isDisabled ? 0.5 : 1,
                          filter: isDisabled ? 'grayscale(100%)' : 'none',
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <div
                          className="overflow-hidden relative"
                          style={{
                            borderRadius: '50%',
                            background: config.background,
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          {/* Hover overlay */}
                          {!isDisabled && (
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{
                                backgroundColor: config.hoverColor || config.chainColor,
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className="text-xs whitespace-nowrap"
                        style={{
                          color: isSelected ? config.chainColor : 'var(--medium-gray)',
                          fontWeight: isSelected ? '600' : '500',
                          opacity: isDisabled ? 0.5 : 1
                        }}
                      >
                        {config.name}
                      </div>

                      {/* Tooltip for disabled items */}
                      {isDisabled && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20" style={{ color: '#5a5a5a' }}>
                          soon™
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 items-center">
              <Button
                onClick={handleMintButtonClick}
                size="lg"
                className="w-full text-white shadow-lg py-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--leather-brown)' }}
              >
                {getButtonContent()}
              </Button>

              <button
                onClick={onDiscard}
                className="hover:opacity-70 transition-opacity underline decoration-1 underline-offset-4"
                style={{
                  color: 'var(--medium-gray)',
                  fontSize: 'var(--text-ui)'
                }}
              >
                Save as ephemeral instead
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              Minted thoughts live on-chain forever · Ephemeral thoughts disappear in 7 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
