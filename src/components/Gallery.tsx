import { useState } from 'react';
import { ThoughtCard } from './ThoughtCard';
import { AboutModal } from './AboutModal';
import { PenLine, Info } from 'lucide-react';

interface Thought {
  id: string;
  content: string;
  mood: string;
  date: Date;
  isMinted: boolean;
  expiresAt?: Date;
}

interface GalleryProps {
  thoughts: Thought[];
  onNewThought: () => void;
  onThoughtClick: (thought: Thought) => void;
}

export function Gallery({ thoughts, onNewThought, onThoughtClick }: GalleryProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--paper-cream)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <h1 style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h1)',
              fontWeight: '600',
              color: 'var(--soft-black)'
            }}>
              Pensieve
            </h1>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-1.5 transition-colors"
              style={{ color: 'var(--medium-gray)' }}
              title="About"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {thoughts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">💭</div>
            <h2 className="mb-3" style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h2)',
              color: 'var(--soft-black)'
            }}>
              No thoughts yet
            </h2>
            <p className="mb-8 max-w-md" style={{ 
              fontSize: 'var(--text-ui)',
              color: 'var(--medium-gray)'
            }}>
              Your memories will appear here. Start writing to capture this moment.
            </p>
          </div>
        ) : (
          /* Thoughts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thoughts.map((thought) => (
              <ThoughtCard
                key={thought.id}
                {...thought}
                onClick={() => onThoughtClick(thought)}
              />
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={onNewThought}
          className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--leather-brown)',
            borderRadius: '50%'
          }}
          title="New Thought"
        >
          <PenLine className="w-5 h-5" />
        </button>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
