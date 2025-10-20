// Smart contract configuration for Pop Ma Dice on Base network
import { parseAbi } from 'viem';

// Base network contract addresses
export const DICE_GAME_ADDRESS = (process.env.NEXT_PUBLIC_DICE_GAME_CONTRACT || 
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

// Dice Game Contract ABI
export const DICE_GAME_ABI = parseAbi([
  'function placeBet(uint256 amount, address token) payable returns (uint256 gameId)',
  'function rollDice(uint256 gameId) returns (uint8[2] rolls, bool won)',
  'function continueRoll(uint256 gameId) returns (uint8[2] rolls, bool won)',
  'function claimWinnings(uint256 gameId) returns (uint256 amount)',
  'function getGameState(uint256 gameId) view returns (tuple(address player, uint256 betAmount, address token, uint8[2] initialRoll, uint8[2] lastRoll, bool finished, bool won, uint256 winnings))',
  'function getPlayerStats(address player) view returns (tuple(uint256 totalBets, uint256 totalWinnings, uint256 gamesWon, uint256 gamesLost))',
  'event BetPlaced(indexed address player, uint256 indexed gameId, uint256 amount, address token)',
  'event GameFinished(indexed address player, uint256 indexed gameId, bool won, uint256 winnings)',
]);

// ERC20 ABI for token approvals
export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
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
  const calls = [];

  // If using USDC, need to approve first
  if (!isNative && tokenAddress !== USDC_ADDRESS) {
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
    value: isNative ? parseEther(betAmount) : '0',
  });

  return calls;
}

// Helper to encode function data
function encodeFunctionData({
  abi,
  functionName,
  args,
}: {
  abi: any;
  functionName: string;
  args: any[];
}): `0x${string}` {
  // This is a placeholder - in production you'd use viem's encodeFunctionData
  return '0x' as `0x${string}`;
}

import { parseEther } from 'viem';

