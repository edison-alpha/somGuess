// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GameStats {
    address public owner;
    address public gameContract;
    
    // Structure to store detailed player statistics
    struct PlayerStats {
        address player;
        uint256 totalWinnings;
        uint256 totalBets;
        uint256 successfulGuesses;
        uint256 totalGames;
        uint256 biggestWin;
        uint256 currentWinStreak;
        uint256 maxWinStreak;
        uint256 currentLoseStreak;
        uint256 maxLoseStreak;
        uint256 totalGasSpent;
        mapping(uint256 => uint256) numberFrequency; // Track favorite numbers
        uint256 favoriteNumber;
        uint256 maxNumberFrequency;
    }

    // Structure for leaderboard entry
    struct LeaderboardEntry {
        address player;
        uint256 totalWinnings;
    }

    // Structure for transaction history
    struct GameTransaction {
        address player;
        uint256 betAmount;
        uint256[3] generatedNumbers;
        uint256 correctNumber;
        uint256 userGuess;
        uint256 payout;
        uint256 gasUsed;
        uint256 timestamp;
        bool isWin;
    }

    // Structure for stats view (without mappings for external calls)
    struct PlayerStatsView {
        address player;
        uint256 totalWinnings;
        uint256 totalBets;
        uint256 successfulGuesses;
        uint256 totalGames;
        uint256 winRate; // Percentage * 100 (e.g., 5000 = 50.00%)
        uint256 netProfit; // totalWinnings - totalBets
        uint256 biggestWin;
        uint256 currentWinStreak;
        uint256 maxWinStreak;
        uint256 currentLoseStreak;
        uint256 maxLoseStreak;
        uint256 avgBet;
        uint256 totalGasSpent;
        uint256 favoriteNumber;
    }

    mapping(address => PlayerStats) private playerStats;
    LeaderboardEntry[] public leaderboard;
    GameTransaction[] public gameHistory;
    mapping(address => uint256[]) public playerTransactionIds;
    
    event StatsUpdated(address indexed player, bool isWin, uint256 payout);
    event LeaderboardUpdated(address indexed player, uint256 totalWinnings);
    event TransactionRecorded(address indexed player, uint256 transactionId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Only game contract can call this function");
        _;
    }

    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }

    function recordGameResult(
        address player,
        uint256 betAmount,
        uint256[3] calldata generatedNumbers,
        uint256 correctNumber,
        uint256 userGuess,
        uint256 payout,
        uint256 gasUsed
    ) external onlyGameContract {
        bool isWin = (userGuess == correctNumber);
        
        // Update player stats
        PlayerStats storage stats = playerStats[player];
        stats.player = player;
        stats.totalBets += betAmount;
        stats.totalGames += 1;
        stats.totalGasSpent += gasUsed;
        
        // Update number frequency
        stats.numberFrequency[userGuess] += 1;
        if (stats.numberFrequency[userGuess] > stats.maxNumberFrequency) {
            stats.maxNumberFrequency = stats.numberFrequency[userGuess];
            stats.favoriteNumber = userGuess;
        }
        
        if (isWin) {
            stats.totalWinnings += payout;
            stats.successfulGuesses += 1;
            
            // Update biggest win
            if (payout > stats.biggestWin) {
                stats.biggestWin = payout;
            }
            
            // Update win streak
            stats.currentWinStreak += 1;
            if (stats.currentWinStreak > stats.maxWinStreak) {
                stats.maxWinStreak = stats.currentWinStreak;
            }
            stats.currentLoseStreak = 0;
        } else {
            // Update lose streak
            stats.currentLoseStreak += 1;
            if (stats.currentLoseStreak > stats.maxLoseStreak) {
                stats.maxLoseStreak = stats.currentLoseStreak;
            }
            stats.currentWinStreak = 0;
        }
        
        // Record transaction
        GameTransaction memory transaction = GameTransaction({
            player: player,
            betAmount: betAmount,
            generatedNumbers: generatedNumbers,
            correctNumber: correctNumber,
            userGuess: userGuess,
            payout: payout,
            gasUsed: gasUsed,
            timestamp: block.timestamp,
            isWin: isWin
        });
        
        gameHistory.push(transaction);
        uint256 transactionId = gameHistory.length - 1;
        playerTransactionIds[player].push(transactionId);
        
        // Update leaderboard
        updateLeaderboard(player, stats.totalWinnings);
        
        emit StatsUpdated(player, isWin, payout);
        emit TransactionRecorded(player, transactionId);
    }

    function updateLeaderboard(address _player, uint256 _newWinnings) private {
        bool playerFound = false;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == _player) {
                leaderboard[i].totalWinnings = _newWinnings;
                playerFound = true;
                break;
            }
        }

        if (!playerFound) {
            leaderboard.push(LeaderboardEntry(_player, _newWinnings));
        }

        // Sort leaderboard (bubble sort)
        for (uint256 i = 0; i < leaderboard.length; i++) {
            for (uint256 j = i + 1; j < leaderboard.length; j++) {
                if (leaderboard[j].totalWinnings > leaderboard[i].totalWinnings) {
                    LeaderboardEntry memory temp = leaderboard[i];
                    leaderboard[i] = leaderboard[j];
                    leaderboard[j] = temp;
                }
            }
        }

        // Keep only top 10
        if (leaderboard.length > 10) {
            leaderboard.pop();
        }

        emit LeaderboardUpdated(_player, _newWinnings);
    }

    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        return leaderboard;
    }

    function getPlayerStats(address _player) external view returns (PlayerStatsView memory) {
        PlayerStats storage stats = playerStats[_player];
        
        uint256 winRate = 0;
        uint256 avgBet = 0;
        
        if (stats.totalGames > 0) {
            winRate = (stats.successfulGuesses * 10000) / stats.totalGames; // Percentage * 100
            avgBet = stats.totalBets / stats.totalGames;
        }
        
        uint256 netProfit = 0;
        if (stats.totalWinnings >= stats.totalBets) {
            netProfit = stats.totalWinnings - stats.totalBets;
        }
        
        return PlayerStatsView({
            player: _player,
            totalWinnings: stats.totalWinnings,
            totalBets: stats.totalBets,
            successfulGuesses: stats.successfulGuesses,
            totalGames: stats.totalGames,
            winRate: winRate,
            netProfit: netProfit,
            biggestWin: stats.biggestWin,
            currentWinStreak: stats.currentWinStreak,
            maxWinStreak: stats.maxWinStreak,
            currentLoseStreak: stats.currentLoseStreak,
            maxLoseStreak: stats.maxLoseStreak,
            avgBet: avgBet,
            totalGasSpent: stats.totalGasSpent,
            favoriteNumber: stats.favoriteNumber
        });
    }

    function getPlayerTransactionHistory(address _player) external view returns (GameTransaction[] memory) {
        uint256[] memory transactionIds = playerTransactionIds[_player];
        GameTransaction[] memory transactions = new GameTransaction[](transactionIds.length);
        
        for (uint256 i = 0; i < transactionIds.length; i++) {
            transactions[i] = gameHistory[transactionIds[i]];
        }
        
        return transactions;
    }

    function getPlayerTransactionHistory(address _player, uint256 limit, uint256 offset) 
        external view returns (GameTransaction[] memory) {
        uint256[] memory transactionIds = playerTransactionIds[_player];
        
        if (offset >= transactionIds.length) {
            return new GameTransaction[](0);
        }
        
        uint256 end = offset + limit;
        if (end > transactionIds.length) {
            end = transactionIds.length;
        }
        
        uint256 length = end - offset;
        GameTransaction[] memory transactions = new GameTransaction[](length);
        
        for (uint256 i = 0; i < length; i++) {
            transactions[i] = gameHistory[transactionIds[offset + i]];
        }
        
        return transactions;
    }

    function getRecentTransactions(uint256 limit) external view returns (GameTransaction[] memory) {
        if (limit > gameHistory.length) {
            limit = gameHistory.length;
        }
        
        GameTransaction[] memory transactions = new GameTransaction[](limit);
        uint256 startIndex = gameHistory.length - limit;
        
        for (uint256 i = 0; i < limit; i++) {
            transactions[i] = gameHistory[startIndex + i];
        }
        
        return transactions;
    }

    function getTotalTransactions() external view returns (uint256) {
        return gameHistory.length;
    }

    function getPlayerTransactionCount(address _player) external view returns (uint256) {
        return playerTransactionIds[_player].length;
    }

    // Function to get number frequency for a specific player and number
    function getNumberFrequency(address _player, uint256 _number) external view returns (uint256) {
        return playerStats[_player].numberFrequency[_number];
    }

    // Function to get all number frequencies for a player (1-10)
    function getAllNumberFrequencies(address _player) external view returns (uint256[10] memory) {
        uint256[10] memory frequencies;
        for (uint256 i = 1; i <= 10; i++) {
            frequencies[i-1] = playerStats[_player].numberFrequency[i];
        }
        return frequencies;
    }
}