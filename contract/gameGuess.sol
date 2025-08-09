// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NumberGuess {
    address public owner;
    address public gameStatsContract;
    
    bool private lock; // Reentrancy lock

    // Structure to store game state
    struct GameState {
        uint256[3] numbers;
        uint256 correctNumber;
        bool isActive;
        uint256 timestamp;
    }

    mapping(address => GameState) private gameStates;
    
    event GuessResult(
        address indexed player, 
        uint256 betAmount, 
        uint256[3] generatedNumbers,
        uint256 correctNumber,
        uint256 userGuess,
        uint256 payout
    );
    
    event NumbersGenerated(address indexed player, uint256[3] numbers);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier noReentrancy() {
        require(!lock, "Reentrancy is not allowed");
        lock = true;
        _;
        lock = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Generate 3 unique random numbers between 1 and 10
    function generateNumbers() external returns (uint256[3] memory numbers) {
        uint256[] memory temp = new uint256[](10);
        uint256 count = 0;
        uint256 nonce = 0;
        
        // Generate 3 unique numbers
        while (count < 3) {
            uint256 num = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                block.number,
                nonce
            ))) % 10 + 1;
            
            if (temp[num-1] == 0) {
                temp[num-1] = num;
                numbers[count] = num;
                count++;
            }
            nonce++;
        }
        
        // Choose one as correct answer
        uint256 correctIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            block.number,
            nonce + 999
        ))) % 3;
        
        // Store game state
        gameStates[msg.sender] = GameState(
            numbers, 
            numbers[correctIndex], 
            true,
            block.timestamp
        );
        
        emit NumbersGenerated(msg.sender, numbers);
        return numbers;
    }

    function guessNumber(uint256 _guess) external payable noReentrancy {
        uint256 gasStart = gasleft();
        
        require(gameStates[msg.sender].isActive, "No active game - generate numbers first");
        require(
            msg.value == 0.01 ether || 
            msg.value == 0.05 ether || 
            msg.value == 0.1 ether || 
            msg.value == 0.25 ether || 
            msg.value == 0.5 ether || 
            msg.value == 1 ether,
            "Invalid bet amount"
        );

        require(address(this).balance >= msg.value * 2, "Contract balance too low");
        
        // Validate guess is one of the generated numbers
        bool validGuess = false;
        uint256[3] memory numbers = gameStates[msg.sender].numbers;
        for (uint256 i = 0; i < 3; i++) {
            if (_guess == numbers[i]) {
                validGuess = true;
                break;
            }
        }
        require(validGuess, "Guess must be one of the generated numbers");

        uint256 correctNumber = gameStates[msg.sender].correctNumber;
        
        uint256 payout = 0;
        if (_guess == correctNumber) {
            payout = msg.value * 2;
            payable(msg.sender).transfer(payout);
        }

        // Reset game state
        gameStates[msg.sender].isActive = false;

        // Calculate gas used
        uint256 gasUsed = gasStart - gasleft();
        
        // Record game result in stats contract if available
        if (gameStatsContract != address(0)) {
            try this.recordToStats(
                msg.sender,
                msg.value,
                numbers,
                correctNumber,
                _guess,
                payout,
                gasUsed
            ) {} catch {}
        }

        emit GuessResult(msg.sender, msg.value, numbers, correctNumber, _guess, payout);
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }

    function getCurrentGameNumbers() external view returns (uint256[3] memory numbers, bool isActive) {
        GameState memory gameState = gameStates[msg.sender];
        return (gameState.numbers, gameState.isActive);
    }
    
    // Helper function to check if player has active game
    function hasActiveGame() external view returns (bool) {
        return gameStates[msg.sender].isActive;
    }
    
    // Helper function to get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to set stats contract address
    function setStatsContract(address _statsContract) external onlyOwner {
        gameStatsContract = _statsContract;
    }

    // Function to record to stats contract
    function recordToStats(
        address player,
        uint256 betAmount,
        uint256[3] memory generatedNumbers,
        uint256 correctNumber,
        uint256 userGuess,
        uint256 payout,
        uint256 gasUsed
    ) external {
        require(msg.sender == address(this), "Only contract can call this");
        
        (bool success, ) = gameStatsContract.call(
            abi.encodeWithSignature(
                "recordGameResult(address,uint256,uint256[3],uint256,uint256,uint256,uint256)",
                player,
                betAmount,
                generatedNumbers,
                correctNumber,
                userGuess,
                payout,
                gasUsed
            )
        );
        
        // If stats contract call fails, we don't revert the main transaction
        if (!success) {
            // Could emit an event for debugging
        }
    }
}