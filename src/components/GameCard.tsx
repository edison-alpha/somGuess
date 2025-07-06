import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GameCardProps {
  number: number;
  isSelected: boolean;
  isRevealed: boolean;
  isWinning?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function GameCard({ 
  number, 
  isSelected, 
  isRevealed, 
  isWinning = false, 
  onClick, 
  disabled = false 
}: GameCardProps) {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05, rotateY: 5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={isSelected ? { rotateY: [0, 180, 0] } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        rotateY: { duration: 0.6 }
      }}
    >
      <Card
        className={cn(
          "relative w-24 h-32 cursor-pointer transition-all duration-300 transform-gpu",
          "bg-gradient-card border-2 shadow-card hover:shadow-glow",
          "flex items-center justify-center text-2xl font-bold",
          disabled && "cursor-not-allowed opacity-50",
          isSelected && "border-primary shadow-neon animate-pulse-neon",
          isRevealed && isWinning && "border-neon-green bg-gradient-win animate-bounce-in",
          isRevealed && !isWinning && "border-muted opacity-60"
        )}
        onClick={!disabled ? onClick : undefined}
      >
        <motion.div
          animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={cn(
            "text-foreground",
            isSelected && "text-neon-cyan animate-glow",
            isRevealed && isWinning && "text-neon-green",
            isRevealed && !isWinning && "text-muted-foreground"
          )}
        >
          {number}
        </motion.div>
        
        {/* Neon border effect for selected card */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-neon-purple opacity-60"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Winning effect */}
        {isRevealed && isWinning && (
          <motion.div
            className="absolute inset-0 bg-gradient-win opacity-20 rounded-lg"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Card>
    </motion.div>
  );
}