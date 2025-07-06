import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameCard } from './GameCard';
import { BetInput } from './BetInput';
import { useGameContract } from '@/hooks/useGameContract';
import { useToast } from '@/hooks/use-toast';
import { Dice1, Dice2, Dice3, Trophy, Zap } from 'lucide-react';
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
    isSuccess,
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
      
      // Simulate waiting for blocks, then allow reveal
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
      // Simulate game result
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

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto text-neon-purple"
            >
              <Zap size={64} />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
              STT Guess Game
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Connect your wallet to start playing the fair number guessing game
            </p>
          </div>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
            STT Guess Game
          </h1>
          <p className="text-muted-foreground">
            Choose a number, place your bet, and win 2x your stake!
          </p>
          <ConnectButton />
        </motion.div>

        {/* Game Area */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Game Cards */}
          <Card className="bg-gradient-card border-2 border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="text-neon-orange" />
                Choose Your Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4 mb-6">
                <AnimatePresence>
                  {gameNumbers.map((number, index) => (
                    <motion.div
                      key={`${number}-${index}`}
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <GameCard
                        number={number}
                        isSelected={gameState.selectedNumber === number}
                        isRevealed={gamePhase === 'revealed'}
                        isWinning={gamePhase === 'revealed' && winningNumber === number}
                        onClick={() => handleNumberSelect(number)}
                        disabled={gamePhase !== 'select'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Game Status */}
              <div className="text-center space-y-2">
                {gamePhase === 'select' && (
                  <p className="text-sm text-muted-foreground">
                    Select a number and place your bet
                  </p>
                )}
                {gamePhase === 'committed' && (
                  <p className="text-sm text-neon-cyan animate-pulse">
                    Game committed! Waiting for reveal...
                  </p>
                )}
                {gamePhase === 'revealed' && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Winning number: <span className="text-neon-green font-bold">{winningNumber}</span>
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
            </CardContent>
          </Card>

          {/* Betting Interface */}
          <div className="space-y-4">
            <BetInput
              value={gameState.betAmount}
              onChange={(value) => setGameState(prev => ({ ...prev, betAmount: value }))}
              min={minBet}
              max={maxBet}
              disabled={gamePhase !== 'select'}
            />

            {/* Action Buttons */}
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
                  {isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Dice1 className="mr-2" />
                    </motion.div>
                  ) : (
                    <>
                      <Dice2 className="mr-2" />
                      Guess! ({gameState.betAmount} STT)
                    </>
                  )}
                </Button>
              )}

              {gamePhase === 'committed' && (
                <Button
                  className="w-full h-14 text-lg font-bold bg-gradient-gaming hover:shadow-neon transition-all duration-300"
                  onClick={handleRevealGame}
                  disabled={isPending}
                >
                  {isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Dice3 className="mr-2" />
                    </motion.div>
                  ) : (
                    <>
                      <Dice3 className="mr-2" />
                      Reveal Choice!
                    </>
                  )}
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

            {/* Game Info */}
            <Card className="bg-muted/20 border border-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Min Bet</p>
                    <p className="font-mono">{minBet} STT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Bet</p>
                    <p className="font-mono">{maxBet} STT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Win Multiplier</p>
                    <p className="font-mono">{winMultiplier}x</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Choice</p>
                    <p className="font-mono">
                      {gameState.selectedNumber || 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}