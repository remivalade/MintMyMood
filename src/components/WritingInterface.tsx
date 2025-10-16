import { useState, useEffect, useRef } from 'react';
import { Grid3x3 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { ConnectButton } from './ConnectButton';
import { useThoughtStore } from '../store/useThoughtStore';
import { toast } from 'sonner';

interface WritingInterfaceProps {
  onComplete: (content: string, draftId?: string) => void;
  onOpenGallery: () => void;
}

const MAX_CHARACTERS = 400;
const AUTO_SAVE_DELAY = 3000; // 3 seconds

export function WritingInterface({
  onComplete,
  onOpenGallery
}: WritingInterfaceProps) {
  const [content, setContent] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { address, isConnected } = useAccount();
  const { saveThought } = useThoughtStore();

  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  // Auto-save effect with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't auto-save if:
    // - Content is empty or just whitespace
    // - Wallet not connected
    // - Character limit exceeded
    if (!content.trim() || !isConnected || !address || isOverLimit) {
      return;
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes for testing (7 days in production)

        const savedThought = await saveThought({
          id: currentDraftId || undefined,
          wallet_address: address,
          text: content,
          mood: '💭', // Default mood for drafts
          is_minted: false,
          expires_at: expiresAt.toISOString(),
        });

        if (savedThought) {
          setCurrentDraftId(savedThought.id);
          toast.success('Draft saved');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Failed to save draft');
      }
    }, AUTO_SAVE_DELAY);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, isConnected, address, isOverLimit, currentDraftId, saveThought]);

  const handleSave = () => {
    if (content.trim() && !isOverLimit) {
      onComplete(content, currentDraftId || undefined);
    }
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

        <ConnectButton />
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
