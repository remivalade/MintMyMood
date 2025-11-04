import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ThoughtCard } from './ThoughtCard';
import { MintedNFTCard } from './MintedNFTCard';
import { AboutModal } from './AboutModal';
import { ConnectButton } from './ConnectButton';
import { PenLine, Info, Filter } from 'lucide-react';
import { useThoughtStore } from '../store/useThoughtStore';
import { Thought } from '../types';
import { toast } from 'sonner';

interface GalleryProps {
  thoughts?: Thought[];
  onNewThought: () => void;
  onThoughtClick: (thought: Thought) => void;
  onMintFromGallery?: (thought: Thought) => void;
}

type FilterType = 'all' | 'minted' | 'ephemeral';

export function Gallery({ onNewThought, onThoughtClick, onMintFromGallery }: GalleryProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAccount();
  const { thoughts, fetchThoughts, deleteThought } = useThoughtStore();

  // Fetch thoughts when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);
      fetchThoughts(address).finally(() => setIsLoading(false));
    }
  }, [isConnected, address, fetchThoughts]);

  // Filter thoughts
  const filteredThoughts = thoughts.filter(thought => {
    // Filter by type
    if (filterType === 'minted' && !thought.is_minted) return false;
    if (filterType === 'ephemeral' && thought.is_minted) return false;

    // Filter by chain
    if (selectedChain && thought.current_chain_id !== selectedChain) return false;

    return true;
  });

  const mintedCount = thoughts.filter(t => t.is_minted).length;
  const ephemeralCount = thoughts.filter(t => !t.is_minted).length;

  const handleDelete = async (thoughtId: string) => {
    try {
      await deleteThought(thoughtId);
      toast.success('Thought deleted');
    } catch (error) {
      console.error('Error deleting thought:', error);
      toast.error('Failed to delete thought');
    }
  };

  const handleMint = (thought: Thought) => {
    if (onMintFromGallery) {
      onMintFromGallery(thought);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--paper-cream)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-1.5 transition-colors"
              style={{ color: 'var(--medium-gray)' }}
              title="About"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <ConnectButton />
        </div>

        {/* Wallet connection required */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">🔗</div>
            <h2 className="mb-3" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h2)',
              color: 'var(--soft-black)'
            }}>
              Connect your wallet
            </h2>
            <p className="mb-8 max-w-md" style={{
              fontSize: 'var(--text-ui)',
              color: 'var(--medium-gray)'
            }}>
              Connect your wallet to view your thoughts and memories.
            </p>
            <ConnectButton />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6 animate-pulse">💭</div>
            <p style={{
              fontSize: 'var(--text-ui)',
              color: 'var(--medium-gray)'
            }}>
              Loading your thoughts...
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            {thoughts.length > 0 && (
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-lg p-1">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                      filterType === 'all'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    All ({thoughts.length})
                  </button>
                  <button
                    onClick={() => setFilterType('minted')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                      filterType === 'minted'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    Minted ({mintedCount})
                  </button>
                  <button
                    onClick={() => setFilterType('ephemeral')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                      filterType === 'ephemeral'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    Ephemeral ({ephemeralCount})
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredThoughts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-7xl mb-6">💭</div>
                <h2 className="mb-3" style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-h2)',
                  color: 'var(--soft-black)'
                }}>
                  {thoughts.length === 0 ? 'No thoughts yet' : 'No thoughts match your filters'}
                </h2>
                <p className="mb-8 max-w-md" style={{
                  fontSize: 'var(--text-ui)',
                  color: 'var(--medium-gray)'
                }}>
                  {thoughts.length === 0
                    ? 'Your memories will appear here. Start writing to capture this moment.'
                    : 'Try adjusting your filters to see more thoughts.'}
                </p>
              </div>
            ) : (
              /* Thoughts Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredThoughts.map((thought) => {
                  // Render minted thoughts as SVG NFT cards
                  if (thought.is_minted && thought.current_chain_id && address) {
                    return (
                      <MintedNFTCard
                        key={thought.id}
                        content={thought.text}
                        mood={thought.mood}
                        chainId={thought.current_chain_id}
                        walletAddress={address}
                        onClick={() => onThoughtClick(thought)}
                      />
                    );
                  }

                  // Render ephemeral thoughts as cards
                  return (
                    <ThoughtCard
                      key={thought.id}
                      content={thought.text}
                      mood={thought.mood}
                      date={new Date(thought.created_at)}
                      isMinted={thought.is_minted}
                      expiresAt={thought.expires_at ? new Date(thought.expires_at) : undefined}
                      chainId={thought.current_chain_id}
                      onClick={() => onThoughtClick(thought)}
                      onDelete={() => handleDelete(thought.id)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Floating Action Button */}
        <button
          onClick={onNewThought}
          className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--leather-brown)',
            borderRadius: '50%'
          }}
          title="New Thought"
        >
          <PenLine className="w-5 h-5" />
        </button>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
