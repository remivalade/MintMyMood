import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Sparkles, Clock, Image } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
            About MintMyMood
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p id="about-dialog-description" className="leading-relaxed" style={{
            fontSize: 'var(--text-ui)',
            color: 'var(--medium-gray)'
          }}>
            You think a lot. You have so many awesome thoughts. Save these thoughts for eternity!
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Clock className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Ephemeral by Default</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Your thoughts are private and temporary. They automatically disappear after 7 days, encouraging you to reflect on what's truly worth keeping.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Mint as Permanent NFTs</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Choose to preserve your most meaningful thoughts on the blockchain.
                  Each minted thought becomes a unique, beautiful SVG NFT that lives forever.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Image className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Beautiful On-Chain Art</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Your preserved thoughts are rendered as elegant, minimalist art pieces,
                  complete with your chosen mood and the date of creation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="mb-3" style={{ color: 'var(--soft-black)' }}>Why MintMyMood</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--medium-gray)' }}>
              NFTs are a fun way to mint things onchain. Why not our thoughts? Some are nice and worth to share and keep. On the side, it's always good to have regular onchain traces, who knows what that could bring you.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
