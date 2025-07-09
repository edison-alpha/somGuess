import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { Skull, TrendingDown, RefreshCw, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumber: number;
  winningNumber: number;
  betAmount: number;
  onPlayAgain: () => void;
}

export function LosingModal({ 
  isOpen, 
  onClose, 
  selectedNumber,
  winningNumber, 
  betAmount, 
  onPlayAgain 
}: LosingModalProps) {
  const isMobile = useIsMobile();

  const handlePlayAgain = () => {
    onClose();
    onPlayAgain();
  };

  // Enhanced responsive scaling for different devices
  const getCardScale = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 'scale-90'; // Mobile - smaller
      if (width < 1024) return 'scale-100'; // Tablet - normal
      return 'scale-110'; // Desktop - slightly larger
    }
    return isMobile ? 'scale-90' : 'scale-110';
  };

  const getSkullSize = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 'w-10 h-10'; // Mobile - smaller
      if (width < 1024) return 'w-14 h-14'; // Tablet - medium
      return 'w-16 h-16'; // Desktop - large
    }
    return isMobile ? 'w-10 h-10' : 'w-16 h-16';
  };

  const getModalClass = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) {
        return 'max-w-sm mx-4 bg-slate-900/95 border-red-500/50 backdrop-blur-xl';
      }
      if (width < 1024) {
        return 'max-w-lg mx-4 bg-slate-900/95 border-red-500/50 backdrop-blur-xl';
      }
      return 'max-w-2xl bg-slate-900/95 border-red-500/50 backdrop-blur-xl';
    }
    return isMobile 
      ? 'max-w-sm mx-4 bg-slate-900/95 border-red-500/50 backdrop-blur-xl'
      : 'max-w-2xl bg-slate-900/95 border-red-500/50 backdrop-blur-xl';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={getModalClass()}>
        <DialogHeader className="text-center space-y-2 md:space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center"
          >
            <div className="relative">
              <Skull className={cn(getSkullSize(), "text-red-500 animate-pulse")} />
              <motion.div
                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <TrendingDown className="w-2 h-2 md:w-3 md:h-3 text-white" />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className="text-xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
            💔 BETTER LUCK NEXT TIME! 💔
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Cards Display - Both selected and winning */}
          <div className="flex justify-center relative py-4 px-4 md:py-6 md:px-8">
            {/* Background glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 rounded-full blur-2xl md:blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Floating sad particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(isMobile ? 6 : 8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-red-400 rounded-full"
                  style={{
                    left: `${20 + (i * 8)}%`,
                    top: `${15 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    y: [0, isMobile ? 15 : 20, 0],
                    x: [0, Math.sin(i) * (isMobile ? -10 : -15), 0],
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Cards comparison */}
            <div className="flex gap-4 md:gap-8 items-center">
              {/* Your selected card */}
              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  initial={{ scale: 0, rotateY: -180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20,
                    delay: 0.3
                  }}
                  className={cn("relative z-10 flex justify-center items-center", getCardScale())}
                >
                  <GameCard
                    number={selectedNumber}
                    isSelected={false}
                    isRevealed={true}
                    isWinning={false}
                    onClick={() => {}}
                    disabled={true}
                  />
                </motion.div>
                <p className="text-xs md:text-sm text-red-400 font-medium">Your Choice</p>
              </div>

              {/* VS separator */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-xl md:text-2xl font-bold text-red-500"
              >
                VS
              </motion.div>

              {/* Winning card */}
              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20,
                    delay: 0.5
                  }}
                  className={cn("relative z-10 flex justify-center items-center", getCardScale())}
                >
                  <GameCard
                    number={winningNumber}
                    isSelected={true}
                    isRevealed={true}
                    isWinning={true}
                    onClick={() => {}}
                    disabled={true}
                  />
                </motion.div>
                <p className="text-xs md:text-sm text-green-400 font-medium">Winner</p>
              </div>
            </div>
          </div>

          {/* Loss Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-3 md:space-y-4"
          >
            <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 p-3 md:p-4 rounded-lg border border-red-500/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                <span className="text-base md:text-lg font-semibold text-red-400">Amount Lost</span>
              </div>
              <motion.div
                className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent"
                animate={{
                  scale: [1, 0.95, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                -{betAmount.toFixed(3)} STT
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-base md:text-lg text-muted-foreground">
                Your Number: <span className="font-bold text-red-400 text-lg md:text-xl">{selectedNumber}</span>
                {" | "}
                Winning Number: <span className="font-bold text-green-400 text-lg md:text-xl">{winningNumber}</span>
              </p>
              <motion.p
                className="text-xs md:text-sm text-red-400 font-medium px-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
                Don't give up! Fortune favors the persistent!
                <Heart className="inline w-3 h-3 md:w-4 md:h-4 ml-1" />
              </motion.p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm md:text-base"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className={cn(
                "flex-1 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600",
                "text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300",
                "font-bold text-sm md:text-lg"
              )}
              onClick={handlePlayAgain}
            >
              <RefreshCw className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              Try Again
            </Button>
          </motion.div>
        </div>

        {/* Sad rain effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {isOpen && (
              <>
                {[...Array(isMobile ? 8 : 12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-8 md:w-1.5 md:h-12 bg-gradient-to-b from-red-400/60 to-transparent rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-20px'
                    }}
                    initial={{ y: -20, opacity: 0.6 }}
                    animate={{ 
                      y: isMobile ? 400 : 500,
                      opacity: 0
                    }}
                    transition={{
                      duration: 2 + Math.random() * 1,
                      delay: Math.random() * 3,
                      ease: "easeIn",
                      repeat: Infinity,
                      repeatDelay: Math.random() * 2
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
