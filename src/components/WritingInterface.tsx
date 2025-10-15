import { useState } from 'react';
import { Grid3x3, Wallet } from 'lucide-react';
import { Button } from './ui/button';

interface WritingInterfaceProps {
  onComplete: (content: string) => void;
  onOpenGallery: () => void;
  onOpenWallet: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
}

const MAX_CHARACTERS = 400;

export function WritingInterface({ 
  onComplete, 
  onOpenGallery, 
  onOpenWallet, 
  isWalletConnected,
  walletAddress 
}: WritingInterfaceProps) {
  const [content, setContent] = useState('');
  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  const handleSave = () => {
    if (content.trim() && !isOverLimit) {
      onComplete(content);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--paper-cream)' }}>
      {/* Minimal floating nav */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={onOpenGallery}
          className="p-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm"
          title="View Gallery"
        >
          <Grid3x3 className="w-4 h-4 text-gray-600" />
        </button>
        
        {isWalletConnected && walletAddress ? (
          <button
            onClick={onOpenWallet}
            className="px-3 py-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm flex items-center gap-2"
            title="Wallet Connected"
          >
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-700 font-mono">{formatAddress(walletAddress)}</span>
          </button>
        ) : (
          <button
            onClick={onOpenWallet}
            className="p-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm"
            title="Connect Wallet"
          >
            <Wallet className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto px-8 py-16 md:py-24" style={{ maxWidth: 'var(--content-max-width)' }}>
          <div className="text-caption text-medium-gray mb-8 text-center" style={{ 
            fontSize: 'var(--text-caption)',
            color: 'var(--medium-gray)'
          }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={MAX_CHARACTERS}
            className="w-full min-h-[60vh] bg-transparent border-none outline-none resize-none journal-text placeholder:opacity-50"
            style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-body)',
              lineHeight: '1.6',
              color: 'var(--soft-black)'
            }}
          />
          
          {/* Character Counter */}
          <div className="text-right mt-4">
            <span 
              className="text-xs transition-colors"
              style={{ 
                color: isOverLimit ? 'var(--error-red)' : 'var(--medium-gray)',
                opacity: characterCount > 0 ? 1 : 0.3
              }}
            >
              {characterCount} / {MAX_CHARACTERS}
            </span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {content.trim() && !isOverLimit && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={handleSave}
            size="lg"
            className="text-white shadow-2xl px-8 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--leather-brown)' }}
          >
            Choose my mood →
          </Button>
        </div>
      )}
    </div>
  );
}
