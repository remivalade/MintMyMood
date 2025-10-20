import { useChainId } from 'wagmi';
import { getChainMetadata } from '../config/chains';

interface NFTPreviewProps {
  content: string;
  mood: string;
  address?: string;
  ensName?: string;
}

/**
 * Chain-specific NFT Preview Component
 * Replicates the on-chain SVG appearance with chain-specific colors
 */
export function NFTPreview({ content, mood, address, ensName }: NFTPreviewProps) {
  const chainId = useChainId();
  const metadata = getChainMetadata(chainId);

  // Chain-specific background colors
  const isBase = chainId === 84532 || chainId === 8453; // Base Sepolia or Base Mainnet
  const bgColor = isBase ? '#0052FF' : '#FF6B35'; // Base blue or Bob orange
  const gradientColor = isBase ? '#3c8aff' : '#F7931E';

  const chainName = metadata?.shortName || 'Chain';
  const displayAddress = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x0000...0000');
  const mockBlockNumber = Math.floor(Math.random() * 1000000);

  return (
    <div className="aspect-square w-full max-w-[500px] mx-auto relative rounded-2xl overflow-hidden shadow-2xl">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(-202deg, ${bgColor} 0%, ${gradientColor} 100%)`,
        }}
      />

      {/* Cream overlay gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(202deg, #f9f7f1ff 0%, rgba(255,255,255,0) 40%)`,
          opacity: 0.7,
        }}
      />

      {/* Grain texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.66, mixBlendMode: 'soft-light' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.63" numOctaves="2" seed="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="3" />
            <feFuncG type="linear" slope="3" />
            <feFuncB type="linear" slope="3" />
          </feComponentTransfer>
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -12" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Top section */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white/70 font-mono text-xs mb-1">minted on block</div>
              <div className="text-white/80 font-mono text-sm">#{mockBlockNumber}</div>
            </div>
            <div className="text-6xl">{mood}</div>
          </div>
        </div>

        {/* Journal text */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p
              className="text-white font-serif text-lg leading-relaxed mb-4"
              style={{
                textShadow: '-1px -1px 1px rgba(0,0,0,0.4), 1px 1px 1px rgba(255,255,255,0.15)',
                maxHeight: '300px',
                overflow: 'hidden',
              }}
            >
              {content.length > 280 ? content.slice(0, 280) + '...' : content}
            </p>
            <div className="text-white/80 font-mono text-sm">
              {displayAddress}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex items-end justify-between text-white/70 font-mono text-sm">
          <div>{chainName}</div>
          <div>MintMyMood</div>
        </div>
      </div>
    </div>
  );
}
