import { useState, useEffect, useRef } from 'react';
import { Grid3x3 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { ConnectButton } from './ConnectButton';
import { useThoughtStore } from '../store/useThoughtStore';
import { useAuthStore } from '../store/useAuthStore';
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

  const [logoOpacity, setLogoOpacity] = useState(0.2);

  const { address, isConnected } = useAccount();
  const { isAuthenticated, walletAddress: authWalletAddress } = useAuthStore();
  const { saveThought } = useThoughtStore();

  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  // Detect wallet mismatch (security check)
  const walletMismatch = isConnected && isAuthenticated && address &&
    address.toLowerCase() !== authWalletAddress?.toLowerCase();

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
    // - Wallet mismatch (security)
    if (!content.trim() || !isConnected || !address || isOverLimit || walletMismatch) {
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
  }, [content, isConnected, address, isOverLimit, walletMismatch, currentDraftId, saveThought]);

  const handleSave = () => {
    if (content.trim() && !isOverLimit) {
      onComplete(content, currentDraftId || undefined);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col" style={{ backgroundColor: 'var(--paper-cream)' }}>
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header - matching Gallery header exactly */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1
              className="transition-opacity duration-300 cursor-default"
              onMouseEnter={() => setLogoOpacity(1)}
              onMouseLeave={() => setLogoOpacity(0.2)}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-h1)',
                fontWeight: '600',
                color: 'var(--soft-black)',
                opacity: logoOpacity,
              }}
            >
              MintMyMood
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGallery}
              className="p-2 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm bg-white/40 backdrop-blur-sm"
              title="View Gallery"
            >
              <Grid3x3 className="w-4 h-4 text-gray-600" />
            </button>

            <ConnectButton />
          </div>
        </div>

        {/* Writing Area */}
        <div className="flex-1 flex flex-col items-center justify-start pt-12 md:pt-20">
          <div className="w-full max-w-2xl">
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
              rows={15}
              className="w-full bg-transparent border-none outline-none resize-none journal-text placeholder:opacity-50"
              style={{
                height: '60vh',
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-body)',
                lineHeight: '1.6',
                color: 'var(--soft-black)'
              }}
            />

            {/* Character Counter */}
            <div className="text-right mt-2">
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
