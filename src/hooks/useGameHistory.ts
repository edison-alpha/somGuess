import { useState, useEffect } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { formatEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, somniaTestnet } from '@/lib/web3';

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

  // Fetch complete history using multiple API sources
  const fetchCompleteHistory = async (filters?: DateRangeFilter) => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      console.log('Fetching complete history with multiple API sources...');

      // Try Somnia API first for better performance
      let historyEntries: GameHistoryEntry[] = [];
      let apiSuccess = false;

      try {
        // Method 1: Try Somnia API for addresses transactions
        const addressTxUrl = new URL(`${SOMNIA_API_BASE}/addresses/${address}/transactions`);
        addressTxUrl.searchParams.append('filter', JSON.stringify({
          to: GAME_CONTRACT_ADDRESS,
          method: 'makeGuess'
        }));
        addressTxUrl.searchParams.append('limit', limit.toString());
        addressTxUrl.searchParams.append('offset', offset.toString());

        console.log('Trying Somnia API:', addressTxUrl.toString());

        const response = await fetch(addressTxUrl.toString());
        
        if (response.ok) {
          const data = await response.json();
          console.log('Somnia API response:', data);
          
          if (data.items && Array.isArray(data.items)) {
            for (const tx of data.items) {
              try {
                // Get transaction logs for this specific transaction
                const logsResponse = await fetch(`${SOMNIA_API_BASE}/transactions/${tx.hash}/logs`);
                if (logsResponse.ok) {
                  const logsData = await logsResponse.json();
                  
                  // Find GuessResult event logs
                  const guessResultLogs = logsData.items?.filter((log: any) => 
                    log.address?.hash?.toLowerCase() === GAME_CONTRACT_ADDRESS.toLowerCase() &&
                    log.decoded?.method_id === 'GuessResult'
                  ) || [];

                  for (const log of guessResultLogs) {
                    if (log.decoded?.parameters) {
                      const params = log.decoded.parameters;
                      const entry: GameHistoryEntry = {
                        txHash: tx.hash,
                        blockNumber: BigInt(tx.block_number || 0),
                        timestamp: new Date(tx.timestamp || Date.now()),
                        player: address,
                        betAmount: formatEther(BigInt(params.find((p: any) => p.name === 'betAmount')?.value || '0')),
                        generatedNumbers: (params.find((p: any) => p.name === 'generatedNumbers')?.value || []).map((n: string) => Number(n)),
                        correctNumber: Number(params.find((p: any) => p.name === 'correctNumber')?.value || '0'),
                        userGuess: Number(params.find((p: any) => p.name === 'userGuess')?.value || '0'),
                        payout: formatEther(BigInt(params.find((p: any) => p.name === 'payout')?.value || '0')),
                        isWinner: BigInt(params.find((p: any) => p.name === 'payout')?.value || '0') > 0n,
                        gasUsed: tx.gas_used || '0',
                        gasPrice: tx.gas_price || '0',
                        transactionFee: tx.fee?.value || '0'
                      };

                      historyEntries.push(entry);
                    }
                  }
                }
              } catch (txError) {
                console.error('Error processing transaction:', txError);
              }
            }
            
            setTotalCount(data.total_count || historyEntries.length);
            apiSuccess = true;
          }
        }
      } catch (somniaError) {
        console.warn('Somnia API failed, trying Blockscout:', somniaError);
      }

      // Method 2: Fallback to Blockscout API if Somnia API fails
      if (!apiSuccess) {
        try {
          const logsUrl = new URL(`${BLOCKSCOUT_API_V1}/addresses/${GAME_CONTRACT_ADDRESS}/logs`);
          logsUrl.searchParams.append('filter', JSON.stringify({
            topics: {
              '0': '0x0abc92e33950cf328ae06045223d4b24b9ba5907bd93914c88e2445910a5b657', // GuessResult event signature
              '1': `0x000000000000000000000000${address.slice(2).toLowerCase()}` // Player address
            }
          }));
          logsUrl.searchParams.append('limit', limit.toString());
          logsUrl.searchParams.append('offset', offset.toString());

          console.log('Trying Blockscout API:', logsUrl.toString());

          const response = await fetch(logsUrl.toString());
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.items && Array.isArray(data.items)) {
              for (const log of data.items) {
                try {
                  // Get transaction details for additional info
                  const txResponse = await fetch(`${BLOCKSCOUT_API_BASE}/transactions/${log.transaction_hash}`);
                  const txData = txResponse.ok ? await txResponse.json() : null;

                  const entry: GameHistoryEntry = {
                    txHash: log.transaction_hash,
                    blockNumber: BigInt(log.block_number || 0),
                    timestamp: new Date(log.block_timestamp || Date.now()),
                    player: address,
                    betAmount: '0', // Will be parsed from data
                    generatedNumbers: [], // Will be parsed from data
                    correctNumber: 0, // Will be parsed from data
                    userGuess: 0, // Will be parsed from data
                    payout: '0', // Will be parsed from data
                    isWinner: false, // Will be determined from payout
                    gasUsed: txData?.gas_used || '0',
                    gasPrice: txData?.gas_price || '0',
                    transactionFee: txData?.fee?.value || '0'
                  };

                  // TODO: Implement proper ABI decoding for Blockscout data
                  historyEntries.push(entry);
                } catch (logError) {
                  console.error('Error processing Blockscout log:', logError);
                }
              }

              setTotalCount(data.total_count || historyEntries.length);
              apiSuccess = true;
            }
          }
        } catch (blockscoutError) {
          console.warn('Blockscout API also failed:', blockscoutError);
        }
      }

      // Method 3: Always merge with RPC data for recent/complete data
      const rpcData = await fetchRecentDataRPC();
      
      // Merge and deduplicate
      const allEntries = [...rpcData, ...historyEntries];
      const uniqueEntries = allEntries.filter((entry, index, self) => 
        self.findIndex(e => e.txHash === entry.txHash) === index
      );

      // Sort by timestamp (newest first)
      uniqueEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setHistory(uniqueEntries);
      setStats(calculateAdvancedStats(uniqueEntries));

      if (!apiSuccess && rpcData.length === 0) {
        throw new Error('All API sources failed');
      }

    } catch (err) {
      console.error('Error fetching complete history:', err);
      
      // Final fallback to RPC only
      console.log('Falling back to RPC data only...');
      const rpcData = await fetchRecentDataRPC();
      setHistory(rpcData);
      setStats(calculateAdvancedStats(rpcData));
      
      setError(`API services temporarily unavailable. Showing recent data only. (${err instanceof Error ? err.message : 'Unknown error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGameHistory = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      const publicClient = getPublicClient(config, { chainId: somniaTestnet.id });
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();
      
      let logs;
      let fromBlock: bigint;
      
      try {
        // Try with 800 blocks first
        const blockRange = 800n;
        fromBlock = currentBlock > blockRange ? currentBlock - blockRange : 0n;
        
        console.log(`Fetching logs from block ${fromBlock} to ${currentBlock} (800 block range)`);

        logs = await publicClient.getLogs({
          address: GAME_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'GuessResult',
            inputs: [
              { name: 'player', type: 'address', indexed: true },
              { name: 'betAmount', type: 'uint256', indexed: false },
              { name: 'generatedNumbers', type: 'uint256[3]', indexed: false },
              { name: 'correctNumber', type: 'uint256', indexed: false },
              { name: 'userGuess', type: 'uint256', indexed: false },
              { name: 'payout', type: 'uint256', indexed: false }
            ]
          },
          args: {
            player: address
          },
          fromBlock,
          toBlock: 'latest'
        });
      } catch (initialError) {
        console.warn('Failed with 800 blocks, trying with 400 blocks:', initialError);
        
        // Fallback to smaller range
        const smallerBlockRange = 400n;
        fromBlock = currentBlock > smallerBlockRange ? currentBlock - smallerBlockRange : 0n;
        
        console.log(`Fetching logs from block ${fromBlock} to ${currentBlock} (400 block range)`);

        logs = await publicClient.getLogs({
          address: GAME_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'GuessResult',
            inputs: [
              { name: 'player', type: 'address', indexed: true },
              { name: 'betAmount', type: 'uint256', indexed: false },
              { name: 'generatedNumbers', type: 'uint256[3]', indexed: false },
              { name: 'correctNumber', type: 'uint256', indexed: false },
              { name: 'userGuess', type: 'uint256', indexed: false },
              { name: 'payout', type: 'uint256', indexed: false }
            ]
          },
          args: {
            player: address
          },
          fromBlock,
          toBlock: 'latest'
        });
      }

      // Process logs to create history entries
      const historyEntries: GameHistoryEntry[] = [];

      for (const log of logs) {
        try {
          // Get block to extract timestamp
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          if (log.args) {
            const {
              player,
              betAmount,
              generatedNumbers,
              correctNumber,
              userGuess,
              payout
            } = log.args;

            const entry: GameHistoryEntry = {
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
              timestamp: new Date(Number(block.timestamp) * 1000),
              player: player as string,
              betAmount: formatEther(betAmount as bigint),
              generatedNumbers: (generatedNumbers as readonly bigint[]).map(n => Number(n)),
              correctNumber: Number(correctNumber as bigint),
              userGuess: Number(userGuess as bigint),
              payout: formatEther(payout as bigint),
              isWinner: (payout as bigint) > 0n
            };

            historyEntries.push(entry);
          }
        } catch (logError) {
          console.error('Error processing log:', logError);
        }
      }

      // Sort by timestamp (newest first)
      historyEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setHistory(historyEntries);
      
      // Log success info
      console.log(`Successfully fetched ${historyEntries.length} game history entries`);
      
    } catch (err) {
      console.error('Error fetching game history:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch game history';
      if (err instanceof Error) {
        if (err.message.includes('block range exceeds')) {
          errorMessage = 'Block range too large. Showing recent games only.';
        } else if (err.message.includes('RPC Request failed')) {
          errorMessage = 'Network connection error. Please try again.';
        } else if (err.message.includes('Public client not available')) {
          errorMessage = 'Wallet connection error. Please reconnect your wallet.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // RPC fallback for recent data
  const fetchRecentDataRPC = async (): Promise<GameHistoryEntry[]> => {
    try {
      const publicClient = getPublicClient(config, { chainId: somniaTestnet.id });
      if (!publicClient) return [];

      const currentBlock = await publicClient.getBlockNumber();
      let logs;
      let fromBlock: bigint;
      
      try {
        const blockRange = 800n;
        fromBlock = currentBlock > blockRange ? currentBlock - blockRange : 0n;
        
        logs = await publicClient.getLogs({
          address: GAME_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'GuessResult',
            inputs: [
              { name: 'player', type: 'address', indexed: true },
              { name: 'betAmount', type: 'uint256', indexed: false },
              { name: 'generatedNumbers', type: 'uint256[3]', indexed: false },
              { name: 'correctNumber', type: 'uint256', indexed: false },
              { name: 'userGuess', type: 'uint256', indexed: false },
              { name: 'payout', type: 'uint256', indexed: false }
            ]
          },
          args: { player: address },
          fromBlock,
          toBlock: 'latest'
        });
      } catch (initialError) {
        const smallerBlockRange = 400n;
        fromBlock = currentBlock > smallerBlockRange ? currentBlock - smallerBlockRange : 0n;
        
        logs = await publicClient.getLogs({
          address: GAME_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'GuessResult',
            inputs: [
              { name: 'player', type: 'address', indexed: true },
              { name: 'betAmount', type: 'uint256', indexed: false },
              { name: 'generatedNumbers', type: 'uint256[3]', indexed: false },
              { name: 'correctNumber', type: 'uint256', indexed: false },
              { name: 'userGuess', type: 'uint256', indexed: false },
              { name: 'payout', type: 'uint256', indexed: false }
            ]
          },
          args: { player: address },
          fromBlock,
          toBlock: 'latest'
        });
      }

      const historyEntries: GameHistoryEntry[] = [];

      for (const log of logs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          if (log.args) {
            const { player, betAmount, generatedNumbers, correctNumber, userGuess, payout } = log.args;

            const entry: GameHistoryEntry = {
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
              timestamp: new Date(Number(block.timestamp) * 1000),
              player: player as string,
              betAmount: formatEther(betAmount as bigint),
              generatedNumbers: (generatedNumbers as readonly bigint[]).map(n => Number(n)),
              correctNumber: Number(correctNumber as bigint),
              userGuess: Number(userGuess as bigint),
              payout: formatEther(payout as bigint),
              isWinner: (payout as bigint) > 0n
            };

            historyEntries.push(entry);
          }
        } catch (logError) {
          console.error('Error processing RPC log:', logError);
        }
      }

      return historyEntries;
    } catch (error) {
      console.error('RPC fallback failed:', error);
      return [];
    }
  };

  // Calculate advanced statistics
  const calculateAdvancedStats = (entries: GameHistoryEntry[]): HistoryStats => {
    if (entries.length === 0) {
      return {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalBetAmount: 0,
        totalWinnings: 0,
        netProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        longestWinStreak: 0,
        longestLoseStreak: 0,
        favoriteNumber: 0,
        totalGasSpent: 0
      };
    }

    const wins = entries.filter(e => e.isWinner);
    const totalBetAmount = entries.reduce((sum, e) => sum + parseFloat(e.betAmount), 0);
    const totalWinnings = entries.reduce((sum, e) => sum + parseFloat(e.payout), 0);
    const totalGasSpent = entries.reduce((sum, e) => sum + parseFloat(e.transactionFee || '0'), 0);

    // Calculate streaks
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let longestWinStreak = 0;
    let longestLoseStreak = 0;

    for (const entry of entries) {
      if (entry.isWinner) {
        currentWinStreak++;
        currentLoseStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else {
        currentLoseStreak++;
        currentWinStreak = 0;
        longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
      }
    }

    // Find favorite number
    const numberCounts = entries.reduce((counts, e) => {
      counts[e.userGuess] = (counts[e.userGuess] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);
    
    const favoriteNumber = Object.entries(numberCounts).reduce((a, b) => 
      numberCounts[Number(a[0])] > numberCounts[Number(b[0])] ? a : b
    )[0];

    return {
      totalGames: entries.length,
      totalWins: wins.length,
      totalLosses: entries.length - wins.length,
      winRate: (wins.length / entries.length) * 100,
      totalBetAmount,
      totalWinnings,
      netProfit: totalWinnings - totalBetAmount - totalGasSpent,
      averageBet: totalBetAmount / entries.length,
      biggestWin: Math.max(...wins.map(w => parseFloat(w.payout)), 0),
      longestWinStreak,
      longestLoseStreak,
      favoriteNumber: Number(favoriteNumber) || 0,
      totalGasSpent
    };
  };

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

  // Fetch more data with pagination
  const fetchMore = async (offset: number) => {
    await fetchCompleteHistory({ limit: 50, offset });
  };

  // Get network statistics for additional context
  const fetchNetworkStats = async () => {
    try {
      const response = await fetch(`${SOMNIA_API_BASE}/stats`);
      if (response.ok) {
        const stats = await response.json();
        console.log('Network stats:', stats);
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

  useEffect(() => {
    if (address) {
      fetchCompleteHistory();
    } else {
      setHistory([]);
      setStats(null);
    }
  }, [address]);

  return {
    history,
    isLoading,
    error,
    stats,
    totalCount,
    refetch: () => fetchCompleteHistory(),
    fetchMore,
    exportData,
    fetchCompleteHistory,
    fetchNetworkStats
  };
}
