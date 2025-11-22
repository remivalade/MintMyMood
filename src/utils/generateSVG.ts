/**
 * Local SVG Generation (V2.5.0)
 *
 * Generates NFT preview SVG client-side to match the on-chain contract output
 * This is more robust than calling the contract for previews
 *
 * V2.5.0 Changes:
 * - Replaced foreignObject with native SVG text wrapping
 * - Updated chain-specific styles for Ink, HyperLiquid, and MegaETH
 * - Implemented manual line wrapping logic
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
  let accentColor: string | undefined;
  let footerTextColor: string | undefined;

  // Map chain IDs to names and colors (matching contract)
  if (chainId === 0) {
    // Classic style (chain-agnostic)
    chainName = 'CLASSIC';
    primaryColor = '#F9F7F1';
    gradientColor = '#F9F7F1';
    accentColor = '#8B7355';
  } else if (chainId === 84532) {
    // Base Sepolia
    chainName = 'BASE';
    primaryColor = '#0052FF';
    gradientColor = '#0052FF';
  } else if (chainId === 8453) {
    // Base Mainnet
    chainName = 'BASE';
    primaryColor = '#0052FF';
    gradientColor = '#0052FF';
  } else if (chainId === 808813 || chainId === 111) {
    // Bob Testnet
    chainName = 'BOB';
    primaryColor = '#FF6B35';
    gradientColor = '#F7931E';
  } else if (chainId === 60808) {
    // Bob Mainnet
    chainName = 'BOB';
    primaryColor = '#FF6B35';
    gradientColor = '#F7931E';
  } else if (chainId === 763373) {
    // Ink Sepolia
    chainName = 'INK';
    primaryColor = '#5848d5';
    gradientColor = '#0d0c52';
    accentColor = '#21c7f9';
  } else if (chainId === 999999999) {
    // MegaETH Sepolia
    chainName = 'MEGAETH';
    primaryColor = '#111';
    gradientColor = '#AAA';
    footerTextColor = '#19191A';
  } else if (chainId === 888888888) {
    // HyperLiquid Sepolia
    chainName = 'HYPERLIQUID';
    primaryColor = '#0F2925';
    gradientColor = '#8DFADF';
    accentColor = '#8DFADF';
  } else {
    chainName = metadata?.shortName?.toUpperCase() || 'UNKNOWN';
    primaryColor = '#000000';
    gradientColor = '#666666';
  }

  return { chainName, primaryColor, gradientColor, accentColor, footerTextColor };
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
 * Simple text wrapping function for SVG
 * Breaks text into lines of approximately maxChars length
 */
function wrapText(text: string, maxChars: number = 40): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + 1 + words[i].length <= maxChars) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Generate chain-specific background
 */
