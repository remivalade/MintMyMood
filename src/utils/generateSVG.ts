/**
 * Local SVG Generation (V2.4.0)
 *
 * Generates NFT preview SVG client-side to match the on-chain contract output
 * This is more robust than calling the contract for previews
 *
 * V2.4.0 Changes:
 * - Removed address/ENS display (security fix)
 * - Centered text vertically
 * - Simplified interface (removed walletAddress, ensName, ensVerified)
 */

import { getChainMetadata } from '../config/chains';

interface SVGParams {
  text: string;
  mood: string;
  chainId: number;
  blockNumber?: string;
}

/**
 * Get chain-specific colors and name (matches contract colors exactly)
 */
function getChainStyles(chainId: number) {
  const metadata = getChainMetadata(chainId);

  let chainName: string;
  let primaryColor: string;
  let gradientColor: string;

  // Map chain IDs to names and colors (matching contract)
  if (chainId === 84532) {
    // Base Sepolia
    chainName = 'Base Sepolia';
    primaryColor = '#0052FF';
    gradientColor = '#0052FF';
  } else if (chainId === 8453) {
    // Base Mainnet
    chainName = 'Base';
    primaryColor = '#0052FF';
    gradientColor = '#0052FF';
  } else if (chainId === 808813 || chainId === 111) {
    // Bob Testnet
    chainName = 'Bob';
    primaryColor = '#FF6B35';
    gradientColor = '#F7931E';
  } else if (chainId === 60808) {
    // Bob Mainnet
    chainName = 'Bob';
    primaryColor = '#FF6B35';
    gradientColor = '#F7931E';
  } else {
    chainName = metadata?.shortName || 'Unknown';
    primaryColor = '#000000';
    gradientColor = '#666666';
  }

  return { chainName, primaryColor, gradientColor };
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}


/**
 * Generate the complete SVG (matches contract V2.4.0)
 */
export function generateSVG({
  text,
  mood,
  chainId,
  blockNumber = '000000',
}: SVGParams): string {
  const { chainName, primaryColor, gradientColor } = getChainStyles(chainId);
  const escapedText = escapeXml(text);
  const chainPrefix = chainName.toLowerCase().replace(/\s+/g, '-');

  return `
<svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @keyframes typewriter {
                0% { width: 0; }
                50% { width: 80px; }
                80% { width: 80px; }
                100% { width: 0; }
            }
            #block-clip-rect {
                animation: typewriter 4s steps(8) infinite;
            }
        </style>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.4"></feDropShadow>
        </filter>

        <linearGradient gradientTransform="rotate(-202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="gggrain-gradient2-${chainPrefix}">
            <stop stop-color="${gradientColor}" stop-opacity="1" offset="-0%"></stop>
            <stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient gradientTransform="rotate(202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="gggrain-gradient3-${chainPrefix}">
            <stop stop-color="#f9f7f1ff" stop-opacity="1"></stop>
            <stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="40%"></stop>
        </linearGradient>
        <filter id="gggrain-filter-${chainPrefix}" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.63" numOctaves="2" seed="2" stitchTiles="stitch" result="turbulence"></feTurbulence>
            <feColorMatrix type="sate" values="0" in="turbulence" result="colormatrix"></feColorMatrix>
            <feComponentTransfer in="colormatrix" result="componentTransfer">
                <feFuncR type="linear" slope="3"></feFuncR>
                <feFuncG type="linear" slope="3"></feFuncG>
                <feFuncB type="linear" slope="3"></feFuncB>
            </feComponentTransfer>
            <feColorMatrix in="componentTransfer" result="colormatrix2" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -12"></feColorMatrix>
        </filter>

        <clipPath id="card-clip">
            <rect x="8" y="8" width="484" height="484" rx="15" ry="15"></rect>
        </clipPath>
        <clipPath id="block-clip">
            <rect id="block-clip-rect" x="35" y="50" height="20" width="80"></rect>
        </clipPath>
    </defs>

    <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#drop-shadow)"></rect>

    <g clip-path="url(#card-clip)">

        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="${primaryColor}"></rect>
        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#gggrain-gradient3-${chainPrefix})"></rect>
        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#gggrain-gradient2-${chainPrefix})"></rect>
        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#gggrain-filter-${chainPrefix})" opacity="0.66" style="mix-blend-mode: soft-light"></rect>


        <g>
            <text x="450" y="90" font-family="sans-serif" font-size="70" text-anchor="end" fill="white">${mood}</text>
            <text x="35" y="45" font-family="monospace" font-size="14" fill="white" fill-opacity="0.7">minted on block</text>
            <g clip-path="url(#block-clip)">
                <text x="35" y="65" font-family="monospace" font-size="16" fill="white" fill-opacity="0.8">#${blockNumber}</text>
            </g>
            <foreignObject x="50" y="120" width="400" height="314">
                <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                    <div style="color: white; font-family: Georgia, serif; font-size: 18px; word-wrap: break-word; line-height: 1.5; text-shadow: -1px -1px 1px rgba(0,0,0,0.4), 1px 1px 1px rgba(255,255,255,0.15); text-align: center; max-width: 100%;">
                        ${escapedText}
                    </div>
                </div>
            </foreignObject>
            <text x="35" y="465" font-family="monospace" font-size="16" fill="white" fill-opacity="0.7" text-anchor="start">${chainName}</text>
            <text x="465" y="465" font-family="monospace" font-size="16" fill="white" fill-opacity="0.7" text-anchor="end">MintMyMood</text>
        </g>
    </g>
</svg>
`.trim();
}
