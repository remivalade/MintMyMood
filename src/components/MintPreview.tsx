import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

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
};

export function MintPreview({ content, mood, onMint, onDiscard }: MintPreviewProps) {
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 md:p-12" style={{ backgroundColor: 'var(--paper-cream)' }}>
      <div className="max-w-4xl w-full">
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

        {/* NFT Preview */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-black/10">
          <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-5xl md:text-6xl">{moodEmojis[mood]}</div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Pensieve</div>
                  <div className="text-xs text-gray-400">{date}</div>
                </div>
              </div>

              <div 
                className="journal-text mb-6"
                style={{ 
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-body)',
                  lineHeight: '1.6',
                  color: 'var(--soft-black)'
                }}
              >
                {content.length > 280 ? content.slice(0, 280) + '...' : content}
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-gray-500">
              <div className="uppercase tracking-wider">{mood}</div>
              <div className="font-mono text-xs">#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
            </div>
          </div>
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
