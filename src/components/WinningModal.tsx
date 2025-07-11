import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { Trophy, Star, Sparkles, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenSize } from '@/hooks/useScreenSize';

interface WinningModalProps {
  isOpen: boolean;
  onClose: () => void;
  winningNumber: number;
  payout: number;
  txHash?: string | null;
  onPlayAgain: () => void;
  displayedNumbers?: number[]; // Add displayed numbers from smart contract
}

export function WinningModal({ 
  isOpen, 
  onClose, 
  winningNumber, 
  payout, 
  txHash,
  onPlayAgain,
  displayedNumbers = [] // Default to empty array if not provided
}: WinningModalProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize();

  const handlePlayAgain = () => {
    onClose();
    onPlayAgain();
  };

  // Enhanced responsive sizing based on screen size
  const getResponsiveClasses = () => {
    if (isMobile) {
      return {
        modal: 'max-w-[95vw] mx-2 bg-slate-900/95 border-neon-green/50 backdrop-blur-xl',
        cardScale: 'scale-75',
        trophySize: 'w-8 h-8',
        titleSize: 'text-lg',
        spacing: 'space-y-3',
        cardContainer: 'py-3',
        padding: 'p-2',
        textSize: 'text-xs',
        buttonSize: 'text-sm py-2',
        iconSize: 'w-3 h-3',
        starCount: 8,
        payoutText: 'text-xl'
      };
    }
    
    if (isTablet) {
      return {
        modal: 'max-w-lg mx-4 bg-slate-900/95 border-neon-green/50 backdrop-blur-xl',
        cardScale: 'scale-90',
        trophySize: 'w-12 h-12',
        titleSize: 'text-2xl',
        spacing: 'space-y-4',
        cardContainer: 'py-4',
        padding: 'p-3',
        textSize: 'text-sm',
        buttonSize: 'text-base py-2.5',
        iconSize: 'w-4 h-4',
        starCount: 10,
        payoutText: 'text-3xl'
      };
    }
    
    // Desktop
    return {
      modal: 'max-w-xl bg-slate-900/95 border-neon-green/50 backdrop-blur-xl',
      cardScale: 'scale-90',
      trophySize: 'w-12 h-12',
      titleSize: 'text-2xl',
      spacing: 'space-y-2',
      cardContainer: 'py-3',
      padding: 'p-2',
      textSize: 'text-sm',
      buttonSize: 'text-base py-2',
      iconSize: 'w-4 h-4',
      starCount: 8,
      payoutText: 'text-2xl'
    };
  };

  const responsive = getResponsiveClasses();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={responsive.modal}>
        <DialogHeader className={cn("text-center", responsive.spacing)}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center"
          >
            <div className="relative">
              <Trophy className={cn(responsive.trophySize, "text-neon-green animate-bounce")} />
              <motion.div
                className={cn(
                  "absolute -top-1 -right-1 bg-neon-yellow rounded-full flex items-center justify-center",
                  isMobile ? "w-3 h-3" : isTablet ? "w-5 h-5" : "w-6 h-6"
                )}
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
                <Star className={cn(responsive.iconSize, "text-slate-900")} />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className={cn(
            responsive.titleSize,
            "font-bold text-neon-cyan text-center"
          )}>
            🎉 CONGRATULATIONS! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className={responsive.spacing}>
          {/* Winning Card Display */}
          <div className={cn("flex justify-center relative", responsive.cardContainer)}>
            {/* Background glow effect */}
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-neon-green/20 via-neon-cyan/20 to-neon-green/20 rounded-full",
                isMobile ? "blur-xl" : isTablet ? "blur-2xl" : "blur-3xl"
              )}
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
              {[...Array(responsive.starCount)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "absolute bg-neon-yellow rounded-full",
                    isMobile ? "w-1 h-1" : "w-1.5 h-1.5"
                  )}
                  style={{
                    left: `${20 + (i * 5)}%`,
                    top: `${10 + (i % 3) * 30}%`,
                  }}
                  animate={{
                    y: [0, isMobile ? -15 : isTablet ? -20 : -30, 0],
                    x: [0, Math.sin(i) * (isMobile ? 10 : isTablet ? 15 : 20), 0],
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
              className={cn("relative z-10 flex justify-center items-center", responsive.cardScale)}
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
            className={cn("text-center", isMobile ? "space-y-2" : "space-y-3")}
          >
            <div className={cn(
              "bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-neon-green/30",
              responsive.padding
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className={responsive.iconSize} />
                <span className={cn(responsive.textSize, "font-semibold text-neon-green")}>Your Winnings</span>
              </div>
              <motion.div
                className={cn(
                  responsive.payoutText,
                  "font-bold bg-gradient-to-r from-neon-green via-neon-cyan to-neon-green bg-clip-text text-transparent"
                )}
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

            <div className={cn("text-center", isMobile ? "space-y-1" : "space-y-2")}>
              {/* Display the 3 numbers from smart contract first */}
              {displayedNumbers.length > 0 && (
                <div className={cn("mb-3", isMobile ? "space-y-1" : "space-y-2")}>
                  <p className={cn(responsive.textSize, "text-muted-foreground")}>
                    Smart Contract Generated Numbers:
                  </p>
                  <div className="flex justify-center gap-2">
                    {displayedNumbers.map((num, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + (index * 0.1) }}
                        className={cn(
                          "px-3 py-1 bg-slate-700/50 border border-neon-cyan/30 rounded-md",
                          "text-neon-cyan font-bold",
                          isMobile ? "text-xs" : "text-sm"
                        )}
                      >
                        {num}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
              
              <p className={cn(responsive.textSize, "text-muted-foreground")}>
                Winning Number: <span className={cn(
                  "font-bold text-neon-green",
                  isMobile ? "text-base" : isTablet ? "text-lg" : "text-xl"
                )}>{winningNumber}</span>
              </p>
              
              <motion.p
                className={cn(
                  isMobile ? "text-xs" : responsive.textSize,
                  "text-neon-cyan font-medium px-2"
                )}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className={cn("inline", responsive.iconSize, "mr-1")} />
                Lucky guess! Your fortune awaits!
                <Sparkles className={cn("inline", responsive.iconSize, "ml-1")} />
              </motion.p>
            </div>
          </motion.div>

          {/* Transaction Info */}
          {txHash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={cn("text-center", isMobile ? "space-y-1" : "space-y-2")}
            >
              <div className={cn(
                "bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg border border-neon-green/20",
                responsive.padding
              )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className={responsive.iconSize} />
                  <span className={cn(responsive.textSize, "font-semibold text-neon-cyan")}>Transaction Info</span>
                </div>
                <a
                  href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-colors duration-200 text-neon-green hover:text-white",
                    isMobile ? "px-2 py-1.5 text-xs" : isTablet ? "px-3 py-2 text-sm" : "px-3 py-2 text-sm"
                  )}
                >
                  <span>View on Shannon Explorer</span>
                  <svg className={responsive.iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={cn(
              "flex gap-3",
              isMobile ? "flex-col" : "flex-col sm:flex-row"
            )}
          >
            <Button
              variant="outline"
              className={cn(
                "flex-1 border-neon-green/50 text-neon-green hover:bg-neon-green/10",
                responsive.buttonSize
              )}
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className={cn(
                "flex-1 bg-neon-blue hover:shadow-neon-cyan transition-all duration-300",
                "text-white font-bold",
                responsive.buttonSize
              )}
              onClick={handlePlayAgain}
            >
              <Trophy className={cn("mr-2", responsive.iconSize)} />
              Play Again
            </Button>
          </motion.div>
        </div>

        {/* Celebration confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {isOpen && (
              <>
                {[...Array(isMobile ? 10 : isTablet ? 15 : 20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute rounded-full",
                      isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                    )}
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
                      y: isMobile ? 300 : isTablet ? 400 : 500,
                      x: Math.sin(i) * (isMobile ? 60 : isTablet ? 80 : 100),
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
