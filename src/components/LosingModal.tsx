import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { Skull, TrendingDown, RefreshCw, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenSize } from '@/hooks/useScreenSize';

interface LosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumber: number;
  winningNumber: number;
  betAmount: number;
  txHash?: string | null;
  onPlayAgain: () => void;
  displayedNumbers?: number[]; // Add displayed numbers from smart contract
}

export function LosingModal({ 
  isOpen, 
  onClose, 
  selectedNumber,
  winningNumber, 
  betAmount, 
  txHash,
  onPlayAgain,
  displayedNumbers = [] // Default to empty array if not provided
}: LosingModalProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize();

  const handlePlayAgain = () => {
    onClose();
    onPlayAgain();
  };

  // Enhanced responsive sizing based on screen size
  const getResponsiveClasses = () => {
    if (isMobile) {
      return {
        modal: 'max-w-[95vw] mx-2 bg-slate-900/95 border-red-500/50 backdrop-blur-xl',
        cardScale: 'scale-75',
        skullSize: 'w-8 h-8',
        titleSize: 'text-lg',
        spacing: 'space-y-3',
        cardGap: 'gap-2',
        padding: 'p-2',
        textSize: 'text-xs',
        buttonSize: 'text-sm py-2',
        iconSize: 'w-3 h-3',
        particleCount: 6,
        amountText: 'text-xl'
      };
    }
    
    if (isTablet) {
      return {
        modal: 'max-w-lg mx-4 bg-slate-900/95 border-red-500/50 backdrop-blur-xl',
        cardScale: 'scale-90',
        skullSize: 'w-12 h-12',
        titleSize: 'text-2xl',
        spacing: 'space-y-4',
        cardGap: 'gap-4',
        padding: 'p-3',
        textSize: 'text-sm',
        buttonSize: 'text-base py-2.5',
        iconSize: 'w-4 h-4',
        particleCount: 8,
        amountText: 'text-3xl'
      };
    }
    
    // Desktop
    return {
      modal: 'max-w-2xl bg-slate-900/95 border-red-500/50 backdrop-blur-xl',
      cardScale: 'scale-100',
      skullSize: 'w-16 h-16',
      titleSize: 'text-3xl',
      spacing: 'space-y-6',
      cardGap: 'gap-8',
      padding: 'p-4',
      textSize: 'text-base',
      buttonSize: 'text-lg py-3',
      iconSize: 'w-5 h-5',
      particleCount: 12,
      amountText: 'text-4xl'
    };
  };

  const responsive = getResponsiveClasses();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={responsive.modal}>
        <DialogHeader className={cn("text-center", responsive.spacing)}>
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center"
          >
            <div className="relative">
              <Skull className={cn(responsive.skullSize, "text-red-500 animate-pulse")} />
              <motion.div
                className={cn(
                  "absolute -top-1 -right-1 bg-red-600 rounded-full flex items-center justify-center",
                  isMobile ? "w-3 h-3" : isTablet ? "w-5 h-5" : "w-6 h-6"
                )}
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
                <TrendingDown className={cn(responsive.iconSize, "text-white")} />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className={cn(
            responsive.titleSize,
            "font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent"
          )}>
            💔 BETTER LUCK NEXT TIME! 💔
          </DialogTitle>
        </DialogHeader>

        <div className={responsive.spacing}>
          {/* Cards Display - Both selected and winning */}
          <div className={cn("flex justify-center relative", responsive.padding)}>
            {/* Background glow effect */}
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 rounded-full",
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
            
            {/* Floating sad particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(responsive.particleCount)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "absolute bg-red-400 rounded-full",
                    isMobile ? "w-1 h-1" : "w-1.5 h-1.5"
                  )}
                  style={{
                    left: `${20 + (i * 8)}%`,
                    top: `${15 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    y: [0, isMobile ? 10 : isTablet ? 15 : 20, 0],
                    x: [0, Math.sin(i) * (isMobile ? -8 : isTablet ? -12 : -15), 0],
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
            <div className={cn("flex items-center", responsive.cardGap)}>
              {/* Your selected card */}
              <div className={cn("flex flex-col items-center", isMobile ? "space-y-1" : "space-y-2")}>
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
                    number={selectedNumber}
                    isSelected={false}
                    isRevealed={true}
                    isWinning={false}
                    onClick={() => {}}
                    disabled={true}
                  />
                </motion.div>
                <p className={cn(responsive.textSize, "text-red-400 font-medium")}>Your Choice</p>
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
                className={cn(
                  "font-bold text-red-500",
                  isMobile ? "text-lg" : isTablet ? "text-xl" : "text-2xl"
                )}
              >
                VS
              </motion.div>

              {/* Winning card */}
              <div className={cn("flex flex-col items-center", isMobile ? "space-y-1" : "space-y-2")}>
                <motion.div
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20,
                    delay: 0.5
                  }}
                  className={cn("relative z-10 flex justify-center items-center", responsive.cardScale)}
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
                <p className={cn(responsive.textSize, "text-green-400 font-medium")}>Winner</p>
              </div>
            </div>
          </div>

          {/* Loss Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={cn("text-center", isMobile ? "space-y-2" : "space-y-3")}
          >
            <div className={cn(
              "bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-lg border border-red-500/30",
              responsive.padding
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className={responsive.iconSize} />
                <span className={cn(responsive.textSize, "font-semibold text-red-400")}>Amount Lost</span>
              </div>
              <motion.div
                className={cn(
                  responsive.amountText,
                  "font-bold bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent"
                )}
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
                          "px-3 py-1 bg-slate-700/50 border border-red-400/30 rounded-md",
                          "text-red-400 font-bold",
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
                Your Number: <span className={cn(
                  "font-bold text-red-400",
                  isMobile ? "text-base" : isTablet ? "text-lg" : "text-xl"
                )}>{selectedNumber}</span>
                {" | "}
                Winning Number: <span className={cn(
                  "font-bold text-green-400",
                  isMobile ? "text-base" : isTablet ? "text-lg" : "text-xl"
                )}>{winningNumber}</span>
              </p>
              
              <motion.p
                className={cn(
                  isMobile ? "text-xs" : responsive.textSize,
                  "text-red-400 font-medium px-2"
                )}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className={cn("inline", responsive.iconSize, "mr-1")} />
                Don't give up! Fortune favors the persistent!
                <Heart className={cn("inline", responsive.iconSize, "ml-1")} />
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
                "bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg border border-red-500/20",
                responsive.padding
              )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className={responsive.iconSize} />
                  <span className={cn(responsive.textSize, "font-semibold text-red-300")}>Transaction Info</span>
                </div>
                <a
                  href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors duration-200 text-red-400 hover:text-white",
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
                "flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10",
                responsive.buttonSize
              )}
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className={cn(
                "flex-1 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600",
                "text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300",
                "font-bold",
                responsive.buttonSize
              )}
              onClick={handlePlayAgain}
            >
              <RefreshCw className={cn("mr-2", responsive.iconSize)} />
              Try Again
            </Button>
          </motion.div>
        </div>

        {/* Sad rain effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {isOpen && (
              <>
                {[...Array(responsive.particleCount)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute bg-gradient-to-b from-red-400/60 to-transparent rounded-full",
                      isMobile ? "w-0.5 h-6" : isTablet ? "w-1 h-8" : "w-1.5 h-12"
                    )}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-20px'
                    }}
                    initial={{ y: -20, opacity: 0.6 }}
                    animate={{ 
                      y: isMobile ? 300 : isTablet ? 400 : 500,
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
