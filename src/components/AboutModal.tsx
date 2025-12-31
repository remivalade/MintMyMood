import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Sparkles, Clock, Image } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleWriteNow = () => {
    if (location.pathname === '/write' || location.pathname === '/') {
      // Already on write page, just close modal
      onClose();
    } else {
      // Navigate to write page
      navigate('/write');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-2xl max-h-[80vh] overflow-auto backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(246, 238, 227, 0.95)',
          borderColor: 'rgba(45, 45, 45, 0.08)'
        }}
        aria-describedby="about-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-h2)',
            fontWeight: '600',
            color: 'var(--soft-black)'
          }}>
            Filter Your Thoughts. Keep What Matters.
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p id="about-dialog-description" className="leading-relaxed" style={{
            fontSize: 'var(--text-ui)',
            color: 'var(--medium-gray)'
          }}>
            Most thoughts are noise. Some are signals. MintMyMood helps you separate them.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Clock className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Ephemeral by Default</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Write freely. Your drafts are private and auto-delete after 7 days. Clear your mind without cluttering your storage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Mint What Matters</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Found a thought worth keeping? Mint it. Turn fleeting insights into permanent, immutable NFTs on the blockchain.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Image className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Pure On-Chain Art</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Your words drive the visual. Each entry is generated as a unique SVG art piece—minimalist, elegant, and stored 100% on-chain.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="mb-3" style={{ color: 'var(--soft-black)' }}>Why MintMyMood?</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--medium-gray)' }}>
              Build Your On-Chain Footprint. Consistent activity is the heartbeat of Web3. Use MintMyMood to turn daily reflection into a verifiable history of transactions. Keep your wallet active and your presence visible, history tends to reward those who show up. 👀
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleWriteNow}
              className="w-full text-white shadow-lg py-6 text-base font-medium tracking-wide hover:opacity-90 transition-opacity rounded-xl"
              style={{ backgroundColor: 'var(--leather-brown)' }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Write now!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
