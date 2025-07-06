import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { BetInput } from './BetInput';
import { useGameContract } from '@/hooks/useGameContract';
import { useToast } from '@/hooks/use-toast';
import { Dice2, Dice3, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GameInterface() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const {
    gameState,
    setGameState,
    commitGame,
    revealGame,
    resetGame,
    minBet,
    maxBet,
    winMultiplier,
    isPending,
  } = useGameContract();

  // Game numbers - randomly generated for each game
  const [gameNumbers, setGameNumbers] = useState<number[]>([]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'select' | 'committed' | 'revealed'>('select');

  // Generate random numbers for the game
  useEffect(() => {
    const numbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 20) + 1);
    setGameNumbers(numbers);
  }, []);

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

    const success = await commitGame(gameState.selectedNumber, gameState.betAmount);
    if (success) {
      setGamePhase('committed');
      setTimeout(() => {
        toast({
          title: "Ready to Reveal",
          description: "You can now reveal your choice!",
        });
      }, 3000);
    }
  };

  const handleRevealGame = async () => {
    const success = await revealGame();
    if (success) {
      const randomWinner = gameNumbers[Math.floor(Math.random() * gameNumbers.length)];
      const isWinner = randomWinner === gameState.selectedNumber;
      
      setWinningNumber(randomWinner);
      setGamePhase('revealed');

      setTimeout(() => {
        if (isWinner) {
          toast({
            title: "🎉 You Won!",
            description: `Congratulations! You won ${(gameState.betAmount * winMultiplier).toFixed(3)} STT`,
          });
        } else {
          toast({
            title: "Better Luck Next Time",
            description: "You didn't win this round. Try again!",
            variant: "destructive",
          });
        }
      }, 1000);
    }
  };

  const handleNewGame = () => {
    resetGame();
    setGamePhase('select');
    setWinningNumber(null);
    const numbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 20) + 1);
    setGameNumbers(numbers);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto text-neon-purple"
          >
            <Zap size={48} />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
            STT Guess Game
          </h1>
          {!isConnected && (
            <p className="text-muted-foreground">
              Connect wallet to start playing
            </p>
          )}
        </motion.div>

        {/* Wallet Connection */}
        <div className="flex justify-center">
          <ConnectButton />
        </div>

        {isConnected && (
          <>
            {/* Game Cards - Centered and Larger */}
            <Card className="bg-gradient-card border-2 border-border shadow-card p-6">
              <div className="flex justify-center gap-6 mb-6">
                <AnimatePresence>
                  {gameNumbers.map((number, index) => (
                    <motion.div
                      key={`${number}-${index}`}
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <div className="scale-125">
                        <GameCard
                          number={number}
                          isSelected={gameState.selectedNumber === number}
                          isRevealed={gamePhase === 'revealed'}
                          isWinning={gamePhase === 'revealed' && winningNumber === number}
                          onClick={() => handleNumberSelect(number)}
                          disabled={gamePhase !== 'select'}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Game Status */}
              <div className="text-center space-y-2">
                {gamePhase === 'select' && (
                  <p className="text-sm text-muted-foreground">
                    Choose your lucky number
                  </p>
                )}
                {gamePhase === 'committed' && (
                  <p className="text-sm text-neon-cyan animate-pulse">
                    Waiting for reveal...
                  </p>
                )}
                {gamePhase === 'revealed' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Winner: <span className="text-neon-green font-bold text-lg">{winningNumber}</span>
                    </p>
                    {winningNumber === gameState.selectedNumber ? (
                      <p className="text-lg font-bold text-neon-green">
                        🎉 You Won {(gameState.betAmount * winMultiplier).toFixed(3)} STT!
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

            {/* Bet Input - Below Cards */}
            <BetInput
              value={gameState.betAmount}
              onChange={(value) => setGameState(prev => ({ ...prev, betAmount: value }))}
              min={minBet}
              max={maxBet}
              disabled={gamePhase !== 'select'}
            />

            {/* Action Button - Simple and Elegant */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {gamePhase === 'select' && (
                <Button
                  className={cn(
                    "w-full h-14 text-lg font-bold",
                    "bg-gradient-gaming hover:shadow-neon transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  onClick={handlePlayGame}
                  disabled={!gameState.selectedNumber || isPending}
                >
                  <Dice2 className="mr-2" />
                  {isPending ? "Processing..." : `Play (${gameState.betAmount} STT)`}
                </Button>
              )}

              {gamePhase === 'committed' && (
                <Button
                  className="w-full h-14 text-lg font-bold bg-gradient-gaming hover:shadow-neon transition-all duration-300"
                  onClick={handleRevealGame}
                  disabled={isPending}
                >
                  <Dice3 className="mr-2" />
                  {isPending ? "Revealing..." : "Reveal Choice"}
                </Button>
              )}

              {gamePhase === 'revealed' && (
                <Button
                  className="w-full h-14 text-lg font-bold bg-gradient-gaming hover:shadow-neon transition-all duration-300"
                  onClick={handleNewGame}
                >
                  <Trophy className="mr-2" />
                  Play Again
                </Button>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}