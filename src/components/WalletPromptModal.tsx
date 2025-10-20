import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface WalletPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal that prompts user to connect wallet before minting or saving
 * Opens RainbowKit's native connect modal when user clicks the button
 */
export function WalletPromptModal({ isOpen, onClose }: WalletPromptModalProps) {
  const { openConnectModal } = useConnectModal();

  const handleConnectClick = () => {
    onClose();
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            You're almost ready to save your thought forever on chain.
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-4">
            Connect your wallet to mint your thought as an NFT or save it as ephemeral.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-6">
          <Button
            onClick={handleConnectClick}
            size="lg"
            className="w-full flex items-center justify-center gap-3 text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--leather-brown)' }}
          >
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </Button>

          <button
            onClick={onClose}
            className="text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
