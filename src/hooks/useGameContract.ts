import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, somniaTestnet } from '@/lib/web3';
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
  } | null;
}

export function useGameContract() {
  const { address } = useAccount();
  const config = useConfig();
  const { toast } = useToast();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    selectedNumber: null,
    betAmount: 0.01, // Set to minimum valid bet amount
    txHash: null,
    isWaiting: false,
    gameResult: null,
  });

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Update transaction hash when available
  useEffect(() => {
    if (hash) {
      setGameState(prev => ({
        ...prev,
        txHash: hash,
      }));
    }
  }, [hash]);

  // Contract limits for your NumberGuess contract
  const minBet = 0.01; // Minimum valid bet amount
  const maxBet = 1.0;  // Maximum valid bet amount
  const winMultiplier = 2; // 2x payout for correct guess

  // Play game directly (single transaction)
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
        description: "Your bet has been placed. Waiting for confirmation...",
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
    setGameState({
      isPlaying: false,
      selectedNumber: null,
      betAmount: 0.01, // Reset to minimum valid bet amount
      txHash: null,
      isWaiting: false,
      gameResult: null,
    });
  }, []);

  return {
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
  };
}