function getChainBackground(chainId: number, chainPrefix: string): string {
  if (chainId === 0) {
    // Classic - Simple solid cream background
    return `<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="#F9F7F1"></rect>`;
  } else if (chainId === 763373) {
    // Ink - Wave pattern background
    return `<g transform="translate(8, 8) scale(0.968)">
      <rect width="500" height="500" fill="#5848d5"></rect>
      <path d="M0,0L500,0v100.43c0-48.29-60.95-41.79-60.95,0v234.04c0,65.01-83.58,65.94-84.51,0v-255.4c0-36.68-54.79-34.51-54.79,0v112.38c0,58.55-79.87,58.55-79.87,0v-91.01c0-37.15-73.67-37.15-73.67,0v162.53c0,66.87-97.83,66.87-97.83,0v-162.53c0-35.22-48.37-35.22-48.37,0" fill="#0d0c52"></path>
    </g>`;
  } else if (chainId === 999999999) {
    // MegaETH - Grayscale gradient with grain + logo
    return `<rect x="8" y="8" width="484" height="484" rx="15" fill="#111"></rect>
    <rect x="8" y="8" width="484" height="484" rx="15" fill="url(#gggrain-gradient3-${chainPrefix})"></rect>
    <rect x="8" y="8" width="484" height="484" rx="15" fill="url(#gggrain-gradient2-${chainPrefix})"></rect>
    <rect x="8" y="8" width="484" height="484" rx="15" fill="transparent" filter="url(#gggrain-filter-${chainPrefix})" opacity="0.66" style="mix-blend-mode:soft-light"></rect>
    <g transform="translate(-194.6, -213.5) scale(0.9)" fill="#AAA" fill-opacity="0.25" style="pointer-events:none">
      <path d="M639 775c-11.7 0-22.8 0-34 0-4.7 0-8.7-1.1-12-4.9-16.5-18.8-32-38.4-47.8-57.7-1.9-2.3-1.2-4.6-.6-7 3.9-17.2 3.3-34-3.9-50.4-10.9-24.8-35.8-41.4-61.4-40.6-7 .2-14 2-17.3 4.7 6.7 1 13.2 1.3 19.4 2.8 27.5 6.9 47 22.7 53.1 51.5 4.5 21.4-2.4 40.1-16.5 56.3-2.8 3.2-6.3 5.7-9.5 8.5.3.6.6 1.2 1 1.8 5.8 0 11.5-.2 17.3 0 19.7.6 34.1 10.9 40.6 28.6.6 1.6 1.2 3.1 1 5-1.8 1.8-4.2 1.4-6.5 1.4-37.2 0-74.3 0-111.5 0-14.7 0-29.2-1.2-42.2-9.5-14.9-9.4-24.6-22.9-30.3-39.2-13.4-37.9-8.1-74.2 11.1-108.7 18-32.5 45.5-55.3 77.2-73.6 10.8-6.3 22.2-11.4 33.7-16.2 1.4-.6 2.7-1.4 5-.8 2.5 8.4 6.1 16.7 11.3 24.3 16.1 23.5 38.9 35.6 66.6 39.6 7.5 1.1 15 1.4 22.5.9 4.4-.3 5.9 1.5 6.1 5.6 1.3 24.1-2.7 47.1-16 67.4-5.3 8-5.7 15.4-3.6 23.8 4.1 16.4 10.4 32 18.9 46.6 2.2 3.7 5 5.2 9.2 5.6 16.8 1.6 29.8 12.6 34.9 28.7 1.3 4.2 0 5.5-4 5.5-3.6-.1-7.3 0-11.5 0zM614 453c16 7.2 28.1 18.3 37.5 32.5 8.4 12.7 15.7 25.9 21.1 40.2 1.6 4.1 1.5 7.9 0 12-7.1 19.3-19.2 32.9-40.1 38.2-28.3 7.2-55.8 7.2-81.9-7.4-22.2-12.4-35.2-31.3-36.4-57.1-.6-13 2.1-25.9 6.4-38.2 1.6-4.7.7-7.6-2.9-10.8-17.1-15-32.7-31.3-46.5-49.4-17.6-23.2-27.9-49.4-32.6-78-3.5-21-3.7-42-1-63.1.3-2.3.5-4.6 2.1-6.7 4 .6 6.9 3.2 10 5.3 28.7 18.9 53.4 41.9 72.5 70.7 14.4 21.7 22.3 46 28.9 70.9 2.5 9.5 4.6 19.1 6.5 28.7.8 4.1 2.3 5.5 6.6 5 17.1-2.1 33.5.4 49.7 7.2zm-10 62c1.4-.8 3-1.5 4.3-2.5 5.6-4.4 7.4-12.8 4.2-19.4-2.9-6.1-10.1-9.5-16.6-8-9.4 2.2-14.4 9.9-12.4 18.9 1.8 8.1 10.6 13.1 20.5 11zm-8.8-161c5.5 26.2 6.2 52.2 3.9 78.4-.3 3.8-1.7 5.9-6.1 4.5-6.7-2.2-13.8-1.8-20.7-2.2-4.2-.2-5.7-1.9-6.5-5.7-3.7-17.2-8.2-34.3-14-51-5.3-15.5-12.4-30.2-21.4-43.9-3.2-5-4.9-9.9-4.9-15.8 0-19 .5-37.9 5.4-56.4.5-1.7 1.1-3.4 1.6-5.1 17.6 3.1 54.3 59.8 62.7 97.2zM366.5 727.6c4.8 13.5 11.9 25.2 21.2 36.5-8.2 3.8-16.2 5.2-24.2 4.6-29.9-2.3-49.3-28.5-38.6-61.4 1-3 2.8-5.1 5.9-6.2 8.4-3.1 16.9-3.3 25.5-1 3.1.8 4.8 2.5 5.1 5.8.6 7.3 2.8 14.3 5.1 21.7z"></path>
    </g>`;
  } else if (chainId === 888888888) {
    // HyperLiquid - Solid dark background
    return `<rect x="8" y="8" width="484" height="484" rx="15" fill="#0F2925"></rect>`;
  } else {
    // Base, Bob, and default - Gradient with grain
    return `<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="{{PRIMARY_COLOR}}"></rect>
    <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#gggrain-gradient3-${chainPrefix})"></rect>
    <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#gggrain-gradient2-${chainPrefix})"></rect>
    <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#gggrain-filter-${chainPrefix})" opacity="0.66" style="mix-blend-mode: soft-light"></rect>`;
  }
}


