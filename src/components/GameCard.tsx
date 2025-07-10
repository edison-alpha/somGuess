import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import somImage from '@/img/som.png';

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
      whileHover={!disabled ? { 
        scale: 1.08, 
        rotateY: 8,
        rotateX: 5,
        z: 50
      } : {}}
      whileTap={!disabled ? { 
        scale: 0.92,
        rotateY: -5 
      } : {}}
      animate={isSelected ? { 
        rotateY: [0, 360], 
        scale: [1, 1.15, 1],
        z: 100
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        rotateY: { duration: 0.8, ease: "easeInOut" },
        scale: { duration: 0.4 }
      }}
      className="m-2 perspective-1000"
      style={{ 
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <Card
        className={cn(
          "relative cursor-pointer transition-all duration-500 transform-gpu",
          "border-2 overflow-hidden group rounded-xl",
          "flex items-center justify-center font-bold",
          // Responsive sizing - made taller like playing cards (reduced slightly)
          "w-20 h-28 text-xl sm:w-24 sm:h-32 sm:text-2xl md:w-28 md:h-40 md:text-3xl lg:w-32 lg:h-44 lg:text-4xl xl:w-36 xl:h-48 xl:text-5xl",
          // Base styling dengan crypto theme
          "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border-slate-600/50 shadow-2xl",
          // Hover effects
          "hover:shadow-[0_0_30px_rgba(139,69,19,0.3)] hover:border-slate-500/70",
          // Disabled state
          disabled && "cursor-not-allowed opacity-50 grayscale",
          // Selected state dengan neon effect
          isSelected && [
            "border-neon-purple/80 shadow-neon bg-gradient-to-br from-purple-900/50 via-blue-900/40 to-purple-900/50",
            "animate-pulse-neon before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/20 before:to-blue-500/20 before:animate-pulse"
          ],
          // Winning state
          isRevealed && isWinning && [
            "border-neon-green/90 bg-gradient-to-br from-green-900/60 via-emerald-800/50 to-green-900/60",
            "shadow-[0_0_40px_rgba(16,185,129,0.6)] animate-bounce-in"
          ],
          // Losing state
          isRevealed && !isWinning && "border-red-500/40 bg-gradient-to-br from-red-900/30 to-slate-900/60 opacity-70"
        )}
        onClick={!disabled ? onClick : undefined}
      >
        {/* Card background with crypto theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
          {/* Som image as background pattern dengan warna asli */}
          <div 
            className="absolute inset-0 opacity-10 bg-repeat bg-center"
            style={{
              backgroundImage: `url('${somImage}')`,
              backgroundSize: '35px 35px sm:45px sm:45px md:55px md:55px lg:65px lg:65px xl:75px xl:75px'
            }}
          />
          
          {/* Crypto-themed border pattern */}
          <div className="absolute inset-1 border border-slate-700/50 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
          
          {/* Subtle glow effect untuk crypto theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-50" />
          
          {/* Som image in corners dengan warna asli */}
          <div 
            className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 bg-center bg-no-repeat bg-contain opacity-80"
            style={{
              backgroundImage: `url('${somImage}')`
            }}
          />
          <div 
            className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 bg-center bg-no-repeat bg-contain opacity-80 rotate-180"
            style={{
              backgroundImage: `url('${somImage}')`
            }}
          />
        </div>

        {/* Selected/winning state overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-lg" />
        )}
        
        {isRevealed && isWinning && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-green-500/20 rounded-lg" />
        )}
        
        {isRevealed && !isWinning && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg" />
        )}

        {/* Floating particles effect */}
        {!disabled && (
          <>
            <motion.div
              className="absolute top-2 left-2 w-1 h-1 bg-neon-cyan rounded-full opacity-60"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
            />
            <motion.div
              className="absolute top-6 right-4 w-1 h-1 bg-neon-pink rounded-full opacity-60"
              animate={{
                y: [0, -15, 0],
                x: [0, -8, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute bottom-4 left-6 w-1 h-1 bg-neon-orange rounded-full opacity-60"
              animate={{
                y: [0, 15, 0],
                x: [0, 12, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </>
        )}

        {/* Main number display */}
        <motion.div
          animate={isSelected ? { 
            scale: [1, 1.3, 1],
            rotateZ: [0, 5, -5, 0]
          } : {}}
          transition={{ 
            duration: 0.6,
            ease: "easeInOut"
          }}
          className={cn(
            "relative z-10 transition-all duration-300",
            "text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-300",
            "filter drop-shadow-lg font-extrabold tracking-wide",
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl",
            // Selected state
            isSelected && "from-neon-cyan via-neon-purple to-neon-pink animate-glow",
            // Winning state
            isRevealed && isWinning && "from-neon-green via-green-300 to-emerald-400 animate-bounce",
            // Losing state
            isRevealed && !isWinning && "from-red-400 via-red-300 to-red-500 opacity-70"
          )}
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {number}
        </motion.div>

        {/* Neon border effect for selected card */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-neon-purple/60 pointer-events-none"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.6, 1, 0.6],
              borderColor: [
                "hsl(var(--neon-purple) / 0.6)",
                "hsl(var(--neon-cyan) / 0.8)",
                "hsl(var(--neon-pink) / 0.6)",
                "hsl(var(--neon-purple) / 0.6)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Crypto-themed corner decorations */}
        <div className="absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-l-2 border-t-2 border-slate-500/50 rounded-tl-lg z-20" />
        <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-r-2 border-t-2 border-slate-500/50 rounded-tr-lg z-20" />
        <div className="absolute bottom-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-l-2 border-b-2 border-slate-500/50 rounded-bl-lg z-20" />
        <div className="absolute bottom-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-r-2 border-b-2 border-slate-500/50 rounded-br-lg z-20" />

        {/* Winning celebration effect */}
        {isRevealed && isWinning && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/30 to-green-400/20 rounded-lg pointer-events-none"
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none"
                style={{
                  left: `${20 + (i * 12)}%`,
                  top: `${15 + (i % 2) * 70}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}

        {/* Hover glow effect */}
        {!disabled && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            animate={{
              x: [-100, 100],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Card>
    </motion.div>
  );
}