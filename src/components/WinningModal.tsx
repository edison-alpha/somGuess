import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { Trophy, Star, Sparkles, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface WinningModalProps {
  isOpen: boolean;
  onClose: () => void;
  winningNumber: number;
  payout: number;
  onPlayAgain: () => void;
}

export function WinningModal({ 
  isOpen, 
  onClose, 
  winningNumber, 
  payout, 
  onPlayAgain 
}: WinningModalProps) {
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

  const getTrophySize = () => {
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
        return 'max-w-sm mx-4 bg-slate-900/95 border-neon-green/50 backdrop-blur-xl';
      }
      if (width < 1024) {
        return 'max-w-lg mx-4 bg-slate-900/95 border-neon-green/50 backdrop-blur-xl';
      }
      return 'max-w-2xl bg-slate-900/95 border-neon-green/50 backdrop-blur-xl';
    }
    return isMobile 
      ? 'max-w-sm mx-4 bg-slate-900/95 border-neon-green/50 backdrop-blur-xl'
      : 'max-w-2xl bg-slate-900/95 border-neon-green/50 backdrop-blur-xl';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={getModalClass()}>
        <DialogHeader className="text-center space-y-2 md:space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center"
          >
            <div className="relative">
              <Trophy className={cn(getTrophySize(), "text-neon-green animate-bounce")} />
              <motion.div
                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-neon-yellow rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Star className="w-2 h-2 md:w-3 md:h-3 text-slate-900" />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className="text-xl md:text-3xl font-bold bg-gradient-to-r from-neon-green via-neon-cyan to-neon-green bg-clip-text text-transparent">
            🎉 CONGRATULATIONS! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Winning Card Display */}
          <div className="flex justify-center relative py-4 px-4 md:py-6 md:px-8">
            {/* Background glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-neon-green/20 via-neon-cyan/20 to-neon-green/20 rounded-full blur-2xl md:blur-3xl"
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
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(isMobile ? 8 : 12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-neon-yellow rounded-full"
                  style={{
                    left: `${20 + (i * 5)}%`,
                    top: `${10 + (i % 3) * 30}%`,
                  }}
                  animate={{
                    y: [0, isMobile ? -20 : -30, 0],
                    x: [0, Math.sin(i) * (isMobile ? 15 : 20), 0],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Main winning card */}
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
                number={winningNumber}
                isSelected={true}
                isRevealed={true}
                isWinning={true}
                onClick={() => {}}
                disabled={false}
              />
            </motion.div>
          </div>

          {/* Payout Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-3 md:space-y-4"
          >
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-3 md:p-4 rounded-lg border border-neon-green/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-4 h-4 md:w-5 md:h-5 text-neon-green" />
                <span className="text-base md:text-lg font-semibold text-neon-green">Your Winnings</span>
              </div>
              <motion.div
                className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-neon-green via-neon-cyan to-neon-green bg-clip-text text-transparent"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {payout.toFixed(3)} STT
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-base md:text-lg text-muted-foreground">
                Winning Number: <span className="font-bold text-neon-green text-lg md:text-xl">{winningNumber}</span>
              </p>
              <motion.p
                className="text-xs md:text-sm text-neon-cyan font-medium px-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
                Lucky guess! Your fortune awaits!
                <Sparkles className="inline w-3 h-3 md:w-4 md:h-4 ml-1" />
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
              className="flex-1 border-neon-green/50 text-neon-green hover:bg-neon-green/10 text-sm md:text-base"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className={cn(
                "flex-1 bg-gradient-gaming hover:shadow-neon transition-all duration-300",
                "font-bold text-sm md:text-lg"
              )}
              onClick={handlePlayAgain}
            >
              <Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              Play Again
            </Button>
          </motion.div>
        </div>

        {/* Celebration confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {isOpen && (
              <>
                {[...Array(isMobile ? 15 : 20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full"
                    style={{
                      backgroundColor: [
                        'hsl(var(--neon-green))',
                        'hsl(var(--neon-cyan))',
                        'hsl(var(--neon-yellow))',
                        'hsl(var(--neon-pink))'
                      ][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: '-10px'
                    }}
                    initial={{ y: -10, opacity: 1 }}
                    animate={{ 
                      y: isMobile ? 400 : 500,
                      x: Math.sin(i) * (isMobile ? 80 : 100),
                      rotate: 360,
                      opacity: 0
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 2,
                      ease: "easeOut"
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
