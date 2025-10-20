import { motion } from 'motion/react';
import { Clock, Trash2 } from 'lucide-react';
import { CHAIN_METADATA } from '../config/chains';
import { useState } from 'react';

interface ThoughtCardProps {
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  expiresAt?: Date;
  chainId?: number | null;
  onClick: () => void;
  onDelete?: () => void;
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

export function ThoughtCard({ content, mood, date, isMinted, expiresAt, chainId, onClick, onDelete }: ThoughtCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeRemaining = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const chainMetadata = chainId ? CHAIN_METADATA[chainId] : null;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full"
      style={{ paddingBottom: '100%' }}
    >
      <button
        onClick={onClick}
        className={`
          text-left p-6 border transition-all flex flex-col overflow-hidden
          ${isMinted
            ? 'bg-white border-amber-200 card-shadow hover:card-shadow-hover'
            : 'bg-white/60 border-black/10 card-shadow hover:card-shadow-hover'
          }
        `}
        style={{
          position: 'absolute',
          inset: 0,
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
        <div className="text-3xl">{mood}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      <p
        className="flex-1 overflow-hidden"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-ui)',
          lineHeight: '1.5',
          color: 'var(--soft-black)',
          display: '-webkit-box',
          WebkitLineClamp: 8,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {content}
      </p>

      {/* Bottom section with warning */}
      <div className="mt-auto pt-4">
        {/* Warning for expiring thoughts */}
        {!isMinted && timeRemaining <= 3 && (
          <div className="text-xs text-orange-600">
            ⏰ This thought will disappear soon.
          </div>
        )}
      </div>

      {/* Delete button - INSIDE card, bottom right corner, visible on hover */}
      {!isMinted && onDelete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDeleteClick}
          className="flex items-center gap-1 text-xs font-bold transition-all bg-white/90 px-2 py-1 rounded shadow-sm"
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            color: '#DC2626',
            zIndex: 20
          }}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </motion.button>
      )}
      </button>
    </motion.div>
  );
}
