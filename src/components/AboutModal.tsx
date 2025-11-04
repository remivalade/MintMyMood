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
            MintMyMood is a minimalist journaling app built on the tension between the temporary and the eternal. 
            It's a space for capturing fleeting thoughts that, by default, are ephemeral and disappear after a set period.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}>
                <Clock className="w-6 h-6" style={{ color: 'var(--leather-brown)' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: 'var(--soft-black)' }}>Ephemeral by Default</h3>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
                  Your thoughts are private and temporary. They automatically disappear after 7 days, 
                  creating a gentle sense of urgency and encouraging you to reflect on what's truly worth keeping.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-1">Mint as Permanent NFTs</h3>
                <p className="text-sm text-gray-600">
                  Choose to preserve your most meaningful thoughts on the blockchain. 
                  Each minted thought becomes a unique, beautiful SVG NFT that lives forever.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="mb-1">Beautiful On-Chain Art</h3>
                <p className="text-sm text-gray-600">
                  Your preserved thoughts are rendered as elegant, minimalist art pieces, 
                  complete with your chosen mood and the date of creation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="mb-3" style={{ color: 'var(--soft-black)' }}>Philosophy</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--medium-gray)' }}>
              Not every thought needs to be permanent. Most moments are meant to be experienced and released. 
              But some memories, some insights, some feelings deserve to be preserved forever. 
              MintMyMood helps you distinguish between the two.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
