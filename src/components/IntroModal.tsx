import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface IntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntroModal({ isOpen, onClose }: IntroModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md backdrop-blur-xl" 
        style={{ 
          backgroundColor: 'rgba(246, 238, 227, 0.95)',
          borderColor: 'rgba(45, 45, 45, 0.08)'
        }} 
        aria-describedby="intro-dialog-description"
      >
        <div className="text-center py-4">
          <div className="text-6xl mb-6">💭</div>
          
          <DialogTitle className="mb-4" style={{ 
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-h1)',
            fontWeight: '600',
            color: 'var(--soft-black)'
          }}>
            Pensieve
          </DialogTitle>
          
          <DialogDescription id="intro-dialog-description" className="mb-6 leading-relaxed" style={{
            fontSize: 'var(--text-ui)',
            color: 'var(--medium-gray)'
          }}>
            A sanctuary for your thoughts. Write freely—your words are ephemeral by default. 
            When something feels worth keeping forever, you can mint it as a beautiful on-chain NFT.
          </DialogDescription>

          <Button
            onClick={onClose}
            className="w-full text-white"
            style={{ backgroundColor: 'var(--leather-brown)' }}
          >
            Start writing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