/**
 * Generate the complete SVG (matches contract V2.5.0)
 */
export function generateSVG({
  text,
  mood,
  chainId,
  blockNumber = '000000',
}: SVGParams): string {
  const { chainName, primaryColor, gradientColor, accentColor, footerTextColor } = getChainStyles(chainId);
  const chainPrefix = chainName.toLowerCase().replace(/\s+/g, '-');

  // Classic style uses dark text, all others use white/accent colors
  const isClassic = chainId === 0;
  const textAccentColor = accentColor || 'white';
  const mainTextColor = isClassic ? '#2D2D2D' : 'white';
  const secondaryTextColor = isClassic ? '#5A5A5A' : 'white';
  const bottomTextColor = footerTextColor || textAccentColor;

  // Font selection: Ink and MegaETH use sans-serif for center text
  const isSansSerif = chainId === 763373 || chainId === 999999999;
  const centerTextFont = isSansSerif ? 'Arial, sans-serif' : 'Georgia, serif';

  const textShadow = isClassic
    ? '1px 1px 2px rgba(0,0,0,0.2), -1px -1px 2px rgba(255,255,255,0.9)'
    : '-1px -1px 1px rgba(0,0,0,0.4), 1px 1px 1px rgba(255,255,255,0.15)';

  // Get chain-specific background
  const backgroundSVG = getChainBackground(chainId, chainPrefix).replace('{{PRIMARY_COLOR}}', primaryColor);

  // Wrap text into lines
  const lines = wrapText(text, 45); // Approx 45 chars per line

  // Calculate vertical centering
  // Target center Y is approx 285px
  // Formula: startY = 285 - (lines.length * 12)
  const startY = 285 - (lines.length * 12);

  const tspans = lines.map((line, i) => {
    const dy = i === 0 ? 0 : 24;
    return `<tspan x="250" dy="${dy}">${escapeXml(line)}</tspan>`;
  }).join('');

  // Calculate animation width and steps based on block number length
  const blockNumStr = '#' + blockNumber;
  const charCount = blockNumStr.length;
  const animWidth = charCount * 12; // Approx 12px per char
  const animSteps = charCount;

  // Only show block info if we have a valid block number (not 000000)
  const showBlockInfo = blockNumber !== '000000' && blockNumber !== '0';

  return `
<svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>

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
            <feColorMatrix type="saturate" values="0" in="turbulence" result="colormatrix"></feColorMatrix>
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

    </defs>

    <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#drop-shadow)"></rect>

    <g clip-path="url(#card-clip)">

        ${backgroundSVG}


        <g>
            <text x="450" y="90" font-family="sans-serif" font-size="70" text-anchor="end" fill="${mainTextColor}">${mood}</text>
            
            ${showBlockInfo ? `
            <text x="35" y="45" font-family="monospace" font-size="14" fill="${secondaryTextColor}" fill-opacity="0.7">minted on block</text>
            <text x="35" y="65" font-family="monospace" font-size="16" fill="${textAccentColor}" fill-opacity="0.8">${blockNumStr}</text>
            ` : ''}
            
            <!-- NATIVE TEXT WRAPPING -->
            <text x="250" y="${startY}" font-family="${centerTextFont}" font-size="18" fill="${mainTextColor}" text-anchor="middle" style="text-shadow: ${textShadow};">
                ${tspans}
            </text>

            <text x="35" y="475" font-family="monospace" font-size="16" fill="${bottomTextColor}" fill-opacity="0.7" text-anchor="start">${chainName}</text>
            <text x="465" y="475" font-family="monospace" font-size="16" fill="${bottomTextColor}" fill-opacity="0.7" text-anchor="end">MintMyMood</text>
        </g>
    </g>
</svg>
`.trim();
}
