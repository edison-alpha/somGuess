import { useState, useEffect } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { formatEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, somniaTestnet, MANAGEMENT_CONTRACT_ADDRESS, MANAGEMENT_CONTRACT_ABI } from '@/lib/web3';
import { readContract } from '@wagmi/core';

// Somnia Network API configuration
const SOMNIA_API_BASE = 'https://somnia.w3us.site/api/v2';
const SOMNIA_API_V1 = 'https://somnia.w3us.site/api/v1';
const BLOCKSCOUT_API_BASE = 'https://shannon-explorer.somnia.network/api/v2';
const BLOCKSCOUT_API_V1 = 'https://shannon-explorer.somnia.network/api/v1';

export interface GameHistoryEntry {
  txHash: string;
  blockNumber: bigint;
  timestamp: Date;
  player: string;
  betAmount: string;
  generatedNumbers: number[];
  correctNumber: number;
  userGuess: number;
  payout: string;
  isWinner: boolean;
  gasUsed?: string;
  gasPrice?: string;
  transactionFee?: string;
}

export interface HistoryStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalBetAmount: number;
  totalWinnings: number;
  netProfit: number;
  averageBet: number;
  biggestWin: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  favoriteNumber: number;
  totalGasSpent: number;
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export function useGameHistory() {
  const { address } = useAccount();
  const config = useConfig();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<HistoryStats | null>(null);

  // Fetch history and stats from TransactionHistory contract
  const fetchHistoryAndStats = async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch player transactions
      const txs = await readContract(config, {
        address: MANAGEMENT_CONTRACT_ADDRESS,
        abi: MANAGEMENT_CONTRACT_ABI,
        functionName: 'getPlayerTransactionHistory',
        args: [address],
        chainId: somniaTestnet.id
      });
      console.log('TXS:', txs); // Debug output
      // Adapt txs to GameHistoryEntry[]
      const historyEntries: GameHistoryEntry[] = (txs as any[]).map(tx => ({
        txHash: '', // No txHash, use empty string
        blockNumber: 0n, // Not available
        timestamp: new Date(Number(tx.timestamp) * 1000),
        player: tx.player,
        betAmount: formatEther(BigInt(tx.betAmount)),
        generatedNumbers: tx.generatedNumbers.map((n: any) => Number(n)),
        correctNumber: Number(tx.correctNumber),
        userGuess: Number(tx.userGuess),
        payout: formatEther(BigInt(tx.payout)),
        isWinner: tx.isWin,
        gasUsed: tx.gasUsed ? formatEther(BigInt(tx.gasUsed)) : undefined,
      }));
      setHistory(historyEntries);
      setTotalCount(historyEntries.length);
      // Fetch player stats
      const statsRaw = await readContract(config, {
        address: MANAGEMENT_CONTRACT_ADDRESS,
        abi: MANAGEMENT_CONTRACT_ABI,
        functionName: 'getPlayerStats',
        args: [address],
        chainId: somniaTestnet.id
      });
      // Destructure statsRaw
      const { totalGames, totalWins, totalBets, successfulGuesses, winRate, netProfit, biggestWin, currentWinStreak, maxWinStreak, currentLoseStreak, maxLoseStreak, avgBet, totalGasSpent, favoriteNumber } = statsRaw as any;
      setStats({
        totalGames: Number(totalGames),
        totalWins: Number(totalWins),
        totalLosses: Number(totalGames) - Number(totalWins),
        winRate: Number(winRate),
        totalBetAmount: parseFloat(formatEther(BigInt(totalBets))),
        totalWinnings: historyEntries.reduce((sum, e) => sum + parseFloat(e.payout), 0),
        netProfit: Number(netProfit) ? parseFloat(formatEther(BigInt(netProfit))) : 0,
        averageBet: Number(avgBet) ? parseFloat(formatEther(BigInt(avgBet))) : 0,
        biggestWin: Number(biggestWin) ? parseFloat(formatEther(BigInt(biggestWin))) : 0,
        longestWinStreak: Number(maxWinStreak) || 0,
        longestLoseStreak: Number(maxLoseStreak) || 0,
        favoriteNumber: Number(favoriteNumber) || 0,
        totalGasSpent: Number(totalGasSpent) ? parseFloat(formatEther(BigInt(totalGasSpent))) : 0
      });
    } catch (err: any) {
      setError('Failed to fetch history from contract');
      setHistory([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchHistoryAndStats();
    } else {
      setHistory([]);
      setStats(null);
    }
  }, [address]);

  // Export data functionality
  const exportData = (format: 'json' | 'csv' = 'json') => {
    if (history.length === 0) return;

    let data: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = [
        'Date', 'Transaction Hash', 'Block Number', 'Bet Amount (STT)', 
        'Generated Numbers', 'Your Guess', 'Correct Number', 'Payout (STT)', 
        'Result', 'Gas Fee (STT)'
      ];
      
      const rows = history.map(entry => [
        entry.timestamp.toISOString(),
        entry.txHash,
        entry.blockNumber.toString(),
        entry.betAmount,
        entry.generatedNumbers.join(';'),
        entry.userGuess.toString(),
        entry.correctNumber.toString(),
        entry.payout,
        entry.isWinner ? 'WIN' : 'LOSE',
        entry.transactionFee || '0'
      ]);

      data = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename = `game-history-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      data = JSON.stringify({
        exportDate: new Date().toISOString(),
        playerAddress: address,
        totalGames: history.length,
        statistics: stats,
        games: history
      }, null, 2);
      filename = `game-history-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get network statistics for additional context
  const fetchNetworkStats = async () => {
    try {
      const response = await fetch(`${SOMNIA_API_BASE}/stats`);
      if (response.ok) {
        const stats = await response.json();
        return {
          totalTransactions: stats.total_transactions,
          totalBlocks: stats.total_blocks,
          averageBlockTime: stats.average_block_time,
          gasPrice: stats.gas_prices?.average || 0,
          networkUtilization: stats.network_utilization_percentage || 0
        };
      }
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
    }
    return null;
  };

  return {
    history,
    isLoading,
    error,
    stats,
    totalCount,
    refetch: fetchHistoryAndStats,
    fetchMore: async () => {}, // Not supported with contract
    exportData,
    fetchCompleteHistory: fetchHistoryAndStats,
    fetchNetworkStats
  };
}
