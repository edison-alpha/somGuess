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
export const GAME_CONTRACT_ADDRESS = '0xdB7E2Aa64304C52F86837438B49f3D7E3bE297f3';

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
				"internalType": "uint256[3]",
				"name": "numbers",
				"type": "uint256[3]"
			}
		],
		"name": "NumbersGenerated",
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
				"internalType": "uint256",
				"name": "totalWinnings",
				"type": "uint256"
			}
		],
		"name": "LeaderboardUpdated",
		"type": "event"
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
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
				"internalType": "struct NumberGuess.LeaderboardEntry[]",
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
					}
				],
				"internalType": "struct NumberGuess.PlayerStats",
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
			}
		],
		"name": "playerStats",
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
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

// Transaction History Contract Configuration
export const HISTORY_CONTRACT_ADDRESS = '0x130757B50f0B3A3880D39726EED997ac1ADcCf56';
export const HISTORY_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_gameContract",
				"type": "address"
			}
		],
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
				"name": "totalGamesPlayed",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalWins",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalBetAmount",
				"type": "uint256"
			}
		],
		"name": "GameStatsUpdated",
		"type": "event"
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
				"name": "_betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256[3]",
				"name": "_generatedNumbers",
				"type": "uint256[3]"
			},
			{
				"internalType": "uint256",
				"name": "_correctNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_userGuess",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_payout",
				"type": "uint256"
			}
		],
		"name": "recordTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "transactionId",
				"type": "uint256"
			},
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
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			}
		],
		"name": "TransactionRecorded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newGameContract",
				"type": "address"
			}
		],
		"name": "updateGameContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
				"internalType": "address",
				"name": "_player",
				"type": "address"
			}
		],
		"name": "getPlayerGameStats",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "totalGamesPlayed",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalWins",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalBetAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct TransactionHistory.PlayerGameStats",
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
		"name": "getPlayerTransactions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "transactionId",
						"type": "uint256"
					},
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
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isWin",
						"type": "bool"
					}
				],
				"internalType": "struct TransactionHistory.Transaction[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllTransactions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "transactionId",
						"type": "uint256"
					},
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
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isWin",
						"type": "bool"
					}
				],
				"internalType": "struct TransactionHistory.Transaction[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;