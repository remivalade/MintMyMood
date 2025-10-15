import { Button } from './ui/button';
import { motion } from 'motion/react';

interface WelcomeProps {
  onStart: () => void;
}

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
          className="text-8xl mb-8"
        >
          💭
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl mb-6"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Pensieve
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-600 mb-4 leading-relaxed"
        >
          A sanctuary for your thoughts
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-500 mb-12 max-w-lg mx-auto"
        >
          Capture fleeting moments and preserve what matters. Your thoughts are ephemeral by default, but you have the power to make them eternal.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <Button
            onClick={onStart}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-xl px-8 py-6 text-lg"
          >
            Begin your journey
          </Button>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">🕐</div>
              <div>Ephemeral by default</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <div>Mint as NFTs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div>Beautiful on-chain art</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
