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
  
  // Game numbers - show 3 numbers including the winning number from contract
  const [gameNumbers, setGameNumbers] = useState<number[]>([]);
  const [numbersSetFromContract, setNumbersSetFromContract] = useState(false); // Track if numbers are from contract
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  // Game flow phases: 'generate' -> 'select' -> 'playing' -> 'revealed'
  const [gamePhase, setGamePhase] = useState<'generate' | 'select' | 'playing' | 'revealed'>('generate');
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [showLosingModal, setShowLosingModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // Track if game has started
  
  const {
    gameState,
    setGameState,
    playGame,
    resetGame,
    generateNumbers,
    generateNumbersWithFallback,
    generatedNumbers,
    isGeneratingNumbers,
    minBet,
    maxBet,
    winMultiplier,
    isPending,
    isConfirming,
    isConfirmed,
  } = useGameContract(gameNumbers); // Pass current game numbers to hook

  // Generate 3 random numbers from smart contract simulation for initial display
  const generateSmartContractNumbers = () => {
    // Simulate smart contract behavior: generate 3 unique random numbers (1-10)
    const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
    
    // Fisher-Yates shuffle algorithm
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    
    const numbers = allNumbers.slice(0, 3);
    console.log('Generated smart contract simulation numbers:', numbers);
    return numbers;
  };

  // Generate 3 random numbers for display (1-10) - fallback only
  const generateThreeNumbers = () => {
    const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
    
    // Fisher-Yates shuffle algorithm
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    
    return allNumbers.slice(0, 3);
  };

  // Initialize game - start with number generation phase
  useEffect(() => {
    if (isConnected && gamePhase === 'generate' && gameNumbers.length === 0) {
      console.log('Starting number generation phase...');
      // Don't auto-generate, wait for user to click generate
    }
  }, [isConnected, gamePhase, gameNumbers.length]);

  // Update game numbers when generated from smart contract
  useEffect(() => {
    if (generatedNumbers.length === 3) {
      console.log('Received numbers from generation:', generatedNumbers);
      setGameNumbers(generatedNumbers);
      setNumbersSetFromContract(true);
      // Move to selection phase after numbers are generated
      if (gamePhase === 'generate') {
        setGamePhase('select');
      }
    }
  }, [generatedNumbers, gamePhase]);

  // Handle transaction confirmation
  useEffect(() => {
    console.log('Transaction status:', { isConfirmed, isPlaying: gameState.isPlaying });
    
    if (isConfirmed && gameState.isPlaying) {
      // Wait for contract event instead of simulating result
      // The useGameContract hook will handle the GuessResult event
      setGamePhase('playing'); // Keep in playing state until event received
      console.log('Transaction confirmed, waiting for game result...');
    }
  }, [isConfirmed, gameState.isPlaying]);

  // Handle game result from contract event
  useEffect(() => {
    console.log('Game result updated:', gameState.gameResult);
    
    if (gameState.gameResult && gameState.gameResult.actualNumber) {
      const { isWinner, actualNumber, displayedNumbers } = gameState.gameResult;
      
      console.log('Processing game result:', { 
        isWinner, 
        actualNumber, 
        displayedNumbers,
        currentGameNumbers: gameNumbers,
        userSelected: gameState.selectedNumber
      });
      
      // Update the displayed numbers with the actual numbers from the smart contract
      if (displayedNumbers && displayedNumbers.length === 3) {
        console.log('✅ Updating displayed numbers:', displayedNumbers);
        setGameNumbers(displayedNumbers);
      } else {
        console.log('⚠️ No displayed numbers, using current game numbers:', gameNumbers);
      }
      
      // Verify that winning number is from the contract's displayed numbers
      const numbersToCheck = displayedNumbers && displayedNumbers.length === 3 ? displayedNumbers : gameNumbers;
      if (numbersToCheck.includes(actualNumber)) {
        console.log('✅ Winning number displayed numbers:', actualNumber);
        console.log('✅ Contract displayed numbers were:', numbersToCheck);
        console.log('✅ User selected:', gameState.selectedNumber);
        console.log('✅ Result:', isWinner ? 'WIN' : 'LOSE');
      } else {
        console.log('⚠️ Warning: Winning number not in contract displayed numbers');
        console.log('⚠️ Winning number:', actualNumber);
        console.log('⚠️ Displayed numbers:', numbersToCheck);
      }
      
      setWinningNumber(actualNumber);
      setGamePhase('revealed');

      // Add delay to ensure cards are updated first
      setTimeout(() => {
        console.log('Opening result modal...');
        
        if (isWinner) {
          setShowWinningModal(true);
        } else {
          setShowLosingModal(true);
        }
      }, 2000);
    }
  }, [gameState.gameResult, gameStarted]);

  const handleNumberSelect = (number: number) => {
    if (gamePhase !== 'select') {
      console.log('Number selection blocked - game phase is:', gamePhase);
      toast({
        title: "Generate Numbers First",
        description: "Please generate 3 numbers before selecting",
        variant: "destructive",
      });
      return;
    }
    
    // Only allow selection from the 3 displayed numbers
    if (!gameNumbers.includes(number)) {
      console.log('Invalid number selection - not in displayed numbers:', number);
      return;
    }
    
    console.log('Number selected:', number, 'From displayed numbers:', gameNumbers);
    
    setGameState(prev => ({
      ...prev,
      selectedNumber: prev.selectedNumber === number ? null : number,
    }));
  };

  const handleGenerateNumbers = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to generate numbers",
        variant: "destructive",
      });
      return;
    }

    console.log('Generating 3 numbers for the game...');
    setGamePhase('generate');
    
    try {
      const numbers = await generateNumbers();
      if (numbers && numbers.length === 3) {
        console.log('Numbers generated successfully:', numbers);
        setGameNumbers(numbers);
        setGamePhase('select');
        toast({
          title: "Numbers Generated!",
          description: `Ready to play with numbers: ${numbers.join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Error generating numbers:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate numbers. Please try again.",
        variant: "destructive",
      });
      setGamePhase('generate');
    }
  };

  const handlePlayGame = async () => {
    if (gamePhase !== 'select') {
      toast({
        title: "Generate Numbers First",
        description: "Please generate 3 numbers before playing",
        variant: "destructive",
      });
      return;
    }

    if (!gameState.selectedNumber) {
      toast({
        title: "Select a Number",
        description: "Please choose one of the displayed numbers to play",
        variant: "destructive",
      });
      return;
    }

    // Validate that selected number is from displayed numbers
    if (!gameNumbers.includes(gameState.selectedNumber)) {
      toast({
        title: "Invalid Selection",
        description: "Please select from the displayed numbers only",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting game with:');
    console.log('- Displayed numbers:', gameNumbers);
    console.log('- User selected number:', gameState.selectedNumber);
    console.log('- Bet amount:', gameState.betAmount);
    
    setGameStarted(true); // Mark game as started to prevent number changes
    
    const success = await playGame(gameState.selectedNumber, gameState.betAmount);
    if (success) {
      setGamePhase('playing');
      console.log('Game started successfully, waiting for transaction confirmation...');
    } else {
      setGameStarted(false); // Reset if game failed to start
      console.log('Game failed to start');
    }
  };

  const handleNewGame = async () => {
    console.log('Starting new game...');
    
    // Reset all game states
    resetGame();
    setWinningNumber(null);
    setShowWinningModal(false);
    setShowLosingModal(false);
    setNumbersSetFromContract(false);
    setGameStarted(false);
    setGameNumbers([]); // Clear displayed numbers
    
    // Auto-generate numbers untuk game baru
    console.log('Auto-generating numbers for new game...');
    setGamePhase('generate');
    
    try {
      const numbers = await generateNumbers();
      if (numbers && numbers.length === 3) {
        console.log('New game numbers generated:', numbers);
        setGameNumbers(numbers);
        setGamePhase('select');
      }
    } catch (error) {
      console.error('Error auto-generating numbers:', error);
      // Fallback ke manual generate
      setGamePhase('generate');
    }
    
    console.log('New game initialized');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#0f172a] via-[#33396C] to-[#0f172a]">
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

        {/* Game Cards - Show 3 numbers */}
        <Card className="bg-transparent p-0 shadow-none border-0">
          <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mb-6 px-2">
            <AnimatePresence>
              {gamePhase === 'generate' && gameNumbers.length === 0 && !isGeneratingNumbers ? (
                // Show empty cards when in generate phase - matching GameCard design
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`empty-${index}`}
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ delay: index * 0.2 }}
                    className="m-2 perspective-1000"
                    style={{ 
                      transformStyle: "preserve-3d",
                      perspective: "1000px"
                    }}
                  >
                    <div className={cn(
                      isMobile ? "scale-75" : "scale-100 md:scale-125"
                    )}>
                      <Card
                        className={cn(
                          "relative transition-all duration-500 transform-gpu",
                          "border-2 overflow-hidden rounded-xl",
                          "flex items-center justify-center font-bold",
                          // Same responsive sizing as GameCard
                          "w-20 h-28 text-xl sm:w-24 sm:h-32 sm:text-2xl md:w-28 md:h-40 md:text-3xl lg:w-32 lg:h-44 lg:text-4xl xl:w-36 xl:h-48 xl:text-5xl",
                          // Base styling matching GameCard
                          "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border-slate-600/50 shadow-2xl",
                          // Dashed border for empty state
                          "border-dashed opacity-60"
                        )}
                      >
                        {/* Card background matching GameCard */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
                          {/* Som image as background pattern */}
                          <div 
                            className="absolute inset-0 opacity-5 bg-repeat bg-center"
                            style={{
                              backgroundImage: `url('${somImage}')`,
                              backgroundSize: '35px 35px sm:45px sm:45px md:55px md:55px lg:65px lg:65px xl:75px xl:75px'
                            }}
                          />
                          
                          {/* Crypto-themed border pattern */}
                          <div className="absolute inset-1 border border-slate-700/50 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
                          
                          {/* Som image in corners */}
                          <div 
                            className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 bg-center bg-no-repeat bg-contain opacity-40"
                            style={{
                              backgroundImage: `url('${somImage}')`
                            }}
                          />
                          <div 
                            className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 bg-center bg-no-repeat bg-contain opacity-40 rotate-180"
                            style={{
                              backgroundImage: `url('${somImage}')`
                            }}
                          />
                        </div>

                        {/* Main question mark display */}
                        <div
                          className={cn(
                            "relative z-10 transition-all duration-300",
                            "text-transparent bg-clip-text bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500",
                            "filter drop-shadow-lg font-extrabold tracking-wide",
                            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                          )}
                          style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                          }}
                        >
                          ?
                        </div>

                        {/* Corner decorations matching GameCard */}
                        <div className="absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-l-2 border-t-2 border-slate-500/30 rounded-tl-lg z-20" />
                        <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-r-2 border-t-2 border-slate-500/30 rounded-tr-lg z-20" />
                        <div className="absolute bottom-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-l-2 border-b-2 border-slate-500/30 rounded-bl-lg z-20" />
                        <div className="absolute bottom-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-r-2 border-b-2 border-slate-500/30 rounded-br-lg z-20" />
                      </Card>
                    </div>
                  </motion.div>
                ))
              ) : isGeneratingNumbers ? (
                // Show loading state while generating numbers - matching GameCard design
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`loading-${index}`}
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ delay: index * 0.2 }}
                    className="m-2 perspective-1000"
                    style={{ 
                      transformStyle: "preserve-3d",
                      perspective: "1000px"
                    }}
                  >
                    <div className={cn(
                      isMobile ? "scale-75" : "scale-100 md:scale-125"
                    )}>
                      <Card
                        className={cn(
                          "relative transition-all duration-500 transform-gpu",
                          "border-2 overflow-hidden rounded-xl",
                          "flex items-center justify-center font-bold",
                          // Same responsive sizing as GameCard
                          "w-20 h-28 text-xl sm:w-24 sm:h-32 sm:text-2xl md:w-28 md:h-40 md:text-3xl lg:w-32 lg:h-44 lg:text-4xl xl:w-36 xl:h-48 xl:text-5xl",
                          // Loading state styling
                          "bg-gradient-to-br from-purple-900/50 via-blue-900/40 to-purple-900/50 border-purple-500/50 shadow-2xl",
                          "animate-pulse"
                        )}
                      >
                        {/* Card background matching GameCard */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/40 to-purple-900/50">
                          {/* Som image as background pattern */}
                          <div 
                            className="absolute inset-0 opacity-10 bg-repeat bg-center"
                            style={{
                              backgroundImage: `url('${somImage}')`,
                              backgroundSize: '35px 35px sm:45px sm:45px md:55px md:55px lg:65px lg:65px xl:75px xl:75px'
                            }}
                          />
                          
                          {/* Crypto-themed border pattern */}
                          <div className="absolute inset-1 border border-purple-700/50 rounded-lg bg-gradient-to-br from-purple-800/50 to-blue-900/50" />
                          
                          {/* Som image in corners */}
                          <div 
                            className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 bg-center bg-no-repeat bg-contain opacity-60"
                            style={{
                              backgroundImage: `url('${somImage}')`
                            }}
                          />
                          <div 
                            className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 bg-center bg-no-repeat bg-contain opacity-60 rotate-180"
                            style={{
                              backgroundImage: `url('${somImage}')`
                            }}
                          />
                        </div>

                        {/* Animated dice icon */}
                        <div className="relative z-10 animate-spin">
                          <Dice2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-white drop-shadow-lg" />
                        </div>

                        {/* Corner decorations matching GameCard */}
                        <div className="absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-l-2 border-t-2 border-purple-500/50 rounded-tl-lg z-20" />
                        <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-r-2 border-t-2 border-purple-500/50 rounded-tr-lg z-20" />
                        <div className="absolute bottom-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-l-2 border-b-2 border-purple-500/50 rounded-bl-lg z-20" />
                        <div className="absolute bottom-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-r-2 border-b-2 border-purple-500/50 rounded-br-lg z-20" />

                        {/* Loading glow effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-lg"
                          animate={{ 
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </Card>
                    </div>
                  </motion.div>
                ))
              ) : (
                // Show actual numbers once generated
                gameNumbers.map((number, index) => (
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
                        disabled={gamePhase !== 'select' || !isConnected || isGeneratingNumbers}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Game Status */}
          <div className="text-center space-y-2">
            {!isConnected && (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to start playing
              </p>
            )}
            {isConnected && gamePhase === 'generate' && (
              <div className="space-y-2">
                <p className="text-lg font-bold text-neon-blue">
                  First Generate 3 Numbers
                </p>
                <p className="text-sm text-muted-foreground">
                  Click "Generate 3 Numbers" to start the game
                </p>
              </div>
            )}
            {isGeneratingNumbers && (
              <p className="text-sm text-neon-cyan animate-pulse">
                Generating 3 numbers......
              </p>
            )}
            {isConnected && gamePhase === 'select' && !isGeneratingNumbers && (
              <div className="space-y-2">
                <p className="text-lg font-bold text-neon-green">
                  Select Your Number
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose one number from: {gameNumbers.join(', ')}
                </p>
                {gameState.selectedNumber && (
                  <p className="text-sm text-neon-blue font-medium">
                    Selected: {gameState.selectedNumber}
                  </p>
                )}
              </div>
            )}
            {gamePhase === 'playing' && (
              <div className="space-y-2">
                <p className="text-lg font-bold text-yellow-400">
                  Game in Progress...
                </p>
                <p className="text-sm text-neon-cyan animate-pulse">
                  {isConfirming ? "Confirming transaction..." : "Processing game..."}
                </p>
              </div>
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

        {/* Bet Input - Always shown but disabled when not connected or in wrong phase */}
        <BetInput
          value={gameState.betAmount}
          onChange={(value) => setGameState(prev => ({ ...prev, betAmount: value }))}
          min={minBet}
          max={maxBet}
          disabled={gamePhase === 'generate' || gamePhase === 'playing' || gamePhase === 'revealed' || !isConnected || isGeneratingNumbers}
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
            
            {isConnected && gamePhase === 'generate' && (
              <Button
                className={cn(
                  "w-full h-14 text-lg font-bold relative overflow-hidden",
                  "bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-800",
                  "border-2 border-emerald-600/50 hover:border-emerald-500/70",
                  "text-white shadow-2xl transition-all duration-300",
                  "hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]",
                  "hover:bg-gradient-to-br hover:from-emerald-900/70 hover:via-green-900 hover:to-emerald-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={handleGenerateNumbers}
                disabled={isGeneratingNumbers}
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center justify-center">
                  <Zap className="mr-2" />
                  {isGeneratingNumbers ? "Generating..." : "Generate 3 Numbers"}
                </div>
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
                disabled={!gameState.selectedNumber || isPending || isConfirming || isGeneratingNumbers}
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
          txHash={gameState.txHash}
          onPlayAgain={handleNewGame}
          displayedNumbers={gameNumbers} // Use current gameNumbers (which are from smart contract)
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
          txHash={gameState.txHash}
          onPlayAgain={handleNewGame}
          displayedNumbers={gameNumbers} // Use current gameNumbers (which are from smart contract)
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
              Guess
            </a>
            </p>
          <p className="text-xs opacity-70">© 2025 All rights reserved</p>
        </div>
      </footer>
      </div>
    </div>
  );
}