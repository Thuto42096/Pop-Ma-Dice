// Smart contract configuration for Pop Ma Dice on Base network
import { parseAbi, encodeFunctionData, parseEther } from 'viem';

// Base network contract addresses
export const DICE_GAME_ADDRESS = (process.env.NEXT_PUBLIC_DICE_GAME_CONTRACT ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

// Dice Game Contract ABI
export const DICE_GAME_ABI = parseAbi([
  'function placeBet(uint256 amount, address token) payable returns (uint256 gameId)',
  'function rollDice(uint256 gameId) returns (uint8 roll1, uint8 roll2, bool won)',
  'function continueRoll(uint256 gameId) returns (uint8 roll1, uint8 roll2, bool won)',
  'function claimWinnings(uint256 gameId) returns (uint256 amount)',
  'function getGameState(uint256 gameId) view returns (address player, uint256 betAmount, address token, uint8 initialRoll1, uint8 initialRoll2, uint8 lastRoll1, uint8 lastRoll2, bool finished, bool won, uint256 winnings)',
  'function getPlayerStats(address player) view returns (uint256 totalBets, uint256 totalWinnings, uint256 gamesWon, uint256 gamesLost)',
  'event BetPlaced(address player, uint256 gameId, uint256 amount, address token)',
  'event GameFinished(address player, uint256 gameId, bool won, uint256 winnings)',
]);

// ERC20 ABI for token approvals
export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
]);

// Game state types
export interface GameState {
  player: `0x${string}`;
  betAmount: bigint;
  token: `0x${string}`;
  initialRoll: [number, number];
  lastRoll: [number, number];
  finished: boolean;
  won: boolean;
  winnings: bigint;
}

export interface PlayerStats {
  totalBets: bigint;
  totalWinnings: bigint;
  gamesWon: bigint;
  gamesLost: bigint;
}

// Helper function to create bet transaction
export function createBetTransaction(
  betAmount: string,
  tokenAddress: `0x${string}`,
  isNative: boolean
) {
  const calls: Array<{
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
  }> = [];

  // If using USDC, need to approve first
  if (!isNative && tokenAddress === USDC_ADDRESS) {
    calls.push({
      to: tokenAddress,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DICE_GAME_ADDRESS, parseEther(betAmount)],
      }),
    });
  }

  // Place bet transaction
  calls.push({
    to: DICE_GAME_ADDRESS,
    data: encodeFunctionData({
      abi: DICE_GAME_ABI,
      functionName: 'placeBet',
      args: [parseEther(betAmount), tokenAddress],
    }),
    value: isNative ? parseEther(betAmount) : BigInt(0),
  });

  return calls;
}

