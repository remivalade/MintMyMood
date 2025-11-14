import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { OnChainNFTPreview } from './OnChainNFTPreview';
import { PreviewChainSelector } from './PreviewChainSelector';
import { useAccount } from 'wagmi';

interface MintPreviewProps {
  content: string;
  mood: string;
  onMint: () => void;
  onDiscard: () => void;
}

const moodEmojis: Record<string, string> = {
  'Peaceful': '😌',
  'Reflective': '💭',
  'Inspired': '✨',
  'Melancholic': '🌙',
  'Passionate': '🔥',
  'Growing': '🌱',
  'Dreamy': '💫',
  'Energized': '⚡',
  'Focused': '🎯',
  'Flowing': '🌊',
  'Light': '🍃',
  'Grateful': '🌟',
};

export function MintPreview({ content, mood, onMint, onDiscard }: MintPreviewProps) {
  const { address } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12" style={{ backgroundColor: 'var(--paper-cream)' }}>
      <div className="max-w-4xl w-full my-auto">
        <div className="text-center mb-8">
          <h2 className="mb-2" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-h2)',
            fontWeight: '600',
            color: 'var(--soft-black)'
          }}>
            Preview
          </h2>
          <p style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--medium-gray)'
          }}>
            This is how your thought will be preserved on-chain
          </p>
        </div>

        {/* Chain Selector */}
        <div className="flex justify-center mb-6">
          <PreviewChainSelector />
        </div>

        {/* NFT Preview - Actual on-chain SVG */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-black/10">
          <OnChainNFTPreview
            content={content}
            mood={moodEmojis[mood]}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 max-w-md mx-auto items-center">
          <Button
            onClick={onMint}
            size="lg"
            className="w-full text-white shadow-lg py-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--leather-brown)' }}
          >
            <Sparkles className="w-5 h-5" />
            <span>Mint as NFT</span>
          </Button>
          
          <button
            onClick={onDiscard}
            className="hover:opacity-70 transition-opacity underline decoration-1 underline-offset-4"
            style={{ 
              color: 'var(--medium-gray)',
              fontSize: 'var(--text-ui)'
            }}
          >
            Save as ephemeral instead
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Minted thoughts live on-chain forever · Ephemeral thoughts disappear in 7 days
        </p>
      </div>
    </div>
  );
}
