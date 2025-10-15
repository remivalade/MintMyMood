import { X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface ThoughtDetailProps {
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  onClose: () => void;
  onMint?: () => void;
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

export function ThoughtDetail({ content, mood, date, isMinted, onClose, onMint }: ThoughtDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto backdrop-blur-xl" style={{ 
        backgroundColor: 'rgba(249, 247, 241, 0.95)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(45, 45, 45, 0.08)'
      }}>
        {/* Header */}
        <div className="sticky top-0 border-b px-8 py-6 flex items-center justify-between backdrop-blur-xl" style={{ 
          backgroundColor: 'rgba(249, 247, 241, 0.95)',
          borderColor: 'var(--border)'
        }}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{moodEmojis[mood]}</div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">{mood}</div>
              <div className="text-sm text-gray-400">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-12" style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <p 
            className="journal-text whitespace-pre-wrap"
            style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-body)',
              lineHeight: '1.6',
              color: 'var(--soft-black)'
            }}
          >
            {content}
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t px-8 py-6 backdrop-blur-xl" style={{ 
          backgroundColor: 'rgba(249, 247, 241, 0.95)',
          borderColor: 'var(--border)'
        }}>
          {isMinted ? (
            <div className="flex items-center justify-center gap-2 py-3 px-4" style={{ 
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">This thought has been preserved on-chain</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                This thought is ephemeral and will disappear soon
              </p>
              {onMint && (
                <Button
                  onClick={onMint}
                  className="text-white shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
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
  );
}
