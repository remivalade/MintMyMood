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
  styleId?: number;
  onClick: () => void;
}

/**
 * Card component for displaying minted NFT thoughts
 * Shows the actual on-chain SVG (V2.4.0 - no address display)
 */
export function MintedNFTCard({
  content,
  mood,
  chainId,
  walletAddress,
  blockNumber = '000000',
  ensName,
  styleId = 0,
  onClick
}: MintedNFTCardProps) {
  const svg = generateSVG({
    text: content,
    mood,
    chainId,
    blockNumber,
    styleId,
  });

  const chainMetadata = CHAIN_METADATA[chainId];

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="relative w-full group"
    >


      {/* SVG Container */}
      <div
        className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl transition-shadow group-hover:shadow-3xl border border-black/10"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </motion.button>
  );
}
