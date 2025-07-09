import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { BetInput } from './BetInput';
import { WinningModal } from './WinningModal';
import { LosingModal } from './LosingModal';
import Navbar from './Navbar';
import { useGameContract } from '@/hooks/useGameContract';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dice2, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import somImage from '@/img/som.png';

export function GameInterface() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    gameState,
    setGameState,
    playGame,
    resetGame,
    minBet,
    maxBet,
    winMultiplier,
    isPending,
    isConfirming,
    isConfirmed,
  } = useGameContract();

  // Game numbers - randomly generated for each game
  const [gameNumbers, setGameNumbers] = useState<number[]>([]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'select' | 'playing' | 'revealed'>('select');
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [showLosingModal, setShowLosingModal] = useState(false);

  // Utility function to generate unique random numbers
  const generateUniqueNumbers = () => {
    // Create array of numbers 1-10
    const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
    
    // Fisher-Yates shuffle algorithm for better randomness
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    
    // Return first 3 numbers (guaranteed to be unique)
    return allNumbers.slice(0, 3);
  };

  // Generate unique random numbers for the game (1-10 to match contract)
  useEffect(() => {
    const numbers = generateUniqueNumbers();
    setGameNumbers(numbers);
  }, []);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && gameState.isPlaying) {
      // Simulate game result (in real implementation, this would come from contract events)
      const randomWinner = gameNumbers[Math.floor(Math.random() * gameNumbers.length)];
      const isWinner = randomWinner === gameState.selectedNumber;
      
      setWinningNumber(randomWinner);
      setGamePhase('revealed');

      setGameState(prev => ({
        ...prev,
        isWaiting: false,
        gameResult: {
          isWinner,
          payout: isWinner ? gameState.betAmount * winMultiplier : 0,
        }
      }));

      setTimeout(() => {
        if (isWinner) {
          setShowWinningModal(true);
          toast({
            title: "🎉 You Won!",
            description: `Congratulations! You won ${(gameState.betAmount * winMultiplier).toFixed(3)} STT`,
          });
        } else {
          setShowLosingModal(true);
          toast({
            title: "Better Luck Next Time",
            description: "You didn't win this round. Try again!",
            variant: "destructive",
          });
        }
      }, 1000);
    }
  }, [isConfirmed, gameState.isPlaying, gameState.selectedNumber, gameState.betAmount, gameNumbers, winMultiplier, setGameState, toast]);

  const handleNumberSelect = (number: number) => {
    if (gamePhase !== 'select') return;
    
    setGameState(prev => ({
      ...prev,
      selectedNumber: prev.selectedNumber === number ? null : number,
    }));
  };

  const handlePlayGame = async () => {
    if (!gameState.selectedNumber) {
      toast({
        title: "Select a Number",
        description: "Please choose a number to play",
        variant: "destructive",
      });
      return;
    }

    const success = await playGame(gameState.selectedNumber, gameState.betAmount);
    if (success) {
      setGamePhase('playing');
    }
  };

  const handleNewGame = () => {
    resetGame();
    setGamePhase('select');
    setWinningNumber(null);
    setShowWinningModal(false);
    setShowLosingModal(false);
    
    // Generate unique numbers to avoid duplicates
    const numbers = generateUniqueNumbers();
    setGameNumbers(numbers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 -z-10">
          {/* Base gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-cyan-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-pink-500/10 to-transparent animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }} />
          
          {/* Animated floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-neon-purple/20 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-neon-cyan/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-3/4 left-3/4 w-20 h-20 bg-neon-pink/20 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-neon-green/15 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.05)_1px,_transparent_0)] bg-[length:50px_50px] opacity-20" />
        
        {/* Moving light streaks */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
          <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-neon-cyan/50 to-transparent animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        </div>
      </div>
      
      <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
        {/* Header with integrated wallet */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
        </motion.div>

        {/* Game Cards - Always shown */}
        <Card className="bg-transparent p-0 shadow-none border-0">
          <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mb-6 px-2">
            <AnimatePresence>
              {gameNumbers.map((number, index) => (
                <motion.div
                  key={`${number}-${index}`}
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className={cn(
                    isMobile ? "scale-75" : "scale-100 md:scale-125"
                  )}>
                    <GameCard
                      number={number}
                      isSelected={gameState.selectedNumber === number}
                      isRevealed={gamePhase === 'revealed'}
                      isWinning={gamePhase === 'revealed' && winningNumber === number}
                      onClick={() => handleNumberSelect(number)}
                      disabled={gamePhase !== 'select' || !isConnected}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Game Status */}
          <div className="text-center space-y-2">
            {!isConnected && (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to start playing
              </p>
            )}
            {isConnected && gamePhase === 'select' && (
              <p className="text-sm text-muted-foreground">
                Choose your lucky number
              </p>
            )}
            {gamePhase === 'playing' && (
              <p className="text-sm text-neon-cyan animate-pulse">
                {isConfirming ? "Confirming transaction..." : "Processing game..."}
              </p>
            )}
            {gamePhase === 'revealed' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Winner: <span className="text-neon-green font-bold text-lg">{winningNumber}</span>
                </p>
                {gameState.gameResult?.isWinner ? (
                  <p className="text-lg font-bold text-neon-green">
                    🎉 You Won {gameState.gameResult.payout.toFixed(3)} STT!
                  </p>
                ) : (
                  <p className="text-lg font-bold text-destructive">
                    Better luck next time!
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Bet Input - Always shown but disabled when not connected */}
        <BetInput
          value={gameState.betAmount}
          onChange={(value) => setGameState(prev => ({ ...prev, betAmount: value }))}
          min={minBet}
          max={maxBet}
          disabled={gamePhase !== 'select' || !isConnected}
        />

        {/* Action Button */}
        <Card className="bg-transparent p-0 shadow-none border-0">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {!isConnected && (
              <Button
                className={cn(
                  "w-full h-14 text-lg font-bold relative overflow-hidden",
                  "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
                  "border-2 border-slate-600/50 hover:border-slate-500/70",
                  "text-white shadow-2xl transition-all duration-300",
                  "hover:shadow-[0_0_30px_rgba(139,69,19,0.3)]"
                )}
                disabled
              >
                {/* Som background pattern */}
                <div 
                  className="absolute inset-0 opacity-10 bg-repeat bg-center"
                  style={{
                    backgroundImage: `url('${somImage}')`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Som logo in corner */}
                <div 
                  className="absolute top-2 left-2 w-6 h-6 bg-center bg-no-repeat bg-contain opacity-60"
                  style={{
                    backgroundImage: `url('${somImage}')`
                  }}
                />
                
                <span className="relative z-10">Connect Wallet to Play</span>
              </Button>
            )}
            
            {isConnected && gamePhase === 'select' && (
              <Button
                className={cn(
                  "w-full h-14 text-lg font-bold relative overflow-hidden",
                  "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
                  "border-2 border-slate-600/50 hover:border-purple-500/70",
                  "text-white shadow-2xl transition-all duration-300",
                  "hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]",
                  "hover:bg-gradient-to-br hover:from-purple-900/30 hover:via-slate-900 hover:to-slate-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={handlePlayGame}
                disabled={!gameState.selectedNumber || isPending || isConfirming}
              >
                {/* Som background pattern */}
                <div 
                  className="absolute inset-0 opacity-10 bg-repeat bg-center"
                  style={{
                    backgroundImage: `url('${somImage}')`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Som logo in corner */}
                <div 
                  className="absolute top-2 left-2 w-6 h-6 bg-center bg-no-repeat bg-contain opacity-60"
                  style={{
                    backgroundImage: `url('${somImage}')`
                  }}
                />
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center justify-center">
                  <Dice2 className="mr-2" />
                  {isPending || isConfirming ? "Processing..." : `Play (${gameState.betAmount} STT)`}
                </div>
              </Button>
            )}

            {gamePhase === 'playing' && (
              <Button
                className={cn(
                  "w-full h-14 text-lg font-bold relative overflow-hidden",
                  "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
                  "border-2 border-cyan-500/50",
                  "text-white shadow-2xl transition-all duration-300",
                  "shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                )}
                disabled
              >
                {/* Som background pattern */}
                <div 
                  className="absolute inset-0 opacity-10 bg-repeat bg-center"
                  style={{
                    backgroundImage: `url('${somImage}')`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Som logo in corner */}
                <div 
                  className="absolute top-2 left-2 w-6 h-6 bg-center bg-no-repeat bg-contain opacity-60"
                  style={{
                    backgroundImage: `url('${somImage}')`
                  }}
                />
                
                {/* Animated glow for processing */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
                
                <div className="relative z-10 flex items-center justify-center">
                  <Dice2 className="mr-2 animate-spin" />
                  {isConfirming ? "Confirming..." : "Game in Progress..."}
                </div>
              </Button>
            )}

            {gamePhase === 'revealed' && (
              <Button
                className={cn(
                  "w-full h-14 text-lg font-bold relative overflow-hidden",
                  "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
                  "border-2 border-slate-600/50 hover:border-green-500/70",
                  "text-white shadow-2xl transition-all duration-300",
                  "hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]",
                  "hover:bg-gradient-to-br hover:from-green-900/30 hover:via-slate-900 hover:to-slate-800"
                )}
                onClick={handleNewGame}
              >
                {/* Som background pattern */}
                <div 
                  className="absolute inset-0 opacity-10 bg-repeat bg-center"
                  style={{
                    backgroundImage: `url('${somImage}')`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Som logo in corner */}
                <div 
                  className="absolute top-2 left-2 w-6 h-6 bg-center bg-no-repeat bg-contain opacity-60"
                  style={{
                    backgroundImage: `url('${somImage}')`
                  }}
                />
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center justify-center">
                  <Trophy className="mr-2" />
                  Play Again
                </div>
              </Button>
            )}
          </motion.div>
        </Card>
      </div>

      {/* Winning Modal */}
      {showWinningModal && winningNumber && gameState.gameResult?.isWinner && (
        <WinningModal
          isOpen={showWinningModal}
          onClose={() => setShowWinningModal(false)}
          winningNumber={winningNumber}
          payout={gameState.gameResult.payout}
          onPlayAgain={handleNewGame}
        />
      )}

      {/* Losing Modal */}
      {showLosingModal && winningNumber && gameState.selectedNumber && (
        <LosingModal
          isOpen={showLosingModal}
          onClose={() => setShowLosingModal(false)}
          selectedNumber={gameState.selectedNumber}
          winningNumber={winningNumber}
          betAmount={gameState.betAmount}
          onPlayAgain={handleNewGame}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-transparent text-white text-center py-4 mt-8">
        <div className="space-y-1">
            <p className="text-sm">
            Made with Fun by{" "}
            <a
              href="https://twitter.com/Somnia_Network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon hover:underline"
            >
              somGuess
            </a>
            </p>
          <p className="text-xs opacity-70">© 2025 All rights reserved</p>
        </div>
      </footer>
      </div>
    </div>
  );
}