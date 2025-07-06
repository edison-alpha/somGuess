import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, keccak256, encodePacked, formatEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

export interface GameState {
  isPlaying: boolean;
  selectedNumber: number | null;
  betAmount: number;
  secret: string;
  commitment: string;
  txHash: string | null;
  isWaiting: boolean;
}

export function useGameContract() {
  const { address } = useAccount();
  const { toast } = useToast();
  const { writeContract, isPending, isSuccess } = useWriteContract();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    selectedNumber: null,
    betAmount: 0.001,
    secret: '',
    commitment: '',
    txHash: null,
    isWaiting: false,
  });

  // Read contract data
  const { data: minBet } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    functionName: 'minBet',
  });

  const { data: maxBet } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    functionName: 'maxBet',
  });

  const { data: winMultiplier } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    functionName: 'WIN_MULTIPLIER',
  });

  // Generate commitment for chosen number and secret
  const generateCommitment = useCallback((chosenNumber: number) => {
    const secret = Math.random().toString(36).substring(2, 15);
    const commitment = keccak256(
      encodePacked(['uint256', 'bytes32'], [BigInt(chosenNumber), keccak256(encodePacked(['string'], [secret]))])
    );
    
    return { secret, commitment };
  }, []);

  // Commit game (first phase of commit-reveal)
  const commitGame = useCallback(async (chosenNumber: number, betAmount: number) => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to play",
        variant: "destructive",
      });
      return false;
    }

    try {
      setGameState(prev => ({ ...prev, isWaiting: true }));
      
      const { secret, commitment } = generateCommitment(chosenNumber);
      
      writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'commitGame',
        args: [commitment],
        value: parseEther(betAmount.toString()),
      } as any);

      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        selectedNumber: chosenNumber,
        betAmount,
        secret,
        commitment,
        txHash: 'pending',
      }));

      toast({
        title: "Game Committed!",
        description: "Your bet has been placed. Wait for confirmation, then reveal your choice.",
      });

      return true;
    } catch (error) {
      console.error('Error committing game:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to commit game. Please try again.",
        variant: "destructive",
      });
      setGameState(prev => ({ ...prev, isWaiting: false }));
      return false;
    }
  }, [address, generateCommitment, writeContract, toast]);

  // Reveal game (second phase of commit-reveal)
  const revealGame = useCallback(async () => {
    if (!gameState.selectedNumber || !gameState.secret) {
      toast({
        title: "Invalid Game State",
        description: "No game to reveal",
        variant: "destructive",
      });
      return false;
    }

    try {
      setGameState(prev => ({ ...prev, isWaiting: true }));

      const secretHash = keccak256(encodePacked(['string'], [gameState.secret]));
      
      writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'revealGame',
        args: [BigInt(gameState.selectedNumber), secretHash],
      } as any);

      toast({
        title: "Game Revealed!",
        description: "Your choice has been revealed. Checking results...",
      });

      return true;
    } catch (error) {
      console.error('Error revealing game:', error);
      toast({
        title: "Reveal Failed",
        description: "Failed to reveal game. Please try again.",
        variant: "destructive",
      });
      setGameState(prev => ({ ...prev, isWaiting: false }));
      return false;
    }
  }, [gameState.selectedNumber, gameState.secret, writeContract, toast]);

  // Reset game state
  const resetGame = useCallback(() => {
    setGameState({
      isPlaying: false,
      selectedNumber: null,
      betAmount: 0.001,
      secret: '',
      commitment: '',
      txHash: null,
      isWaiting: false,
    });
  }, []);

  return {
    gameState,
    setGameState,
    commitGame,
    revealGame,
    resetGame,
    minBet: minBet ? parseFloat(formatEther(minBet)) : 0.001,
    maxBet: maxBet ? parseFloat(formatEther(maxBet)) : 5,
    winMultiplier: winMultiplier ? Number(winMultiplier) : 2,
    isPending,
    isSuccess,
  };
}