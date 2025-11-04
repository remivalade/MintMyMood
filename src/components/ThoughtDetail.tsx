import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { ConnectButton } from './ConnectButton';
import { Info } from 'lucide-react';
import { generateSVG } from '../utils/generateSVG';
import { generateEphemeralSVG } from '../utils/generateEphemeralSVG';
import { CHAIN_METADATA } from '../config/chains';
import { useEnsName } from '../hooks/useEnsName';

interface ThoughtDetailProps {
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  walletAddress?: string;
  chainId?: number | null;
  txHash?: string | null;
  tokenId?: string | null;
  onClose: () => void;
  onMint?: () => void;
}

export function ThoughtDetail({
  content,
  mood,
  date,
  isMinted,
  walletAddress,
  chainId,
  txHash,
  tokenId,
  onClose,
  onMint
}: ThoughtDetailProps) {
  const { displayName, isEns } = useEnsName(walletAddress as `0x${string}` | undefined);

  // Generate SVG based on minted status
  const svg = isMinted && walletAddress && chainId
    ? generateSVG({
        text: content,
        mood,
        chainId,
        walletAddress,
        blockNumber: tokenId || '0',
      })
    : generateEphemeralSVG({
        text: content,
        mood,
        walletAddress: walletAddress || '0x0000000000000000000000000000000000000000',
      });

  const chainMetadata = chainId ? CHAIN_METADATA[chainId] : null;

  // Get explorer URL for transaction
  const getExplorerUrl = (chainId: number, txHash: string) => {
    if (chainId === 84532) { // Base Sepolia
      return `https://sepolia.basescan.org/tx/${txHash}`;
    } else if (chainId === 808813) { // Bob Testnet
      return `https://bob-sepolia.explorer.gobob.xyz/tx/${txHash}`;
    }
    return null;
  };

  const explorerUrl = txHash && chainId ? getExplorerUrl(chainId, txHash) : null;

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--paper-cream)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header - matching Gallery header exactly */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h1)',
              fontWeight: '600',
              color: 'var(--soft-black)'
            }}>
              MintMyMood
            </h1>
          </div>
          <ConnectButton />
        </div>

        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--medium-gray)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Gallery
          </button>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* SVG Preview */}
          <div className="sticky top-8">
            <div
              className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-black/10"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {/* Chain badge (minted only) */}
            {isMinted && chainMetadata && (
              <div className="mt-4 flex items-center justify-center">
                <div
                  className="px-4 py-2 rounded-full text-sm uppercase tracking-wide text-white font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${chainMetadata.colors.from}, ${chainMetadata.colors.to})`
                  }}
                >
                  {chainMetadata.name}
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          {isMinted && walletAddress ? (
            <div className="bg-white/60 rounded-2xl p-6 border border-black/10 space-y-4">
              <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-4">
                NFT Information
              </h3>

              {/* Minted by */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Minted by</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-900">
                    {displayName}
                  </span>
                  {isEns && (
                    <span className="text-xs text-green-600" title="ENS name verified">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Mint date */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Mint date</div>
                <div className="text-sm text-gray-900">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Transaction hash */}
              {txHash && explorerUrl && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Transaction</div>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors group"
                  >
                    <span className="font-mono">
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              )}

              {/* Token ID */}
              {tokenId && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Token ID</div>
                  <div className="text-sm text-gray-900 font-mono">
                    #{tokenId}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Ephemeral state */
            <div className="bg-white/60 rounded-2xl p-6 border border-black/10">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Ephemeral Thought
                  </div>
                  <p className="text-sm text-gray-600">
                    This thought will automatically disappear in a few days unless you mint it as an NFT.
                  </p>
                </div>
              </div>
              {onMint && (
                <Button
                  onClick={onMint}
                  className="w-full text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--leather-brown)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  Make it permanent
                </Button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
