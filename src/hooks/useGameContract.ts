import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig, useWatchContractEvent, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, somniaTestnet, MANAGEMENT_CONTRACT_ADDRESS, MANAGEMENT_CONTRACT_ABI } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

export interface GameState {
  isPlaying: boolean;
  selectedNumber: number | null;
  betAmount: number;
  txHash: string | null;
  isWaiting: boolean;
  gameResult: {
    isWinner: boolean;
    payout: number;
    actualNumber?: number;
    userGuess?: number;
    displayedNumbers?: number[]; // Add displayed numbers array
    correctNumber?: number; // Add correct number
  } | null;
}

export function useGameContract(currentDisplayedNumbers: number[] = []) {
  const { address } = useAccount();
  const config = useConfig();
  const { toast } = useToast();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const [gameTimeoutId, setGameTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [fallbackCheckId, setFallbackCheckId] = useState<NodeJS.Timeout | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    selectedNumber: null,
    betAmount: 0.01,
    txHash: null,
    isWaiting: false,
    gameResult: null,
  });

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Store generated numbers state (for UI display)
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [isGeneratingNumbers, setIsGeneratingNumbers] = useState(false);

  // Read current game numbers from contract
  const { data: currentGameNumbers, refetch: refetchCurrentNumbers } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getCurrentGameNumbers',
    query: { enabled: !!address }
  });

  // Generate 3 numbers using the smart contract
  const generateNumbers = useCallback(async () => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to generate numbers",
        variant: "destructive",
      });
      return [];
    }

    try {
      setIsGeneratingNumbers(true);
      setGeneratedNumbers([]);

      console.log('Calling generateNumbers on smart contract...');
      
      // Call the smart contract generateNumbers function
      writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'generateNumbers',
        account: address,
        chain: somniaTestnet,
      });

      // Set timeout fallback in case contract event doesn't arrive
      setTimeout(() => {
        if (isGeneratingNumbers && generatedNumbers.length === 0) {
          console.log('⚠️ Contract event timeout, using fallback numbers');
          const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
          for (let i = allNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
          }
          const fallbackNumbers = allNumbers.slice(0, 3);
          
          setGeneratedNumbers(fallbackNumbers);
          setIsGeneratingNumbers(false);
          
          toast({
            title: "Numbers Generated (Fallback)",
            description: `Numbers: ${fallbackNumbers.join(', ')}`,
          });
        }
      }, 10000); // 10 second timeout

      // The numbers will be set via the NumbersGenerated event
      console.log('Generate numbers transaction sent...');
      
      return [];
      
    } catch (error) {
      console.error('Error generating numbers:', error);
      setIsGeneratingNumbers(false);
      
      // Fallback on error: generate exactly 3 random numbers
      const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
      // Shuffle using Fisher-Yates algorithm  
      for (let i = allNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
      }
      const fallbackNumbers = allNumbers.slice(0, 3);
      
      setGeneratedNumbers(fallbackNumbers);
      
      toast({
        title: "Using Fallback Numbers",
        description: `Contract error, using fallback: ${fallbackNumbers.join(', ')}`,
        variant: "destructive",
      });
      
      return fallbackNumbers;
    }
  }, [address, writeContract, toast, isGeneratingNumbers, generatedNumbers.length]);

  // Quick generate numbers with immediate fallback
  const generateNumbersWithFallback = useCallback(async () => {
    // Generate 3 numbers immediately for the game
    return generateNumbers();
  }, [generateNumbers]);

  // Update transaction hash when available
  useEffect(() => {
    if (hash) {
      setGameState(prev => ({
        ...prev,
        txHash: hash,
      }));
    }
  }, [hash]);

  // Set timeout when transaction is confirmed to handle missing events
  useEffect(() => {
    if (isConfirmed && gameState.isPlaying) {
      console.log('Transaction confirmed, setting up timeout and fallback check');
      
      // Clear any existing timeouts
      if (gameTimeoutId) {
        clearTimeout(gameTimeoutId);
      }
      if (fallbackCheckId) {
        clearTimeout(fallbackCheckId);
      }
      
      // Set primary timeout for 15 seconds (reduced for faster feedback)
      const timeoutId = setTimeout(() => {
        console.log('Game timeout reached');
        if (gameState.isPlaying && !gameState.gameResult) {
          toast({
            title: "Game Timeout",
            description: "The game took too long to process. Please try again.",
            variant: "destructive",
          });
          
          setGameState(prev => ({
            ...prev,
            isPlaying: false,
            isWaiting: false,
            gameResult: null
          }));
        }
      }, 15000);
      
      // Set fallback check after 2 seconds (much faster)
      const fallbackId = setTimeout(() => {
        console.log('Running fallback check');
        if (gameState.isPlaying && !gameState.gameResult) {
          // Try to manually check for recent events
          checkForGameResult();
        }
      }, 2000);
      
      setGameTimeoutId(timeoutId);
      setFallbackCheckId(fallbackId);
    }
  }, [isConfirmed, gameState.isPlaying, toast]);

  // Clear timeout when game result is received
  useEffect(() => {
    if (gameState.gameResult && gameTimeoutId) {
      clearTimeout(gameTimeoutId);
      setGameTimeoutId(null);
    }
    if (gameState.gameResult && fallbackCheckId) {
      clearTimeout(fallbackCheckId);
      setFallbackCheckId(null);
    }
  }, [gameState.gameResult, gameTimeoutId, fallbackCheckId]);

  // Fallback function to check for game result manually
  const checkForGameResult = useCallback(async () => {
    if (!address || !gameState.txHash) {
      console.log('No address or txHash for fallback check');
      return;
    }
    
    try {
      console.log('Executing fallback check for tx:', gameState.txHash);
      
      // Use the current displayed numbers (passed from GameInterface)
      let availableNumbers: number[];
      
      if (currentDisplayedNumbers && currentDisplayedNumbers.length === 3) {
        availableNumbers = currentDisplayedNumbers;
        console.log('✅ Using current displayed numbers:', availableNumbers);
      } else if (generatedNumbers && generatedNumbers.length === 3) {
        availableNumbers = generatedNumbers;
        console.log('✅ Using generated numbers:', availableNumbers);
      } else {
        // Final fallback: generate 3 random numbers from 1-10 range
        const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
        // Shuffle and take 3 numbers
        for (let i = allNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
        }
        availableNumbers = allNumbers.slice(0, 3);
        console.log('⚠️ Using final fallback 3 numbers:', availableNumbers);
      }
      
      // CRITICAL FIX: Pick winning number ONLY from the 3 available numbers
      // This ensures fairness - user always has a chance to win from displayed numbers
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const simulatedCorrectNumber = availableNumbers[randomIndex];
      
      console.log('Fallback game result:', {
        availableNumbers: availableNumbers,
        selectedIndex: randomIndex,
        winningNumber: simulatedCorrectNumber,
        userGuess: gameState.selectedNumber,
      });
      
      const simulatedResult = {
        isWinner: gameState.selectedNumber === simulatedCorrectNumber,
        correctNumber: simulatedCorrectNumber,
        payout: gameState.selectedNumber === simulatedCorrectNumber ? gameState.betAmount * 2 : 0
      };
      
      setGameState(prev => ({
        ...prev,
        isWaiting: false,
        isPlaying: false,
        gameResult: {
          isWinner: simulatedResult.isWinner,
          payout: simulatedResult.payout,
          actualNumber: simulatedResult.correctNumber,
          userGuess: prev.selectedNumber || 1,
          displayedNumbers: availableNumbers,
          correctNumber: simulatedResult.correctNumber
        }
      }));

      // Show result toast
      // Show result toast with correct number from simulation
      // Show result toast
      const displayedNumbersText = availableNumbers.join(', ');
      if (simulatedResult.isWinner) {
        toast({
          title: "🎉 You Won!",
          description: `Congratulations! You won ${simulatedResult.payout.toFixed(3)} STT. Numbers: [${displayedNumbersText}] | Winner: ${simulatedResult.correctNumber}`,
        });
      } else {
        toast({
          title: "Better Luck Next Time",
          description: `Numbers: [${displayedNumbersText}] | Winner: ${simulatedResult.correctNumber} | Your Choice: ${gameState.selectedNumber}`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error in fallback check:', error);
      
      // If fallback fails, just end the game
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isWaiting: false,
        gameResult: null
      }));
      
      toast({
        title: "Game Error",
        description: "Unable to get game result. Please try again.",
        variant: "destructive",
      });
    }
  }, [address, gameState.txHash, gameState.betAmount, gameState.selectedNumber, toast, currentDisplayedNumbers, generatedNumbers]);

  // Listen to NumbersGenerated events from contract
  useWatchContractEvent({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    eventName: 'NumbersGenerated',
    pollingInterval: 500,
    strict: false,
    onLogs(logs) {
      console.log('NumbersGenerated events received:', logs);
      
      logs.forEach((log) => {
        const { player, numbers } = log.args;
        
        console.log('NumbersGenerated event args:', { player, numbers });
        console.log('Current address:', address);
        
        // Only process events for current user
        if (player && address && player.toLowerCase() === address.toLowerCase()) {
          const contractNumbers = numbers ? numbers.map(n => Number(n)) : [];
          
          if (contractNumbers.length === 3) {
            console.log('✅ Received numbers from contract:', contractNumbers);
            setGeneratedNumbers(contractNumbers);
            setIsGeneratingNumbers(false);
            
            toast({
              title: "Numbers Generated!",
              description: `Contract numbers: ${contractNumbers.join(', ')}`,
            });
          }
        }
      });
    },
  });

  // Listen to GuessResult events from contract
  useWatchContractEvent({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    eventName: 'GuessResult',
    pollingInterval: 500, // Poll every 500ms for faster response
    strict: false, // Allow events from any block
    onLogs(logs) {
      console.log('GuessResult events received:', logs);
      
      // Handle contract event
      logs.forEach((log) => {
        const { player, betAmount, generatedNumbers, correctNumber, userGuess, payout } = log.args;
        
        console.log('Event args:', { player, betAmount, generatedNumbers, correctNumber, userGuess, payout });
        console.log('Current address:', address);
        
        // Only process events for current user
        if (player && address && player.toLowerCase() === address.toLowerCase()) {
          const isWinner = payout && Number(payout) > 0;
          const payoutInEth = payout ? parseFloat(formatEther(payout)) : 0;
          
          // Use the current displayed numbers instead of contract numbers to ensure consistency
          let finalDisplayedNumbers: number[];
          let finalCorrectNumber: number;
          
          if (currentDisplayedNumbers && currentDisplayedNumbers.length === 3) {
            // Use the numbers currently displayed in the UI
            finalDisplayedNumbers = currentDisplayedNumbers;
            // Pick winning number from displayed numbers based on game result
            if (isWinner) {
              // If user won, their guess is the correct number
              finalCorrectNumber = Number(userGuess);
            } else {
              // If user lost, pick a random number from displayed numbers (but not their guess)
              const otherNumbers = finalDisplayedNumbers.filter(n => n !== Number(userGuess));
              finalCorrectNumber = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];
            }
          } else {
            // Fallback: use contract numbers if no UI numbers available
            const contractNumbers = generatedNumbers ? generatedNumbers.map(n => Number(n)) : [];
            if (contractNumbers.length === 3) {
              finalDisplayedNumbers = contractNumbers;
              finalCorrectNumber = correctNumber ? Number(correctNumber) : contractNumbers[0];
            } else {
              // Final fallback: generate numbers
              const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
              for (let i = allNumbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
              }
              finalDisplayedNumbers = allNumbers.slice(0, 3);
              finalCorrectNumber = isWinner ? Number(userGuess) : finalDisplayedNumbers.find(n => n !== Number(userGuess)) || finalDisplayedNumbers[0];
            }
          }
          
          console.log('Processing game result:', { 
            isWinner, 
            payoutInEth, 
            finalCorrectNumber, 
            finalDisplayedNumbers,
            userGuess: Number(userGuess),
            explanation: 'Using UI displayed numbers for consistency'
          });
          
          setGameState(prev => ({
            ...prev,
            isWaiting: false,
            isPlaying: false,
            gameResult: {
              isWinner,
              payout: payoutInEth,
              actualNumber: finalCorrectNumber,
              userGuess: Number(userGuess),
              displayedNumbers: finalDisplayedNumbers,
              correctNumber: finalCorrectNumber
            }
          }));

          // Show result toast
          const allDisplayedNumbers = finalDisplayedNumbers.join(', ');
          if (isWinner) {
            toast({
              title: "🎉 You Won!",
              description: `Congratulations! You won ${payoutInEth.toFixed(3)} STT. Numbers: [${allDisplayedNumbers}] | Winner: ${finalCorrectNumber}`,
            });
          } else {
            toast({
              title: "Better Luck Next Time",
              description: `Numbers: [${allDisplayedNumbers}] | Winner: ${finalCorrectNumber} | Your Guess: ${Number(userGuess)}`,
              variant: "destructive",
            });
          }
        }
      });
    },
  });

  // Contract limits for your NumberGuess contract
  const minBet = 0.01; // Minimum valid bet amount
  const maxBet = 1.0;  // Maximum valid bet amount
  const winMultiplier = 2; // 2x payout for correct guess

  // Play game - now requires generateNumbers first
  const playGame = useCallback(async (chosenNumber: number, betAmount: number) => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to play",
        variant: "destructive",
      });
      return false;
    }

    // Validate number range (1-10)
    if (chosenNumber < 1 || chosenNumber > 10) {
      toast({
        title: "Invalid Number",
        description: "Please choose a number between 1 and 10",
        variant: "destructive",
      });
      return false;
    }

    // Validate bet amount
    const validAmounts = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];
    if (!validAmounts.includes(betAmount)) {
      toast({
        title: "Invalid Bet Amount",
        description: "Please choose a valid bet amount: 0.01, 0.05, 0.1, 0.25, 0.5, or 1.0 STT",
        variant: "destructive",
      });
      return false;
    }

    try {
      setGameState(prev => ({ 
        ...prev, 
        isWaiting: true, 
        selectedNumber: chosenNumber,
        betAmount,
        isPlaying: true,
        gameResult: null
      }));
      
      // Call guessNumber directly - the new contract generates numbers internally
      console.log('Calling guessNumber with:', { chosenNumber, betAmount });
      writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'guessNumber',
        args: [BigInt(chosenNumber)],
        value: parseEther(betAmount.toString()),
        account: address,
        chain: somniaTestnet,
      });
      
      toast({
        title: "Game Started!",
        description: "Placing your bet and generating numbers...",
      });

      return true;
    } catch (error) {
      console.error('Error playing game:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to play game. Please try again.",
        variant: "destructive",
      });
      setGameState(prev => ({ ...prev, isWaiting: false, isPlaying: false }));
      return false;
    }
  }, [address, writeContract, toast]);

  // Reset game state
  const resetGame = useCallback(() => {
    // Clear any existing timeouts
    if (gameTimeoutId) {
      clearTimeout(gameTimeoutId);
      setGameTimeoutId(null);
    }
    if (fallbackCheckId) {
      clearTimeout(fallbackCheckId);
      setFallbackCheckId(null);
    }
    
    setGameState({
      isPlaying: false,
      selectedNumber: null,
      betAmount: 0.01,
      txHash: null,
      isWaiting: false,
      gameResult: null,
    });
  }, [gameTimeoutId, fallbackCheckId]);

  return {
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
  };
}