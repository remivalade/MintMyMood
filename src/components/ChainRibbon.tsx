import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface ChainRibbonProps {
  selectedChain: string;
  onChainSelect: (chain: string) => void;
  availableChains: { name: string; key: string }[];
}

export function ChainRibbon({ selectedChain, onChainSelect, availableChains }: ChainRibbonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleChainSelect = (chain: string) => {
    onChainSelect(chain);
    setIsOpen(false); // Auto-close after selection
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Main ribbon - subtle design */}
      <div
        className="relative rounded-lg overflow-visible cursor-pointer"
        style={{
          backgroundColor: '#F9F7F1',
          border: '2px solid #E5D5C3',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Selected chain display */}
        <div className="h-8 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8B8380]">Chain:</span>
            <span className="font-semibold text-xs text-[#2D2520]">{selectedChain}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#8B7355]"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </div>

        {/* Expanded chain options - absolute positioned overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.95 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-full left-0 w-full rounded-lg shadow-xl origin-top p-2"
              style={{
                backgroundColor: '#F9F7F1',
                border: '2px solid #E5D5C3',
                zIndex: 9999,
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`
                .chain-dropdown::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex flex-col gap-1">
                {availableChains.map((chain) => {
                  const isSelected = selectedChain === chain.name;
                  return (
                    <motion.button
                      key={chain.key}
                      onClick={() => handleChainSelect(chain.key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs ${
                        isSelected
                          ? 'text-[#2D2520] font-bold'
                          : 'text-[#6B6460]'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#D4C0A8' : 'transparent'
                      }}
                      whileHover={{
                        x: 4,
                        backgroundColor: isSelected ? '#D4C0A8' : '#E8DDD0'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {chain.name}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
