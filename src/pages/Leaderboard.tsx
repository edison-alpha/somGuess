import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, Star, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from '@/lib/web3';
import { cn } from '@/lib/utils';
import somImage from '@/img/som.png';

interface LeaderboardEntry {
  player: string;
  totalWinnings: bigint;
}

interface PlayerStats {
  player: string;
  totalWinnings: bigint;
  totalBets: bigint;
  successfulGuesses: bigint;
}

export default function Leaderboard() {
  const { address, isConnected } = useAccount();
  const [currentPlayerStats, setCurrentPlayerStats] = useState<PlayerStats | null>(null);

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: isLoadingLeaderboard, refetch: refetchLeaderboard } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getLeaderboard',
    query: { 
      enabled: true,
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  });

  // Fetch current player stats
  const { data: playerStatsData, isLoading: isLoadingPlayerStats, refetch: refetchPlayerStats } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      refetchInterval: 30000
    }
  });

  useEffect(() => {
    if (playerStatsData) {
      setCurrentPlayerStats(playerStatsData as PlayerStats);
    }
  }, [playerStatsData]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-purple-400" />;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return "1st";
      case 1:
        return "2nd";
      case 2:
        return "3rd";
      default:
        return `${index + 1}th`;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateWinRate = (successfulGuesses: bigint, totalBets: bigint) => {
    if (totalBets === 0n) return 0;
    // Convert to number for percentage calculation
    const successful = Number(successfulGuesses);
    const total = Number(formatEther(totalBets));
    const rate = (successful / (total * 100)) * 100; // Assuming each bet is counted
    return Math.min(rate, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-cyan-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-neon-purple/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-neon-cyan/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Top players by total winnings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="w-6 h-6 mr-2 text-neon-green" />
                  Top 10 Players
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingLeaderboard ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-slate-800/50 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : leaderboardData && Array.isArray(leaderboardData) && leaderboardData.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboardData.map((entry: LeaderboardEntry, index: number) => (
                      <motion.div
                        key={entry.player}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg transition-all duration-300",
                          index === 0 && "bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-600/30",
                          index === 1 && "bg-gradient-to-r from-gray-900/30 to-gray-800/20 border border-gray-600/30",
                          index === 2 && "bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-600/30",
                          index > 2 && "bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30",
                          entry.player.toLowerCase() === address?.toLowerCase() && "ring-2 ring-neon-blue/50"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(index)}
                            <Badge variant={index < 3 ? "default" : "secondary"} className={cn(
                              index === 0 && "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
                              index === 1 && "bg-gray-600/20 text-gray-400 border-gray-600/30",
                              index === 2 && "bg-amber-600/20 text-amber-400 border-amber-600/30"
                            )}>
                              {getRankBadge(index)}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {formatAddress(entry.player)}
                              {entry.player.toLowerCase() === address?.toLowerCase() && (
                                <span className="ml-2 text-xs text-neon-blue">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neon-green">
                            {parseFloat(formatEther(entry.totalWinnings)).toFixed(4)} STT
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No players on leaderboard yet</p>
                    <p className="text-sm text-slate-500 mt-2">Be the first to win and claim your spot!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player Stats */}
          <div className="space-y-6">
            {/* Your Stats */}
            {isConnected && (
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Star className="w-6 h-6 mr-2 text-neon-purple" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPlayerStats ? (
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-800/50 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : currentPlayerStats ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Winnings</p>
                        <p className="text-xl font-bold text-neon-green">
                          {parseFloat(formatEther(currentPlayerStats.totalWinnings)).toFixed(4)} STT
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bets</p>
                        <p className="text-lg font-semibold text-white">
                          {parseFloat(formatEther(currentPlayerStats.totalBets)).toFixed(4)} STT
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Successful Guesses</p>
                        <p className="text-lg font-semibold text-white">
                          {currentPlayerStats.successfulGuesses.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-lg font-semibold text-neon-cyan">
                          {calculateWinRate(currentPlayerStats.successfulGuesses, currentPlayerStats.totalBets).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-400">No game history yet</p>
                      <p className="text-sm text-slate-500 mt-1">Play your first game to see stats!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Game Info */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Game Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-6 h-6 bg-center bg-no-repeat bg-contain opacity-60 mt-0.5"
                    style={{ backgroundImage: `url('${somImage}')` }}
                  />
                  <div>
                    <p className="font-medium text-white">How to Play</p>
                    <p>Generate 3 numbers, pick one, and place your bet. If your number is chosen as the winner, you get 2x your bet!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Trophy className="w-6 h-6 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Leaderboard</p>
                    <p>Rankings are based on total winnings across all games played.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-neon-green mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Win Rate</p>
                    <p>Your success percentage calculated from successful guesses vs total games.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Game */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium"
          >
            <Star className="w-5 h-5 mr-2" />
            Back to Game
          </a>
        </motion.div>
      </div>

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
  );
}
