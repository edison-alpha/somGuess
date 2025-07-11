import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

// Somnia Testnet Configuration
export const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.somnia.network' },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'STT Guess Game',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http('https://dream-rpc.somnia.network', {
      batch: true,
      retryCount: 3,
      retryDelay: 500,
    }),
  },
  pollingInterval: 500, // Poll every 500ms for faster updates
});

// Game Contract Configuration  
export const GAME_CONTRACT_ADDRESS = '0x9Df1FF687feD5993705022C6BCE82bbf7f5E7729';

export const GAME_CONTRACT_ABI = [
	{
		"inputs": [],
		"name": "generateNumbers",
		"outputs": [
			{
				"internalType": "uint256[3]",
				"name": "numbers",
				"type": "uint256[3]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_guess",
				"type": "uint256"
			}
		],
		"name": "guessNumber",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256[3]",
				"name": "generatedNumbers",
				"type": "uint256[3]"
			},
			{
				"internalType": "uint256",
				"name": "correctNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "userGuess",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "gasUsed",
				"type": "uint256"
			}
		],
		"name": "recordToStats",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256[3]",
				"name": "generatedNumbers",
				"type": "uint256[3]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "correctNumber",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "userGuess",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "GuessResult",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256[3]",
				"name": "numbers",
				"type": "uint256[3]"
			}
		],
		"name": "NumbersGenerated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_statsContract",
				"type": "address"
			}
		],
		"name": "setStatsContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "gameStatsContract",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentGameNumbers",
		"outputs": [
			{
				"internalType": "uint256[3]",
				"name": "numbers",
				"type": "uint256[3]"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "hasActiveGame",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

// Management/Stats/Leaderboard/History Contract Configuration
export const MANAGEMENT_CONTRACT_ADDRESS = '0x38bB2473481017aD0D878fb4a8cb706dbF93e41D';
export const MANAGEMENT_CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalWinnings",
				"type": "uint256"
			}
		],
		"name": "LeaderboardUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "StatsUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "transactionId",
				"type": "uint256"
			}
		],
		"name": "TransactionRecorded",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "gameContract",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "gameHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "correctNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "userGuess",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "gasUsed",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getAllNumberFrequencies",
		"outputs": [
			{
				"internalType": "uint256[10]",
				"name": "",
				"type": "uint256[10]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLeaderboard",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "totalWinnings",
						"type": "uint256"
					}
				],
				"internalType": "struct GameStats.LeaderboardEntry[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "getNumberFrequency",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getPlayerStats",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "totalWinnings",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalBets",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "successfulGuesses",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalGames",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "winRate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "netProfit",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "biggestWin",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentWinStreak",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxWinStreak",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentLoseStreak",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxLoseStreak",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "avgBet",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalGasSpent",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "favoriteNumber",
						"type": "uint256"
					}
				],
				"internalType": "struct GameStats.PlayerStatsView",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getPlayerTransactionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "limit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "offset",
				"type": "uint256"
			}
		],
		"name": "getPlayerTransactionHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "betAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256[3]",
						"name": "generatedNumbers",
						"type": "uint256[3]"
					},
					{
						"internalType": "uint256",
						"name": "correctNumber",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "userGuess",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "payout",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "gasUsed",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isWin",
						"type": "bool"
					}
				],
				"internalType": "struct GameStats.GameTransaction[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getPlayerTransactionHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "betAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256[3]",
						"name": "generatedNumbers",
						"type": "uint256[3]"
					},
					{
						"internalType": "uint256",
						"name": "correctNumber",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "userGuess",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "payout",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "gasUsed",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isWin",
						"type": "bool"
					}
				],
				"internalType": "struct GameStats.GameTransaction[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "limit",
				"type": "uint256"
			}
		],
		"name": "getRecentTransactions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "betAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256[3]",
						"name": "generatedNumbers",
						"type": "uint256[3]"
					},
					{
						"internalType": "uint256",
						"name": "correctNumber",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "userGuess",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "payout",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "gasUsed",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isWin",
						"type": "bool"
					}
				],
				"internalType": "struct GameStats.GameTransaction[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalTransactions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "leaderboard",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalWinnings",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "playerTransactionIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256[3]",
				"name": "generatedNumbers",
				"type": "uint256[3]"
			},
			{
				"internalType": "uint256",
				"name": "correctNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "userGuess",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "gasUsed",
				"type": "uint256"
			}
		],
		"name": "recordGameResult",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_gameContract",
				"type": "address"
			}
		],
		"name": "setGameContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const;