// Game types and interfaces for multiplayer dice game

export type GameStatus = 'waiting' | 'active' | 'finished' | 'cancelled';
export type GameOutcome = 'win' | 'lose' | 'draw' | null;
export type GameMode = 'pvp' | 'pve' | 'tournament';

export interface Player {
  id: string; // wallet address
  username: string;
  walletAddress: `0x${string}`;
  totalWinnings: bigint;
  totalBets: bigint;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  joinedAt: Date;
  lastActive: Date;
}

export interface GameSession {
  id: string; // unique game ID
  mode: GameMode;
  status: GameStatus;
  player1: {
    id: string;
    address: `0x${string}`;
    betAmount: bigint;
    rolls: number[][];
    outcome: GameOutcome;
  };
  player2?: {
    id: string;
    address: `0x${string}`;
    betAmount: bigint;
    rolls: number[][];
    outcome: GameOutcome;
  };
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  winner?: string; // player ID
  totalPot: bigint;
  txHash?: string; // blockchain transaction hash
}

export interface GameResult {
  gameId: string;
  player1Id: string;
  player2Id?: string;
  player1Outcome: GameOutcome;
  player2Outcome?: GameOutcome;
  winner?: string;
  player1Winnings: bigint;
  player2Winnings?: bigint;
  txHash: string;
  timestamp: Date;
}

export interface Leaderboard {
  rank: number;
  playerId: string;
  username: string;
  totalWinnings: bigint;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
}

export interface GameQueue {
  playerId: string;
  address: `0x${string}`;
  betAmount: bigint;
  joinedAt: Date;
  mode: GameMode;
}

// Game rules
export const GAME_RULES = {
  POP_COMBOS: [
    [5, 2],
    [2, 5],
    [4, 3],
    [3, 4],
    [6, 1],
    [1, 6],
    [6, 5],
    [5, 6],
  ],
  KRAP_COMBOS: [
    [2, 1],
    [1, 2],
    [1, 1],
    [6, 6],
  ],
  WIN_TOTAL: 5,
  LOSE_TOTAL: 7,
  MAX_ROUNDS: 10,
  MIN_BET: BigInt('1000000000000000'), // 0.001 ETH
  MAX_BET: BigInt('1000000000000000000'), // 1 ETH
};

export function checkPop(roll: [number, number]): boolean {
  return GAME_RULES.POP_COMBOS.some(
    ([a, b]) => a === roll[0] && b === roll[1]
  );
}

export function checkKrap(roll: [number, number]): boolean {
  return GAME_RULES.KRAP_COMBOS.some(
    ([a, b]) => a === roll[0] && b === roll[1]
  );
}

export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

export function determineOutcome(roll: [number, number]): GameOutcome {
  if (checkPop(roll)) return 'win';
  if (checkKrap(roll)) return 'lose';
  return null;
}

