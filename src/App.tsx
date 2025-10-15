import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { IntroModal } from './components/IntroModal';
import { Gallery } from './components/Gallery';
import { WritingInterface } from './components/WritingInterface';
import { MoodSelection } from './components/MoodSelection';
import { MintPreview } from './components/MintPreview';
import { ThoughtDetail } from './components/ThoughtDetail';
import { WalletModal } from './components/WalletModal';
import { MintingModal } from './components/MintingModal';

interface Thought {
  id: string;
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  expiresAt?: Date;
}

type View = 'writing' | 'gallery' | 'mood' | 'preview' | 'detail';

export default function App() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  
  // Sample thoughts
  const [thoughts, setThoughts] = useState<Thought[]>([
    {
      id: '1',
      content: 'Sometimes the weight of existence feels like a gentle fog—not oppressive, but present. Today I realized that uncertainty isn\'t something to fear, but a space where possibility lives. I\'m learning to sit with the questions instead of rushing to answers.',
      mood: 'Reflective',
      date: new Date(2025, 9, 10),
      isMinted: true,
    },
    {
      id: '2',
      content: 'The sunrise this morning was absolutely breathtaking. Golden light spilling over the horizon, painting everything in warmth. In that moment, I felt so alive, so present. This is what I want to remember forever.',
      mood: 'Inspired',
      date: new Date(2025, 9, 12),
      isMinted: true,
    },
    {
      id: '3',
      content: 'Feeling restless today. There\'s a storm of ideas brewing in my mind and I can\'t seem to catch any of them. Maybe that\'s okay. Maybe this chaos is part of the creative process.',
      mood: 'Energized',
      date: new Date(2025, 9, 13),
      isMinted: false,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      id: '4',
      content: 'There\'s a quiet melancholy in the evening air. Not sadness exactly, but a gentle nostalgia for moments that haven\'t even passed yet. The beauty of impermanence.',
      mood: 'Melancholic',
      date: new Date(2025, 9, 14),
      isMinted: false,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  ]);

  const [currentView, setCurrentView] = useState<View>('writing');
  const [currentThought, setCurrentThought] = useState<{
    content: string;
    mood?: string;
  }>({ content: '' });
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<'minting' | 'success' | 'error'>('minting');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>();

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

  const handleWritingComplete = (content: string) => {
    setCurrentThought({ content });
    setCurrentView('mood');
  };

  const handleMoodSelected = (mood: string) => {
    setCurrentThought(prev => ({ ...prev, mood }));
    setCurrentView('preview');
  };

  const handleMintClick = () => {
    if (!isWalletConnected) {
      setIsWalletModalOpen(true);
    } else {
      startMinting();
    }
  };

  const handleWalletConnect = (walletType: string) => {
    console.log('Connecting to', walletType);
    // Simulate wallet connection
    setTimeout(() => {
      setIsWalletConnected(true);
      // Generate mock wallet address
      setWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      setIsWalletModalOpen(false);
      // Only start minting if we're in the preview flow
      if (currentView === 'preview') {
        startMinting();
      }
    }, 1000);
  };

  const startMinting = () => {
    setIsMintingModalOpen(true);
    setMintingStatus('minting');
    
    // Simulate minting process
    setTimeout(() => {
      const newThought: Thought = {
        id: Date.now().toString(),
        content: currentThought.content,
        mood: currentThought.mood || 'Peaceful',
        date: new Date(),
        isMinted: true,
      };
      
      setThoughts(prev => [newThought, ...prev]);
      setMintingStatus('success');
    }, 3000);
  };

  const handleDiscard = () => {
    // Save as ephemeral thought
    const newThought: Thought = {
      id: Date.now().toString(),
      content: currentThought.content,
      mood: currentThought.mood || 'Peaceful',
      date: new Date(),
      isMinted: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };
    
    setThoughts(prev => [newThought, ...prev]);
    setCurrentThought({ content: '' });
    setCurrentView('writing');
  };

  const handleMintingModalClose = () => {
    setIsMintingModalOpen(false);
    setCurrentThought({ content: '' });
    setCurrentView('writing');
  };

  const handleThoughtClick = (thought: Thought) => {
    setSelectedThought(thought);
    setCurrentView('detail');
  };

  const handleMintFromDetail = () => {
    if (!selectedThought) return;
    
    setCurrentThought({
      content: selectedThought.content,
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
          onOpenWallet={() => setIsWalletModalOpen(true)}
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
        />
      )}

      {currentView === 'gallery' && (
        <Gallery
          thoughts={thoughts}
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
          content={selectedThought.content}
          mood={selectedThought.mood}
          date={selectedThought.date}
          isMinted={selectedThought.isMinted}
          onClose={() => {
            setSelectedThought(null);
            setCurrentView('gallery');
          }}
          onMint={!selectedThought.isMinted ? handleMintFromDetail : undefined}
        />
      )}

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

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
