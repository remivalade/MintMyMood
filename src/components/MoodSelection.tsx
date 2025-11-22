import { useState } from 'react';
import { ConnectButton } from './ConnectButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

import { MOOD_OPTIONS } from '../types';

interface MoodSelectionProps {
  onSelectMood: (mood: string) => void;
  onBack: () => void;
  onConnectWallet: () => void;
}

export function MoodSelection({ onSelectMood, onBack }: MoodSelectionProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--paper-cream)' }}>
      {/* Minimal floating nav */}
      <div className="absolute top-4 right-4 z-10">
        <ConnectButton />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-24">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-16">
            <h2 className="mb-3" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h1)',
              fontWeight: '600',
              color: 'var(--soft-black)'
            }}>
              How does this thought feel?
            </h2>
            <p style={{
              fontSize: 'var(--text-ui)',
              color: 'var(--medium-gray)'
            }}>
              Choose an emotion that captures this moment
            </p>
          </div>

          {/* Emoji Canvas Grid */}
          <TooltipProvider delayDuration={100}>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-6 md:gap-8 mb-16 max-w-2xl mx-auto">
              {MOOD_OPTIONS.map((mood) => (
                <Tooltip key={mood.label}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectMood(mood.label)}
                      onMouseEnter={() => setHoveredMood(mood.label)}
                      onMouseLeave={() => setHoveredMood(null)}
                      className="aspect-square flex items-center justify-center transition-all duration-200 hover:scale-125 active:scale-95"
                    >
                      <span className="text-4xl md:text-5xl">{mood.emoji}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="px-3 py-1.5"
                    style={{
                      backgroundColor: 'var(--soft-black)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-caption)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <p>{mood.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="hover:opacity-70 transition-opacity underline decoration-1 underline-offset-4"
              style={{
                color: 'var(--medium-gray)',
                fontSize: 'var(--text-caption)'
              }}
            >
              ← Back to editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
