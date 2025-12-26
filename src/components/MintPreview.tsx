import { Button } from './ui/button';
import { Sparkles, Wallet } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { CHAIN_METADATA, baseSepolia, bobSepolia, inkSepolia, megaethSepolia, hyperliquidSepolia } from '../config/chains';
import { OnChainNFTPreview } from './OnChainNFTPreview';
import { usePreviewChain } from '../context/PreviewChainContext';
import { ConnectButton } from './ConnectButton';
import { moodEmojis } from '../types';
import { ChainRibbon } from './ChainRibbon';
import { motion } from 'motion/react';

interface MintPreviewProps {
  content: string;
  mood: string;
  onMint: (styleId: number) => void;
  onDiscard: () => void;
  onConnectWallet: () => void;
}

// Map chain keys IDs
type ChainKey = 'base' | 'bob' | 'ink' | 'megaeth' | 'hyperliquid';

const CHAIN_KEY_TO_ID: Record<ChainKey, number> = {
  base: baseSepolia.id,
  bob: bobSepolia.id,
  ink: inkSepolia.id,
  megaeth: megaethSepolia.id,
  hyperliquid: hyperliquidSepolia.id,
};

type TemplateType = 'native' | 'classic';

export function MintPreview({ content, mood, onMint, onDiscard, onConnectWallet }: MintPreviewProps) {
  const [selectedChainKey, setSelectedChainKey] = useState<ChainKey>('base');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('native');

  const { chain: currentChain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { setPreviewChainId } = usePreviewChain();

  // Get the chain ID for the selected chain key
  const targetChainId = CHAIN_KEY_TO_ID[selectedChainKey];
  const chainConfig = CHAIN_METADATA[targetChainId];

  // Update preview chain when selection changes
  useEffect(() => {
    setPreviewChainId(targetChainId);
  }, [targetChainId, setPreviewChainId]);

  // Check if user is on the correct chain
  const isOnCorrectChain = currentChain?.id === targetChainId;

  // Derive styleId
  const styleId = selectedTemplate === 'classic' ? 1 : 0;

  const handleMintButtonClick = () => {
    if (!isConnected) {
      onConnectWallet();
    } else if (!isOnCorrectChain) {
      // Need to switch chain first
      switchChain({ chainId: targetChainId });
    } else {
      // Already on correct chain, proceed with minting
      onMint(styleId);
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
          <span>Switch to {chainConfig.shortName} to Mint</span>
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
                mood={moodEmojis[mood] || mood}
                styleId={styleId}
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
                Choose a style for your permanent record
              </p>
            </div>

            {/* Style & Chain Selection Orbs */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>Select Style</span>
              </div>

              <div
                className="flex items-center gap-4 overflow-x-auto pb-4 px-2 pt-2 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* 1. Classic Orb */}
                <button
                  onClick={() => {
                    setSelectedTemplate('classic');
                    setSelectedChainKey('base');
                    if (isConnected) {
                      // Trigger wallet switch if connected
                      switchChain({ chainId: CHAIN_KEY_TO_ID['base'] });
                    }
                  }}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group relative outline-none"
                >
                  <div
                    className={`relative w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${selectedTemplate === 'classic'
                      ? 'ring-2 ring-offset-2 ring-[#8B7355] scale-110 shadow-lg'
                      : 'hover:scale-105 hover:shadow-md'
                      }`}
                    style={{
                      background: 'linear-gradient(135deg, #F9F7F1 0%, #EBE5D9 100%)',
                      border: '1px solid rgba(45, 45, 45, 0.1)'
                    }}
                  >
                  </div>
                  <div
                    className="text-xs font-medium transition-colors duration-200"
                    style={{
                      color: selectedTemplate === 'classic' ? '#8B7355' : 'var(--medium-gray)',
                      fontWeight: selectedTemplate === 'classic' ? '700' : '500',
                    }}
                  >
                    Classic
                  </div>
                </button>

                {/* Separator */}
                <div className="w-px h-10 bg-gray-200 mx-1" />

                {/* 2. Chain Native Orbs */}
                {(Object.keys(CHAIN_KEY_TO_ID) as ChainKey[]).map((key) => {
                  const chainId = CHAIN_KEY_TO_ID[key];
                  const config = CHAIN_METADATA[chainId];
                  const isNativeSelected = selectedTemplate === 'native' && selectedChainKey === key;
                  const isDisabled = key === 'megaeth' || key === 'hyperliquid';

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedTemplate('native');
                          setSelectedChainKey(key);
                          if (isConnected) {
                            switchChain({ chainId });
                          }
                        }
                      }}
                      disabled={isDisabled}
                      className={`flex-shrink-0 flex flex-col items-center gap-2 group relative outline-none ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                    >
                      <div
                        className={`relative w-14 h-14 rounded-full transition-all duration-300 overflow-hidden ${isNativeSelected
                          ? 'ring-2 ring-offset-2 scale-110 shadow-lg'
                          : (!isDisabled ? 'hover:scale-105 hover:shadow-md' : '')
                          }`}
                        style={{
                          background: config.background,
                          '--tw-ring-color': config.chainColor
                        } as React.CSSProperties}
                      >
                        {/* Hover overlay */}
                        {!isDisabled && (
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                            style={{ backgroundColor: 'black' }}
                          />
                        )}
                      </div>

                      <div
                        className="text-xs transition-colors duration-200"
                        style={{
                          color: isNativeSelected ? config.chainColor : 'var(--medium-gray)',
                          fontWeight: isNativeSelected ? '700' : '500',
                        }}
                      >
                        {config.name}
                      </div>

                      {isDisabled && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          soon™
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions & Ribbon Wrapper */}
            <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">

              {/* Chain Ribbon - Shows above button when Classic is selected */}
              {selectedTemplate === 'classic' && (
                <div className="w-full order-1 relative z-50">
                  <ChainRibbon
                    selectedChain={chainConfig.name}
                    onChainSelect={(key) => {
                      setSelectedChainKey(key as ChainKey);
                      if (isConnected) {
                        switchChain({ chainId: CHAIN_KEY_TO_ID[key as ChainKey] });
                      }
                    }}
                    availableChains={[
                      { name: CHAIN_METADATA[CHAIN_KEY_TO_ID['base']].name, key: 'base' },
                      { name: CHAIN_METADATA[CHAIN_KEY_TO_ID['bob']].name, key: 'bob' },
                      { name: CHAIN_METADATA[CHAIN_KEY_TO_ID['ink']].name, key: 'ink' }
                    ]}
                  />
                </div>
              )}

              {/* Main Action Button */}
              <div className="relative w-full order-2">
                <Button
                  onClick={handleMintButtonClick}
                  size="lg"
                  className="w-full text-white shadow-xl py-7 text-lg font-medium tracking-wide hover:translate-y-[-2px] active:translate-y-[0px] transition-all duration-200 rounded-xl"
                  style={{ backgroundColor: 'var(--leather-brown)' }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {(() => {
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
                            <span>Switch to {chainConfig.shortName}</span>
                          </>
                        );
                      }
                      return (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Mint to {chainConfig.shortName}</span>
                        </>
                      );
                    })()}
                  </span>
                </Button>
              </div>

              {/* Ephemeral Save Link */}
              <button
                onClick={onDiscard}
                className="transition-opacity underline decoration-1 underline-offset-4 text-xs font-medium tracking-wide order-3"
                style={{
                  color: 'var(--medium-gray)',
                }}
              >
                Save as ephemeral instead
              </button>

              <p className="text-center text-xs text-gray-500 order-4">
                Minted thoughts live on-chain forever · Ephemeral thoughts disappear in 7 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
