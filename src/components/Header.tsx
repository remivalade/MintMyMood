import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { useEnsName } from '../hooks/useEnsName';

interface HeaderProps {
  isWalletConnected: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
}

export function Header({ isWalletConnected, walletAddress, onConnectWallet }: HeaderProps) {
  const { displayName, isEns } = useEnsName(walletAddress as `0x${string}` | undefined);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8F3]/80 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💭</span>
          <h1 className="text-xl" style={{ fontFamily: 'Georgia, serif' }}>
            Pensieve
          </h1>
        </div>

        <div>
          {isWalletConnected && walletAddress ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-800 font-mono">
                {displayName}
              </span>
              {isEns && (
                <span className="text-xs text-green-600 font-sans" title="ENS name resolved">
                  ✓
                </span>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={onConnectWallet}
              className="bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
