// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DiceGame
 * @dev Pop Ma Dice - A multiplayer dice game on Base network
 * 
 * Game Rules:
 * - Win (Pop): [5,2], [2,5], [4,3], [3,4], [6,1], [1,6], [6,5], [5,6]
 * - Lose (Krap): [2,1], [1,2], [1,1], [6,6]
 * - Continue: Any other combination
 */
contract DiceGame is ReentrancyGuard, Ownable {
    // Structs
    struct Game {
        address player;
        uint256 betAmount;
        address token;
        uint8 initialRoll1;
        uint8 initialRoll2;
        uint8 lastRoll1;
        uint8 lastRoll2;
        bool finished;
        bool won;
        uint256 winnings;
        uint256 createdAt;
    }

    struct PlayerStats {
        uint256 totalBets;
        uint256 totalWinnings;
        uint256 gamesWon;
        uint256 gamesLost;
    }

    // State variables
    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool) public supportedTokens;
    
    uint256 public gameCounter;
    uint256 public platformFeePercentage = 5; // 5% fee
    address public feeRecipient;

    // Events
    event BetPlaced(uint256 indexed gameId, address indexed player, uint256 amount, address token);
    event DiceRolled(uint256 indexed gameId, uint8 roll1, uint8 roll2, bool won);
    event GameFinished(uint256 indexed gameId, address indexed player, bool won, uint256 winnings);
    event WinningsClaimed(uint256 indexed gameId, address indexed player, uint256 amount);
    event TokenSupported(address indexed token, bool supported);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        supportedTokens[address(0)] = true; // Native ETH
    }

    /**
     * @dev Place a bet to start a game
     */
    function placeBet(uint256 amount, address token) external payable nonReentrant returns (uint256) {
        require(amount > 0, "Bet amount must be greater than 0");
        require(supportedTokens[token], "Token not supported");

        // Handle token transfer
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "Do not send ETH with token bet");
            require(
                IERC20(token).transferFrom(msg.sender, address(this), amount),
                "Token transfer failed"
            );
        }

        // Create game
        uint256 gameId = gameCounter++;
        games[gameId] = Game({
            player: msg.sender,
            betAmount: amount,
            token: token,
            initialRoll1: 0,
            initialRoll2: 0,
            lastRoll1: 0,
            lastRoll2: 0,
            finished: false,
            won: false,
            winnings: 0,
            createdAt: block.timestamp
        });

        playerStats[msg.sender].totalBets += amount;

        emit BetPlaced(gameId, msg.sender, amount, token);
        return gameId;
    }

    /**
     * @dev Roll dice for initial roll
     */
    function rollDice(uint256 gameId) external nonReentrant returns (uint8, uint8, bool) {
        Game storage game = games[gameId];
        require(game.player == msg.sender, "Not your game");
        require(!game.finished, "Game already finished");
        require(game.initialRoll1 == 0, "Already rolled");

        // Generate random rolls
        (uint8 roll1, uint8 roll2) = _generateRolls(gameId);
        game.initialRoll1 = roll1;
        game.initialRoll2 = roll2;
        game.lastRoll1 = roll1;
        game.lastRoll2 = roll2;

        // Check if game is finished
        bool isWin = _isWin(roll1, roll2);
        bool isLose = _isLose(roll1, roll2);

        if (isWin || isLose) {
            game.finished = true;
            game.won = isWin;

            if (isWin) {
                uint256 winnings = (game.betAmount * 2 * (100 - platformFeePercentage)) / 100;
                game.winnings = winnings;
                playerStats[msg.sender].gamesWon++;
                playerStats[msg.sender].totalWinnings += winnings;
            } else {
                playerStats[msg.sender].gamesLost++;
            }

            emit GameFinished(gameId, msg.sender, isWin, game.winnings);
        }

        emit DiceRolled(gameId, roll1, roll2, isWin || isLose);
        return (roll1, roll2, isWin || isLose);
    }

    /**
     * @dev Continue rolling dice
     */
    function continueRoll(uint256 gameId) external nonReentrant returns (uint8, uint8, bool) {
        Game storage game = games[gameId];
        require(game.player == msg.sender, "Not your game");
        require(!game.finished, "Game already finished");
        require(game.initialRoll1 != 0, "Must roll first");

        // Generate random rolls
        (uint8 roll1, uint8 roll2) = _generateRolls(gameId);
        game.lastRoll1 = roll1;
        game.lastRoll2 = roll2;

        // Check if game is finished
        bool matchesInitial = (roll1 == game.initialRoll1 && roll2 == game.initialRoll2) ||
                             (roll1 == game.initialRoll2 && roll2 == game.initialRoll1);
        bool isLose = _isLose(roll1, roll2);

        if (matchesInitial || isLose) {
            game.finished = true;
            game.won = matchesInitial;

            if (matchesInitial) {
                uint256 winnings = (game.betAmount * 2 * (100 - platformFeePercentage)) / 100;
                game.winnings = winnings;
                playerStats[msg.sender].gamesWon++;
                playerStats[msg.sender].totalWinnings += winnings;
            } else {
                playerStats[msg.sender].gamesLost++;
            }

            emit GameFinished(gameId, msg.sender, matchesInitial, game.winnings);
        }

        emit DiceRolled(gameId, roll1, roll2, matchesInitial || isLose);
        return (roll1, roll2, matchesInitial || isLose);
    }

    /**
     * @dev Claim winnings
     */
    function claimWinnings(uint256 gameId) external nonReentrant returns (uint256) {
        Game storage game = games[gameId];
        require(game.player == msg.sender, "Not your game");
        require(game.finished, "Game not finished");
        require(game.won, "Game not won");
        require(game.winnings > 0, "No winnings to claim");

        uint256 amount = game.winnings;
        game.winnings = 0;

        // Transfer winnings
        if (game.token == address(0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            require(IERC20(game.token).transfer(msg.sender, amount), "Token transfer failed");
        }

        emit WinningsClaimed(gameId, msg.sender, amount);
        return amount;
    }

    /**
     * @dev Get game state
     */
    function getGameState(uint256 gameId)
        external
        view
        returns (
            address player,
            uint256 betAmount,
            address token,
            uint8 initialRoll1,
            uint8 initialRoll2,
            uint8 lastRoll1,
            uint8 lastRoll2,
            bool finished,
            bool won,
            uint256 winnings
        )
    {
        Game storage game = games[gameId];
        return (
            game.player,
            game.betAmount,
            game.token,
            game.initialRoll1,
            game.initialRoll2,
            game.lastRoll1,
            game.lastRoll2,
            game.finished,
            game.won,
            game.winnings
        );
    }

    /**
     * @dev Get player stats
     */
    function getPlayerStats(address player)
        external
        view
        returns (
            uint256 totalBets,
            uint256 totalWinnings,
            uint256 gamesWon,
            uint256 gamesLost
        )
    {
        PlayerStats storage stats = playerStats[player];
        return (stats.totalBets, stats.totalWinnings, stats.gamesWon, stats.gamesLost);
    }

    /**
     * @dev Check if roll is a win
     */
    function _isWin(uint8 roll1, uint8 roll2) internal pure returns (bool) {
        return (roll1 == 5 && roll2 == 2) ||
               (roll1 == 2 && roll2 == 5) ||
               (roll1 == 4 && roll2 == 3) ||
               (roll1 == 3 && roll2 == 4) ||
               (roll1 == 6 && roll2 == 1) ||
               (roll1 == 1 && roll2 == 6) ||
               (roll1 == 6 && roll2 == 5) ||
               (roll1 == 5 && roll2 == 6);
    }

    /**
     * @dev Check if roll is a loss
     */
    function _isLose(uint8 roll1, uint8 roll2) internal pure returns (bool) {
        return (roll1 == 2 && roll2 == 1) ||
               (roll1 == 1 && roll2 == 2) ||
               (roll1 == 1 && roll2 == 1) ||
               (roll1 == 6 && roll2 == 6);
    }

    /**
     * @dev Generate random rolls (simplified - use Chainlink VRF in production)
     */
    function _generateRolls(uint256 gameId) internal view returns (uint8, uint8) {
        uint256 seed = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, gameId, msg.sender))
        );
        uint8 roll1 = (uint8(seed % 6) + 1);
        uint8 roll2 = (uint8((seed / 6) % 6) + 1);
        return (roll1, roll2);
    }

    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit TokenSupported(token, true);
    }

    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenSupported(token, false);
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = feeRecipient.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}

