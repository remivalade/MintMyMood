import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { CHAIN_METADATA } from '../config/chains';

interface ThoughtCardProps {
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  expiresAt?: Date;
  chainId?: number | null;
  onClick: () => void;
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

export function ThoughtCard({ content, mood, date, isMinted, expiresAt, chainId, onClick }: ThoughtCardProps) {
  const timeRemaining = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const chainMetadata = chainId ? CHAIN_METADATA[chainId] : null;

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`
        relative w-full text-left p-6 border transition-all
        ${isMinted
          ? 'bg-white border-amber-200 card-shadow hover:card-shadow-hover'
          : 'bg-white/60 border-black/10 card-shadow hover:card-shadow-hover'
        }
      `}
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isMinted ? 'var(--light-ivory)' : 'rgba(246, 238, 227, 0.6)'
      }}
    >
      {/* Minted badge with chain */}
      {isMinted && chainMetadata && (
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs uppercase tracking-wide text-white font-medium"
          style={{
            background: `linear-gradient(135deg, ${chainMetadata.colors.from}, ${chainMetadata.colors.to})`
          }}
        >
          {chainMetadata.name}
        </div>
      )}
      {isMinted && !chainMetadata && (
        <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
          Permanent
        </div>
      )}

      {/* Expiring indicator */}
      {!isMinted && expiresAt && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-gray-500 text-xs">
          <Clock className="w-3 h-3" />
          <span>{timeRemaining}d left</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{moodEmojis[mood]}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500 mb-1">
            {date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            {mood}
          </div>
        </div>
      </div>

      <p 
        className="line-clamp-4"
        style={{ 
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-ui)',
          lineHeight: '1.5',
          color: 'var(--soft-black)'
        }}
      >
        {content}
      </p>

      {!isMinted && timeRemaining <= 3 && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <div className="text-xs text-orange-600">
            ⏰ This thought will disappear soon. Consider making it permanent.
          </div>
        </div>
      )}
    </motion.button>
  );
}
