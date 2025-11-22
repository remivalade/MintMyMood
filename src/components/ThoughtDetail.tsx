import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { ConnectButton } from './ConnectButton';
import { Info } from 'lucide-react';
import { generateSVG } from '../utils/generateSVG';
import { generateEphemeralSVG } from '../utils/generateEphemeralSVG';
import { CHAIN_METADATA } from '../config/chains';
import { useReadContract, useTransaction } from 'wagmi';
import { getContractAddress, OnChainJournalABI } from '../contracts/config';

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
  const contractAddress = chainId ? getContractAddress(chainId) : undefined;

  // Fetch transaction to get block number
  const { data: transaction } = useTransaction({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  });

  const blockNumber = transaction?.blockNumber ? transaction.blockNumber.toString() : '000000';

  // Generate SVG based on minted status
  const svg = isMinted && chainId
    ? generateSVG({
      text: content,
      mood,
      chainId,
      blockNumber: blockNumber,
    })
    : generateEphemeralSVG({
      text: content,
      mood,
      walletAddress: walletAddress || '0x0000000000000000000000000000000000000000',
    });

  const chainMetadata = chainId ? CHAIN_METADATA[chainId] : null;

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

            </div>

            {/* Metadata */}
            {isMinted && walletAddress ? (
              <div className="bg-white/60 rounded-2xl p-6 border border-black/10 space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-4">
                  Information
                </h3>

                {/* First minted on */}
                {chainMetadata && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">First minted on</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {chainMetadata.name}
                    </div>
                  </div>
                )}

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

                {/* Minted by */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Minted by</div>
                  <div className="text-sm text-gray-900 font-mono break-all">
                    {walletAddress}
                  </div>
                </div>

                {/* Transaction */}
                {txHash && chainMetadata && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Transaction</div>
                    <a
                      href={`${chainMetadata.blockExplorers.default.url}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View on Explorer
                      <ExternalLink className="w-3 h-3" />
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
