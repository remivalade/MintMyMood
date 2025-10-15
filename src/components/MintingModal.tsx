import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MintingModalProps {
  isOpen: boolean;
  status: 'minting' | 'success' | 'error';
  onClose: () => void;
  onViewGallery?: () => void;
  errorMessage?: string;
}

export function MintingModal({ isOpen, status, onClose, onViewGallery, errorMessage }: MintingModalProps) {
  const getTitle = () => {
    switch (status) {
      case 'minting':
        return 'Preserving your memory...';
      case 'success':
        return 'Your thought is eternal';
      case 'error':
        return 'Something went wrong';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'minting':
        return 'This may take a moment. Please don\'t close this window.';
      case 'success':
        return 'Your memory has been preserved on-chain forever';
      case 'error':
        return errorMessage || 'Failed to mint your thought';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md backdrop-blur-xl" 
        style={{ 
          backgroundColor: 'rgba(246, 238, 227, 0.95)',
          borderColor: 'rgba(45, 45, 45, 0.08)'
        }} 
        aria-describedby="minting-dialog-description"
      >
        <div className="sr-only">
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription id="minting-dialog-description">{getDescription()}</DialogDescription>
        </div>
        
        {/* Minting in Progress */}
        {status === 'minting' && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-6"
            >
              <Loader2 className="w-16 h-16" style={{ color: 'var(--leather-brown)' }} />
            </motion.div>
            <h3 className="mb-3" style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h2)',
              fontWeight: '600',
              color: 'var(--soft-black)'
            }}>
              Preserving your memory...
            </h3>
            <p className="mb-2" style={{ fontSize: 'var(--text-ui)', color: 'var(--medium-gray)' }}>
              This may take a moment
            </p>
            <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>
              Please don't close this window
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <CheckCircle2 className="w-16 h-16" style={{ color: 'var(--success-green)' }} />
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <CheckCircle2 className="w-16 h-16" style={{ color: 'var(--success-green)' }} />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-3" style={{ 
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-h2)',
                fontWeight: '600',
                color: 'var(--soft-black)'
              }}>
                Your thought is eternal ✨
              </h3>
              <p className="mb-8" style={{ fontSize: 'var(--text-ui)', color: 'var(--medium-gray)' }}>
                Your memory has been preserved on-chain forever
              </p>
              
              <div className="flex flex-col gap-3 items-center">
                <Button
                  onClick={onViewGallery}
                  className="w-full text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--leather-brown)' }}
                >
                  View in Gallery
                </Button>
                <button
                  onClick={onClose}
                  className="hover:opacity-70 transition-opacity underline decoration-1 underline-offset-4"
                  style={{ 
                    color: 'var(--medium-gray)',
                    fontSize: 'var(--text-ui)'
                  }}
                >
                  Write another thought
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="inline-block mb-6"
            >
              <XCircle className="w-16 h-16" style={{ color: 'var(--error-red)' }} />
            </motion.div>
            
            <h3 className="mb-3" style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-h2)',
              fontWeight: '600',
              color: 'var(--soft-black)'
            }}>
              Something went wrong
            </h3>
            <p className="mb-2" style={{ fontSize: 'var(--text-ui)', color: 'var(--medium-gray)' }}>
              {errorMessage || 'Failed to mint your thought'}
            </p>
            <p className="text-sm mb-8" style={{ color: 'var(--medium-gray)' }}>
              Don't worry, your thought is still saved
            </p>
            
            <div className="flex flex-col gap-3 items-center">
              <Button
                onClick={onClose}
                className="w-full text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--leather-brown)' }}
              >
                Try Again
              </Button>
              <button
                onClick={onViewGallery}
                className="hover:opacity-70 transition-opacity underline decoration-1 underline-offset-4"
                style={{ 
                  color: 'var(--medium-gray)',
                  fontSize: 'var(--text-ui)'
                }}
              >
                Return to Gallery
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
