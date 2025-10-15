import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
}

const wallets = [
  { name: 'MetaMask', icon: '🦊', description: 'Connect using MetaMask' },
  { name: 'WalletConnect', icon: '🔗', description: 'Scan with your mobile wallet' },
  { name: 'Coinbase Wallet', icon: '💼', description: 'Connect using Coinbase' },
];

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md backdrop-blur-xl" 
        style={{ 
          backgroundColor: 'rgba(246, 238, 227, 0.95)',
          borderColor: 'rgba(45, 45, 45, 0.08)'
        }} 
        aria-describedby="wallet-dialog-description"
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
              <Wallet className="w-8 h-8" style={{ color: 'var(--leather-brown)' }} />
            </div>
          </div>
          <DialogTitle className="text-center" style={{ 
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-h2)',
            fontWeight: '600',
            color: 'var(--soft-black)'
          }}>
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription id="wallet-dialog-description" className="text-center" style={{ 
            fontSize: 'var(--text-ui)',
            color: 'var(--medium-gray)'
          }}>
            Choose a wallet to preserve your thoughts on-chain
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => onConnect(wallet.name)}
              className="w-full p-4 border transition-all flex items-center gap-4 text-left hover:opacity-80"
              style={{ 
                borderRadius: 'var(--radius-lg)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--paper-cream)'
              }}
            >
              <div className="text-3xl">{wallet.icon}</div>
              <div className="flex-1">
                <div className="mb-1" style={{ color: 'var(--soft-black)' }}>{wallet.name}</div>
                <div className="text-sm" style={{ color: 'var(--medium-gray)' }}>{wallet.description}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--medium-gray)' }}>
          By connecting your wallet, you agree to preserve your thoughts on the blockchain
        </p>
      </DialogContent>
    </Dialog>
  );
}
