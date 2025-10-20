import { motion } from 'motion/react';
import { generateSVG } from '../utils/generateSVG';
import { CHAIN_METADATA } from '../config/chains';

interface MintedNFTCardProps {
  content: string;
  mood: string;
  chainId: number;
  walletAddress: string;
  blockNumber?: string;
  ensName?: string;
  onClick: () => void;
}

/**
 * Card component for displaying minted NFT thoughts
 * Shows the actual on-chain SVG
 */
export function MintedNFTCard({
  content,
  mood,
  chainId,
  walletAddress,
  blockNumber = '000000',
  ensName,
  onClick
}: MintedNFTCardProps) {
  const svg = generateSVG({
    text: content,
    mood,
    chainId,
    walletAddress,
    blockNumber,
    ensName,
  });

  const chainMetadata = CHAIN_METADATA[chainId];

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="relative w-full group"
    >
      {/* Chain badge */}
      {chainMetadata && (
        <div
          className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs uppercase tracking-wide text-white font-medium shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${chainMetadata.colors.from}, ${chainMetadata.colors.to})`
          }}
        >
          {chainMetadata.shortName}
        </div>
      )}

      {/* SVG Container */}
      <div
        className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl transition-shadow group-hover:shadow-3xl border border-black/10"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </motion.button>
  );
}
