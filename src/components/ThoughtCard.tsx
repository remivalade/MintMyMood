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

import { moodEmojis } from '../types';

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
      className="relative w-full group"
      style={{ position: 'relative' }}
    >
      {/* Emoji - top right corner (matching minted SVG emoji position) */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 10,
          fontSize: '3.5rem',
          lineHeight: 1,
          pointerEvents: 'none'
        }}
      >
        {mood}
      </div>

      {/* Chain badge - top right, below emoji (for minted cards only) */}
      {isMinted && chainMetadata && (
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            right: '1rem',
            zIndex: 10,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            background: `linear-gradient(135deg, ${chainMetadata.colors.from}, ${chainMetadata.colors.to})`,
            pointerEvents: 'none'
          }}
        >
          {chainMetadata.shortName}
        </div>
      )}

      {/* Expiry - top left (showing countdown) */}
      {!isMinted && expiresAt && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: 'var(--medium-gray)',
            pointerEvents: 'none'
          }}
        >
          <Clock className="w-3 h-3" />
          <span>{timeRemaining}d left</span>
        </div>
      )}

      {/* Date - bottom left (matching "Bob" position in minted SVG) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          zIndex: 10,
          fontSize: '0.75rem',
          color: 'var(--medium-gray)',
          pointerEvents: 'none'
        }}
      >
        {date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>

      {/* Delete button - bottom right corner, visible on hover */}
      {!isMinted && onDelete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDeleteClick}
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            color: '#DC2626'
          }}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </motion.button>
      )}

      {/* Card button container */}
      <button
        onClick={onClick}
        className={`
          w-full aspect-square rounded-2xl border transition-all text-left p-6 flex flex-col
          ${isMinted
            ? 'bg-white border-amber-200 card-shadow hover:card-shadow-hover'
            : 'bg-white/60 border-black/10 card-shadow hover:card-shadow-hover'
          }
        `}
        style={{
          backgroundColor: isMinted ? 'var(--light-ivory)' : 'rgba(246, 238, 227, 0.6)'
        }}
      >
        {/* Content - centered in card */}
        <div className="flex-1 flex items-center justify-center overflow-hidden px-8">
          <p
            className="text-center"
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
        </div>
      </button>
    </motion.div>
  );
}
