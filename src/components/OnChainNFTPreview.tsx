import { useLocalPreviewSVG } from '../hooks/useLocalPreviewSVG';

interface OnChainNFTPreviewProps {
  content: string;
  mood: string;
  styleId?: number; // 0 = Native, 1 = Classic
}

/**
 * Displays the NFT preview SVG generated locally
 * This ensures the preview matches what will be minted without relying on contract calls
 */
export function OnChainNFTPreview({ content, mood, styleId = 0 }: OnChainNFTPreviewProps) {
  const { svg, isLoading, error } = useLocalPreviewSVG(content, mood, styleId);

  if (isLoading) {
    return (
      <div className="aspect-square w-full max-w-[500px] mx-auto flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-square w-full max-w-[500px] mx-auto flex items-center justify-center bg-red-50 rounded-2xl border border-red-200">
        <div className="text-center p-8">
          <p className="text-red-600 mb-2">Failed to generate preview</p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="aspect-square w-full max-w-[500px] mx-auto flex items-center justify-center bg-gray-100 rounded-2xl">
        <p className="text-gray-600">No preview available</p>
      </div>
    );
  }

  // Render the SVG directly
  return (
    <div
      className="aspect-square w-full max-w-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
