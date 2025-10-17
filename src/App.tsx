import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { Toaster } from './components/ui/sonner';
import { IntroModal } from './components/IntroModal';
import { Gallery } from './components/Gallery';
import { WritingInterface } from './components/WritingInterface';
import { MoodSelection } from './components/MoodSelection';
import { MintPreview } from './components/MintPreview';
import { ThoughtDetail } from './components/ThoughtDetail';
import { MintingModal } from './components/MintingModal';
import { useThoughtStore } from './store/useThoughtStore';
import { Thought as ThoughtType } from './types';
import { toast } from 'sonner';
import { getEnsNameForMinting } from './hooks/useEnsName';

type View = 'writing' | 'gallery' | 'mood' | 'preview' | 'detail';

export default function App() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { saveThought } = useThoughtStore();

  const [currentView, setCurrentView] = useState<View>('writing');
  const [currentThought, setCurrentThought] = useState<{
    content: string;
    mood?: string;
    draftId?: string;
  }>({ content: '' });
  const [selectedThought, setSelectedThought] = useState<ThoughtType | null>(null);
  
  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<'minting' | 'success' | 'error'>('minting');

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
    setCurrentView('mood');
  };

  const handleMoodSelected = (mood: string) => {
    setCurrentThought(prev => ({ ...prev, mood }));
    setCurrentView('preview');
  };

  const handleMintClick = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsMintingModalOpen(true);
      setMintingStatus('minting');

      // Resolve ENS name for the connected wallet
      let ensName = '';
      if (publicClient) {
        ensName = await getEnsNameForMinting(address, publicClient);
      }

      // TODO: Replace with actual smart contract minting
      // When integrating with contract, call: mintEntry(text, mood, ensName)
      // For now, simulate minting process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Save as minted thought to Supabase
      // If we have a draftId, update that draft to minted instead of creating a new one
      await saveThought({
        id: currentThought.draftId, // Will update if exists, insert if undefined
        wallet_address: address,
        text: currentThought.content,
        mood: currentThought.mood || '😌',
        is_minted: true,
        // Note: origin_chain_id, token_id, etc. will be added when we integrate smart contracts
        // ENS name will be passed to contract: mintEntry(text, mood, ensName)
      });

      setMintingStatus('success');
      toast.success('Thought minted successfully!');
    } catch (error) {
      console.error('Error minting thought:', error);
      setMintingStatus('error');
      toast.error('Failed to mint thought');
    }
  };

  const handleDiscard = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Save as ephemeral thought to Supabase
      // If we already have a draftId, update that draft instead of creating a new one
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await saveThought({
        id: currentThought.draftId, // Will update if exists, insert if undefined
        wallet_address: address,
        text: currentThought.content,
        mood: currentThought.mood || '😌', // Default to Peaceful emoji
        is_minted: false,
        expires_at: expiresAt.toISOString(),
      });

      toast.success('Thought saved as ephemeral');
      setCurrentThought({ content: '' });
      setCurrentView('writing');
    } catch (error) {
      console.error('Error saving thought:', error);
      toast.error('Failed to save thought');
    }
  };

  const handleMintingModalClose = () => {
    setIsMintingModalOpen(false);
    setCurrentThought({ content: '' });
    setCurrentView('writing');
  };

  const handleThoughtClick = (thought: ThoughtType) => {
    setSelectedThought(thought);
    setCurrentView('detail');
  };

  const handleMintFromDetail = () => {
    if (!selectedThought) return;

    setCurrentThought({
      content: selectedThought.text,
      mood: selectedThought.mood,
    });
    setCurrentView('preview');
    setSelectedThought(null);
  };

  return (
    <div className="min-h-screen">
      {/* Intro Modal - shown only once */}
      <IntroModal isOpen={showIntroModal} onClose={handleCloseIntro} />

      {currentView === 'writing' && (
        <WritingInterface
          onComplete={handleWritingComplete}
          onOpenGallery={() => setCurrentView('gallery')}
        />
      )}

      {currentView === 'gallery' && (
        <Gallery
          onNewThought={() => setCurrentView('writing')}
          onThoughtClick={handleThoughtClick}
        />
      )}

      {currentView === 'mood' && (
        <MoodSelection
          onSelectMood={handleMoodSelected}
          onBack={() => setCurrentView('writing')}
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

      {currentView === 'detail' && selectedThought && (
        <ThoughtDetail
          content={selectedThought.text}
          mood={selectedThought.mood}
          date={new Date(selectedThought.created_at)}
          isMinted={selectedThought.is_minted}
          onClose={() => {
            setSelectedThought(null);
            setCurrentView('gallery');
          }}
          onMint={!selectedThought.is_minted ? handleMintFromDetail : undefined}
        />
      )}

      <MintingModal
        isOpen={isMintingModalOpen}
        status={mintingStatus}
        onClose={handleMintingModalClose}
        onViewGallery={handleMintingModalClose}
      />

      <Toaster />
    </div>
  );
}
