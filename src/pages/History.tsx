import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useGameHistory, GameHistoryEntry } from '@/hooks/useGameHistory';
import { 
  ArrowLeft, Clock, Trophy, Target, TrendingUp, TrendingDown, RefreshCw, 
  ExternalLink, Calendar, Download, BarChart3, PieChart, Activity, 
  DollarSign, Zap, Flame, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import somImage from '@/img/som.png';
import { formatEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, MANAGEMENT_CONTRACT_ADDRESS, MANAGEMENT_CONTRACT_ABI } from '@/lib/web3';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { history, isLoading, error, stats: advancedStats, totalCount, refetch, exportData, fetchMore, fetchNetworkStats } = useGameHistory();
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [networkStats, setNetworkStats] = useState<any>(null);

  // GUNAKAN advancedStats dari useGameHistory untuk semua statistik
  const totalGames = advancedStats ? advancedStats.totalGames : 0;
  const totalWinnings = advancedStats ? advancedStats.totalWinnings.toFixed(4) : '0.0000';
  const totalBets = advancedStats ? advancedStats.totalBetAmount.toFixed(4) : '0.0000';
  const successfulGuesses = advancedStats ? advancedStats.totalWins : 0;
  // Winrate sama dengan leaderboard: successfulGuesses / totalGames * 100
  const winRate = advancedStats && typeof advancedStats.winRate === 'number'
    ? (advancedStats.winRate / 100).toFixed(1)
    : (advancedStats && advancedStats.totalGames > 0
        ? ((advancedStats.totalWins / advancedStats.totalGames)).toFixed(2)
        : '0.0');
  const netProfit = advancedStats ? advancedStats.netProfit.toFixed(4) : '0.0000';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTxUrl = (txHash: string) => {
    return `https://shannon-explorer.somnia.network/tx/${txHash}`;
  };

  // Legacy stats calculation for backward compatibility
  const getGameStats = () => {
    if (advancedStats) {
      return {
        totalGames: advancedStats.totalGames,
        wins: advancedStats.totalWins,
        totalBet: advancedStats.totalBetAmount,
        totalWinnings: advancedStats.totalWinnings,
        winRate: advancedStats.winRate,
        profit: advancedStats.netProfit
      };
    }
    
    const totalGames = history.length;
    const wins = history.filter(game => game.isWinner).length;
    const totalBet = history.reduce((sum, game) => sum + parseFloat(game.betAmount), 0);
    const totalWinnings = history.reduce((sum, game) => sum + parseFloat(game.payout), 0);
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const profit = totalWinnings - totalBet;

    return { totalGames, wins, totalBet, totalWinnings, winRate, profit };
  };

  // const handleExport = () => {
  //   exportData(exportFormat);
  // };

  const legacyStats = getGameStats();

  const stats = getGameStats();

  // Fetch network stats when component mounts
  useEffect(() => {
    const loadNetworkStats = async () => {
      const stats = await fetchNetworkStats();
      setNetworkStats(stats);
    };
    loadNetworkStats();
  }, [fetchNetworkStats]);

  // DEBUG: Log data to console for troubleshooting
  useEffect(() => {
    console.log('[History] history:', history);
    console.log('[History] advancedStats:', advancedStats);
    console.log('[History] error:', error);
  }, [history, advancedStats, error]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#0f172a] via-[#33396C] to-[#0f172a]">
      <Navbar />
      {/* DEBUG: Show error if exists */}
      {error && (
        <div className="bg-red-900/80 text-red-200 px-4 py-2 rounded mb-4 text-center">
          <b>History Fetch Error:</b> {error}
        </div>
      )}
      
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-cyan-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-neon-purple/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-neon-cyan/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Judul utama Game History */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">Game History</h2>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-black/20 border-slate-600 text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Game</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center space-x-2 border-slate-600 text-white hover:bg-slate-800/50"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span>Refresh</span>
              </Button>
              
              {/* Export Controls dihapus sesuai permintaan */}
            </div>
          </motion.div>

          {!isConnected ? (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
              <CardContent className="p-12 text-center">
                <Clock className="w-20 h-20 mx-auto mb-6 text-slate-600" />
                <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
                <p className="text-slate-400 mb-6">
                  Connect your wallet to view your game history and statistics
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* DEBUG: Show raw data if error or empty */}
              {/* Blok debug dihapus sesuai permintaan */}

              {/* View Mode Selector */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'analytics', label: 'Analytics', icon: PieChart },
                    { id: 'detailed', label: 'Games', icon: Activity }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setViewMode(id as any)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-md transition-all",
                        viewMode === id
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Cards - Enhanced */}
              {(viewMode === 'overview' || viewMode === 'analytics') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Games</p>
                              <p className="text-2xl font-bold text-white">{Math.round(totalGames)}</p>
                              {totalCount > history.length && (
                                <p className="text-xs text-slate-500">+{totalCount - history.length} more</p>
                              )}
                            </div>
                            <Target className="w-8 h-8 text-neon-blue" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Win Rate</p>
                              <p className="text-2xl font-bold text-neon-green">{winRate}%</p>
                            </div>
                            <Trophy className="w-8 h-8 text-neon-green" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Winnings</p>
                              <p className="text-2xl font-bold text-neon-cyan">{totalWinnings} STT</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-neon-cyan" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Net Profit</p>
                              <p className={cn(
                                "text-2xl font-bold",
                                parseFloat(netProfit) >= 0 ? "text-neon-green" : "text-red-400"
                              )}>
                                {parseFloat(netProfit) >= 0 ? '+' : ''}{netProfit} STT
                              </p>
                            </div>
                            {parseFloat(netProfit) >= 0 ? (
                              <TrendingUp className="w-8 h-8 text-neon-green" />
                            ) : (
                              <TrendingDown className="w-8 h-8 text-red-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Advanced Analytics - Only show if we have advanced stats */}
                  {advancedStats && viewMode === 'analytics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Biggest Win</p>
                                <p className="text-xl font-bold text-green-400">{advancedStats.biggestWin.toFixed(4)} STT</p>
                              </div>
                              <Star className="w-8 h-8 text-yellow-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Win Streak</p>
                                <p className="text-xl font-bold text-orange-400">{advancedStats.longestWinStreak}</p>
                              </div>
                              <Flame className="w-8 h-8 text-orange-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Favorite Number</p>
                                <p className="text-xl font-bold text-purple-400">{advancedStats.favoriteNumber}</p>
                              </div>
                              <Target className="w-8 h-8 text-purple-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Avg Bet</p>
                                <p className="text-xl font-bold text-blue-400">{advancedStats.averageBet.toFixed(4)} STT</p>
                              </div>
                              <DollarSign className="w-8 h-8 text-blue-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Gas Spent</p>
                                <p className="text-xl font-bold text-yellow-400">{advancedStats.totalGasSpent.toFixed(6)} STT</p>
                              </div>
                              <Zap className="w-8 h-8 text-yellow-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
                        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Lose Streak</p>
                                <p className="text-xl font-bold text-red-400">{advancedStats.longestLoseStreak}</p>
                              </div>
                              <TrendingDown className="w-8 h-8 text-red-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  )}

                  {/* Network Statistics - Show in analytics view */}
                  {viewMode === 'analytics' && networkStats && (
                    <>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Network Statistics</h3>
                        <p className="text-sm text-slate-400">Live data from Somnia Network</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
                          <Card className="bg-slate-800/30 border-slate-600/30 backdrop-blur-lg">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                                  <p className="text-lg font-bold text-cyan-400">{Number(networkStats.totalTransactions).toLocaleString()}</p>
                                </div>
                                <Activity className="w-6 h-6 text-cyan-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                          <Card className="bg-slate-800/30 border-slate-600/30 backdrop-blur-lg">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Avg Block Time</p>
                                  <p className="text-lg font-bold text-green-400">{networkStats.averageBlockTime}s</p>
                                </div>
                                <Clock className="w-6 h-6 text-green-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
                          <Card className="bg-slate-800/30 border-slate-600/30 backdrop-blur-lg">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Network Usage</p>
                                  <p className="text-lg font-bold text-orange-400">{networkStats.networkUtilization.toFixed(1)}%</p>
                                </div>
                                <BarChart3 className="w-6 h-6 text-orange-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Game History - Only show in detailed view or if it's the only view */}
              {(viewMode === 'detailed' || viewMode === 'overview') && (
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Calendar className="w-6 h-6 mr-2 text-neon-purple" />
                        Recent Games
                      </div>
                      <div className="text-xs text-slate-400 font-normal">
                        {totalCount > history.length ? `Showing ${history.length} of ${totalCount}` : `${history.length} total`}
                        {error?.includes('API') && (
                          <span className="ml-2 text-yellow-400">• RPC Mode</span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-20 bg-slate-800/50 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <div className="text-red-400 mb-2">Error loading history</div>
                        <p className="text-sm text-slate-500 mb-4">{error}</p>
                        <p className="text-xs text-slate-600 mb-4">
                          Note: Only recent games are shown due to network limitations
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refetch}
                          disabled={isLoading}
                          className="flex items-center space-x-2 border-slate-600 text-white hover:bg-slate-800/50"
                        >
                          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                          <span>Try Again</span>
                        </Button>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Games Yet</h3>
                        <p className="text-slate-400 mb-6">Start playing to build your game history!</p>
                        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                          Play Your First Game
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 overflow-x-auto md:overflow-x-visible">
                        {history.map((game: GameHistoryEntry, index: number) => (
                          <motion.div
                            key={game.txHash}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                              "p-4 rounded-lg border transition-all duration-300 min-w-[320px] sm:min-w-0",
                              game.isWinner 
                                ? "bg-green-900/20 border-green-600/30 hover:bg-green-900/30" 
                                : "bg-red-900/20 border-red-600/30 hover:bg-red-900/30"
                            )}
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  {game.isWinner ? (
                                    <Trophy className="w-6 h-6 text-green-400" />
                                  ) : (
                                    <Target className="w-6 h-6 text-red-400" />
                                  )}
                                  <Badge variant={game.isWinner ? "default" : "destructive"} className={cn(
                                    game.isWinner 
                                      ? "bg-green-600/20 text-green-400 border-green-600/30" 
                                      : "bg-red-600/20 text-red-400 border-red-600/30"
                                  )}>
                                    {game.isWinner ? "WIN" : "LOSE"}
                                  </Badge>
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center space-x-2 text-white text-sm md:text-base">
                                    <span className="font-medium">Numbers: {game.generatedNumbers.join(', ')}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>Your pick: <span className="font-bold text-neon-blue">{game.userGuess}</span></span>
                                    <span className="text-slate-400">|</span>
                                    <span>Winner: <span className="font-bold text-neon-green">{game.correctNumber}</span></span>
                                  </div>
                                  <div className="flex flex-wrap items-center space-x-4 text-xs md:text-sm text-slate-400 mt-1">
                                    <span>{formatDate(game.timestamp)}</span>
                                    <span>Bet: {game.betAmount} STT</span>
                                    {game.isWinner && <span className="text-green-400">Won: {game.payout} STT</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                <a
                                  href={getTxUrl(game.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                                  title="View transaction"
                                >
                                  <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Back to Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
            >
              <Target className="w-5 h-5 mr-2" />
              Play Again
            </Button>
          </motion.div>
        </div>
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
};

export default History;
