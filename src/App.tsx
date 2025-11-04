import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { Toaster } from './components/ui/sonner';
import { IntroModal } from './components/IntroModal';
import { Gallery } from './components/Gallery';
import { WritingInterface } from './components/WritingInterface';
import { MoodSelection } from './components/MoodSelection';
import { MintPreview } from './components/MintPreview';
import { ThoughtDetail } from './components/ThoughtDetail';
import { MintingModal } from './components/MintingModal';
import { WalletPromptModal } from './components/WalletPromptModal';
import { useThoughtStore } from './store/useThoughtStore';
import { useAuthStore } from './store/useAuthStore';
import { Thought as ThoughtType } from './types';
import { toast } from 'sonner';
import { useMintJournalEntry } from './hooks/useMintJournalEntry';
import { baseSepolia, bobSepolia } from './config/chains';
import { getContractAddress } from './contracts/config';

const moodEmojis: Record<string, string> = {
  'Peaceful': '😌',
  'Reflective': '💭',
  'Inspired': '✨',
  'Melancholic': '🌙',
  'Passionate': '🔥',
  'Growing': '🌱',
  'Dreamy': '💫',
  'Energized': '⚡',
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [showIntroModal, setShowIntroModal] = useState(true);
  const { address, isConnected } = useAccount();
  const { user } = useAuthStore(); // Get auth.users user_id
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { saveThought, markAsMinted, thoughts } = useThoughtStore();
  const { mint, hash, isLoading: isMintLoading, isSuccess: isMintSuccess, error: mintError } = useMintJournalEntry();

  const [currentThought, setCurrentThought] = useState<{
    content: string;
    mood?: string;
    draftId?: string;
  }>({ content: '' });
  
  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<'minting' | 'success' | 'error'>('minting');
  const [isWalletPromptOpen, setIsWalletPromptOpen] = useState(false);

  // Initialize auth store on app load (Sprint 3.3: Supabase native Web3 auth)
  // This restores session from localStorage and sets up auth listener
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // Show intro modal only on first visit
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntroModal(false);
    }
  }, []);

  const handleCloseIntro = () => {
    setShowIntroModal(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  const handleWritingComplete = (content: string, draftId?: string) => {
    setCurrentThought({ content, draftId });
    navigate('/mood');
  };

  const handleMoodSelected = (mood: string) => {
    setCurrentThought(prev => ({ ...prev, mood }));
    navigate('/preview');
  };

  const [currentMintingThoughtId, setCurrentMintingThoughtId] = useState<string | null>(null);

  const handleMintClick = async () => {
    if (!isConnected || !address) {
      setIsWalletPromptOpen(true);
      return;
    }

    try {
      setIsMintingModalOpen(true);
      setMintingStatus('minting');

      // Convert mood name to emoji
      const moodEmoji = currentThought.mood ? moodEmojis[currentThought.mood] || '😌' : '😌';

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Save thought to database first to get an ID
      const savedThought = await saveThought({
        id: currentThought.draftId,
        user_id: user.id, // Auth user UUID
        wallet_address: address, // Still included for display
        text: currentThought.content,
        mood: moodEmoji,
        is_minted: false, // Not minted yet
      });

      if (!savedThought) {
        throw new Error('Failed to save thought');
      }

      // Store the thought ID for later update
      setCurrentMintingThoughtId(savedThought.id);

      // Mint the NFT on-chain with emoji
      await mint(savedThought.id, currentThought.content, moodEmoji);

      toast.info('Transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      console.error('Error minting thought:', error);
      setMintingStatus('error');
      toast.error(error?.message || 'Failed to mint thought');
    }
  };

  // Watch for minting transaction confirmation and extract token ID from receipt
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const updateMintedStatus = async () => {
      if (isConfirmed && hash && currentMintingThoughtId && address && receipt) {
        setMintingStatus('success');

        // Get contract address for this chain
        const contractAddress = getContractAddress(chainId);

        if (contractAddress) {
          // Extract token ID from EntryMinted event
          // Event signature: EntryMinted(uint256 indexed tokenId, address indexed owner, string mood, uint256 timestamp)
          let tokenId = '0';

          if (receipt.logs && receipt.logs.length > 0) {
            // Find the EntryMinted event (topic[0] is event signature hash)
            // The Transfer event from ERC721 has the tokenId as topic[3]
            const transferEvent = receipt.logs.find((log: any) =>
              log.topics.length === 4 && // Transfer event has 4 topics: signature, from, to, tokenId
              log.topics[1] === '0x0000000000000000000000000000000000000000000000000000000000000000' // from = address(0) for minting
            );

            if (transferEvent && transferEvent.topics[3]) {
              // Convert the hex tokenId to decimal string
              tokenId = BigInt(transferEvent.topics[3]).toString();
              console.log('Extracted token ID from receipt:', tokenId);
            }
          }

          // Mark thought as minted in database with actual token ID
          await markAsMinted(
            currentMintingThoughtId,
            chainId,
            tokenId,
            contractAddress,
            hash
          );
        }

        // Generate explorer link based on chain
        const getExplorerUrl = (chainId: number, txHash: string) => {
          if (chainId === baseSepolia.id) {
            return `https://sepolia.basescan.org/tx/${txHash}`;
          } else if (chainId === bobSepolia.id) {
            return `https://bob-sepolia.explorer.gobob.xyz/tx/${txHash}`;
          }
          return null;
        };

        const explorerUrl = getExplorerUrl(chainId, hash);

        if (explorerUrl) {
          toast.success(
            <div>
              Thought minted successfully!{' '}
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                View transaction
              </a>
            </div>
          );
        } else {
          toast.success('Thought minted successfully!');
        }

        // Clear the minting thought ID
        setCurrentMintingThoughtId(null);
      }
    };

    updateMintedStatus();
  }, [isConfirmed, hash, chainId, currentMintingThoughtId, address, markAsMinted]);

  useEffect(() => {
    if (mintError) {
      setMintingStatus('error');
      toast.error('Minting failed');
    }
  }, [mintError]);

  const handleDiscard = async () => {
    if (!isConnected || !address) {
      setIsWalletPromptOpen(true);
      return;
    }

    try {
      // Save as ephemeral thought to Supabase
      // If we already have a draftId, update that draft instead of creating a new one
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      // Convert mood name to emoji (same as minting flow)
      const moodEmoji = currentThought.mood ? moodEmojis[currentThought.mood] || '😌' : '😌';

      await saveThought({
        id: currentThought.draftId, // Will update if exists, insert if undefined
        wallet_address: address,
        text: currentThought.content,
        mood: moodEmoji,
        is_minted: false,
        expires_at: expiresAt.toISOString(),
      });

      toast.success('Thought saved as ephemeral');
      setCurrentThought({ content: '' });
      navigate('/write');
    } catch (error) {
      console.error('Error saving thought:', error);
      toast.error('Failed to save thought');
    }
  };

  const handleMintingModalClose = () => {
    setIsMintingModalOpen(false);
    setCurrentThought({ content: '' });
    navigate('/write');
  };

  const handleThoughtClick = (thought: ThoughtType) => {
    navigate(`/thought/${thought.id}`, { state: { thought } });
  };

  const handleMintFromDetail = () => {
    const thought = location.state?.thought as ThoughtType;
    if (!thought) return;

    setCurrentThought({
      content: thought.text,
      mood: thought.mood,
    });
    navigate('/preview');
  };

  const handleMintFromGallery = (thought: ThoughtType) => {
    setCurrentThought({
      content: thought.text,
      mood: thought.mood,
      draftId: thought.id,
    });
    navigate('/mood');
  };

  // Get current thought from URL params if on detail page
  const selectedThought = location.pathname.startsWith('/thought/')
    ? (location.state?.thought as ThoughtType) || thoughts.find(t => t.id === params.id)
    : null;

  // Get current view from route
  const currentView = location.pathname.split('/')[1] || 'write';

  return (
    <div className="min-h-screen">
      {/* Intro Modal - shown only once */}
      <IntroModal isOpen={showIntroModal} onClose={handleCloseIntro} />

      {currentView === 'write' && (
        <WritingInterface
          onComplete={handleWritingComplete}
          onOpenGallery={() => navigate('/gallery')}
        />
      )}

      {currentView === 'gallery' && (
        <Gallery
          onNewThought={() => navigate('/write')}
          onThoughtClick={handleThoughtClick}
          onMintFromGallery={handleMintFromGallery}
        />
      )}

      {currentView === 'mood' && (
        <MoodSelection
          onSelectMood={handleMoodSelected}
          onBack={() => navigate('/write')}
        />
      )}

      {currentView === 'preview' && (
        <MintPreview
          content={currentThought.content}
          mood={currentThought.mood || 'Peaceful'}
          onMint={handleMintClick}
          onDiscard={handleDiscard}
        />
      )}

      {currentView === 'thought' && selectedThought && (
        <ThoughtDetail
          content={selectedThought.text}
          mood={selectedThought.mood}
          date={new Date(selectedThought.created_at)}
          isMinted={selectedThought.is_minted}
          walletAddress={selectedThought.wallet_address}
          chainId={selectedThought.current_chain_id}
          txHash={selectedThought.tx_hash}
          tokenId={selectedThought.token_id}
          onClose={() => navigate('/gallery')}
          onMint={!selectedThought.is_minted ? handleMintFromDetail : undefined}
        />
      )}

      <MintingModal
        isOpen={isMintingModalOpen}
        status={mintingStatus}
        onClose={handleMintingModalClose}
        onViewGallery={handleMintingModalClose}
      />

      <WalletPromptModal
        isOpen={isWalletPromptOpen}
        onClose={() => setIsWalletPromptOpen(false)}
      />

      <Toaster />
    </div>
  );
}
