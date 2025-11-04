/**
 * Ephemeral SVG Generation
 *
 * Generates SVG for ephemeral (unminted) thoughts in the detail view
 * Similar layout to minted SVGs but without blockchain-specific elements
 */

interface EphemeralSVGParams {
  text: string;
  mood: string;
  walletAddress: string;
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
 * Format address as 0x1A2b...dE3F
 */
function formatAddress(address: string): string {
  if (address.length < 42) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Generate SVG for ephemeral thought
 * Uses same cream background as gallery cards: rgba(246, 238, 227, 0.6)
 */
export function generateEphemeralSVG({
  text,
  mood,
  walletAddress,
}: EphemeralSVGParams): string {
  const escapedText = escapeXml(text);
  const displayAddress = formatAddress(walletAddress);

  // Ephemeral background color (matching ThoughtCard)
  const backgroundColor = '#f6eee3'; // rgba(246, 238, 227, 1) as hex

  return `
<svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="drop-shadow-ephemeral" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.4"></feDropShadow>
        </filter>

        <linearGradient gradientTransform="rotate(202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="gggrain-gradient-ephemeral">
            <stop stop-color="#f9f7f1ff" stop-opacity="1"></stop>
            <stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="40%"></stop>
        </linearGradient>
        <filter id="gggrain-filter-ephemeral" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.63" numOctaves="2" seed="2" stitchTiles="stitch" result="turbulence"></feTurbulence>
            <feColorMatrix type="sate" values="0" in="turbulence" result="colormatrix"></feColorMatrix>
            <feComponentTransfer in="colormatrix" result="componentTransfer">
                <feFuncR type="linear" slope="3"></feFuncR>
                <feFuncG type="linear" slope="3"></feFuncG>
                <feFuncB type="linear" slope="3"></feFuncB>
            </feComponentTransfer>
            <feColorMatrix in="componentTransfer" result="colormatrix2" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -12"></feColorMatrix>
        </filter>

        <clipPath id="card-clip-ephemeral">
            <rect x="8" y="8" width="484" height="484" rx="15" ry="15"></rect>
        </clipPath>
    </defs>

    <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#drop-shadow-ephemeral)"></rect>

    <g clip-path="url(#card-clip-ephemeral)">
        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="${backgroundColor}"></rect>
        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#gggrain-gradient-ephemeral)"></rect>
        <rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#gggrain-filter-ephemeral)" opacity="0.66" style="mix-blend-mode: soft-light"></rect>

        <g>
            <text x="450" y="90" font-family="sans-serif" font-size="70" text-anchor="end" fill="#2D2D2D">${mood}</text>
            <foreignObject x="50" y="100" width="400" height="334">
                <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <div style="color: #2D2D2D; font-family: Georgia, serif; font-size: 18px; word-wrap: break-word; line-height: 1.5; text-shadow: 0 1px 2px rgba(0,0,0,0.1); text-align: left; max-width: 100%;">
                        ${escapedText}
                    </div>
                    <div style="margin-top: 20px; color: #5A5A5A; font-family: monospace; font-size: 14px; opacity: 0.8;">
                        ${displayAddress}
                    </div>
                </div>
            </foreignObject>
            <text x="465" y="465" font-family="monospace" font-size="16" fill="#5A5A5A" fill-opacity="0.7" text-anchor="end">MintMyMood</text>
        </g>
    </g>
</svg>
`.trim();
}
