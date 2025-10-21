// Claim Winnings Functionality for Pop Ma Dice
import { getDatabase } from './db-client';
import { GameResult } from './game-types';
import {
  claimWinningsViaContract,
  estimateClaimWinningsGas,
  getGameStateFromContract,
  isWinningsClaimed,
  watchClaimTransaction,
} from './smart-contract-integration';

export interface ClaimWinningsRequest {
  playerId: string;
  gameId: string;
  address: `0x${string}`;
}

export interface ClaimWinningsResponse {
  success: boolean;
  gameId: string;
  playerId: string;
  winningsAmount: string;
  txHash?: string;
  message: string;
  timestamp: Date;
}

export interface PlayerWinnings {
  gameId: string;
  amount: bigint;
  claimed: boolean;
  claimedAt?: Date;
  txHash?: string;
}

export interface PlayerClaimStatus {
  playerId: string;
  totalWinnings: string;
  claimedWinnings: string;
  unclaimedWinnings: string;
  pendingClaims: PlayerWinnings[];
}

/**
 * Get all unclaimed winnings for a player
 */
export async function getUnclaimedWinnings(playerId: string): Promise<PlayerWinnings[]> {
  try {
    const db = await getDatabase();

    // Get all game results where player won
    const results = await db.getGameResults(playerId, 1000);

    return results
      .filter((result) => {
        // Only include games where player won
        const playerWon =
          (result.player1Id === playerId && result.player1Winnings > BigInt(0)) ||
          (result.player2Id === playerId && (result.player2Winnings ?? BigInt(0)) > BigInt(0));
        return playerWon;
      })
      .map((result) => {
        const amount = result.player1Id === playerId ? result.player1Winnings : (result.player2Winnings ?? BigInt(0));
        return {
          gameId: result.gameId,
          amount,
          claimed: !!result.txHash,
          claimedAt: result.txHash ? result.timestamp : undefined,
          txHash: result.txHash,
        };
      });
  } catch (error) {
    console.error('Error getting unclaimed winnings:', error);
    throw error;
  }
}

/**
 * Get claim status for a player
 */
export async function getClaimStatus(playerId: string): Promise<PlayerClaimStatus> {
  try {
    const db = await getDatabase();
    
    // Get player stats
    const player = await db.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Get unclaimed winnings
    const unclaimedWinnings = await getUnclaimedWinnings(playerId);
    
    const totalUnclaimed = unclaimedWinnings.reduce(
      (sum, w) => sum + w.amount,
      BigInt(0)
    );

    const claimedAmount = player.totalWinnings - totalUnclaimed;

    return {
      playerId,
      totalWinnings: player.totalWinnings.toString(),
      claimedWinnings: claimedAmount.toString(),
      unclaimedWinnings: totalUnclaimed.toString(),
      pendingClaims: unclaimedWinnings.filter(w => !w.claimed),
    };
  } catch (error) {
    console.error('Error getting claim status:', error);
    throw error;
  }
}

/**
 * Claim winnings for a specific game
 */
export async function claimGameWinnings(
  request: ClaimWinningsRequest
): Promise<ClaimWinningsResponse> {
  try {
    const { playerId, gameId, address } = request;
    const db = await getDatabase();

    // Get all game results for player and find the matching game
    const results = await db.getGameResults(playerId, 1000);
    const gameResult = results.find((r) => r.gameId === gameId);

    if (!gameResult) {
      throw new Error('Game not found');
    }

    // Determine if player won and get winnings amount
    let winningsAmount = BigInt(0);
    let isWinner = false;

    if (gameResult.player1Id === playerId && gameResult.player1Winnings > BigInt(0)) {
      winningsAmount = gameResult.player1Winnings;
      isWinner = true;
    } else if (gameResult.player2Id === playerId && (gameResult.player2Winnings ?? BigInt(0)) > BigInt(0)) {
      winningsAmount = gameResult.player2Winnings ?? BigInt(0);
      isWinner = true;
    }

    if (!isWinner || winningsAmount === BigInt(0)) {
      throw new Error('No winnings to claim for this game');
    }

    // Check if already claimed
    if (gameResult.txHash) {
      throw new Error('Winnings already claimed for this game');
    }

    // Claim via smart contract
    const contractResult = await claimWinningsViaContract({
      gameId,
      playerAddress: address,
      winningsAmount,
      tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    });

    if (!contractResult.success) {
      throw new Error(contractResult.error || 'Failed to claim winnings via contract');
    }

    const txHash = contractResult.txHash;

    // Watch for transaction confirmation
    await watchClaimTransaction(txHash);

    return {
      success: true,
      gameId,
      playerId,
      winningsAmount: winningsAmount.toString(),
      txHash,
      message: `Successfully claimed ${winningsAmount.toString()} winnings. Transaction: ${txHash}`,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error claiming winnings:', error);
    throw error;
  }
}

/**
 * Claim all unclaimed winnings for a player
 */
export async function claimAllWinnings(
  playerId: string,
  address: `0x${string}`
): Promise<{
  success: boolean;
  totalClaimed: string;
  gamesClaimed: number;
  claims: ClaimWinningsResponse[];
  message: string;
}> {
  try {
    const db = await getDatabase();
    const unclaimedWinnings = await getUnclaimedWinnings(playerId);

    if (unclaimedWinnings.length === 0) {
      return {
        success: true,
        totalClaimed: '0',
        gamesClaimed: 0,
        claims: [],
        message: 'No unclaimed winnings',
      };
    }

    const claims: ClaimWinningsResponse[] = [];
    let totalClaimed = BigInt(0);

    for (const winning of unclaimedWinnings) {
      if (!winning.claimed) {
        try {
          const claim = await claimGameWinnings({
            playerId,
            gameId: winning.gameId,
            address,
          });
          claims.push(claim);
          totalClaimed += BigInt(winning.amount);
        } catch (error) {
          console.error(`Failed to claim winnings for game ${winning.gameId}:`, error);
        }
      }
    }

    return {
      success: true,
      totalClaimed: totalClaimed.toString(),
      gamesClaimed: claims.length,
      claims,
      message: `Successfully claimed ${claims.length} games with total winnings of ${totalClaimed.toString()}`,
    };
  } catch (error) {
    console.error('Error claiming all winnings:', error);
    throw error;
  }
}

/**
 * Get winnings history for a player
 */
export async function getWinningsHistory(
  playerId: string,
  limit: number = 50
): Promise<{
  playerId: string;
  totalWinnings: string;
  claimedCount: number;
  unclaimedCount: number;
  history: Array<{
    gameId: string;
    amount: string;
    claimed: boolean;
    claimedAt?: Date;
    txHash?: string;
  }>;
}> {
  try {
    const db = await getDatabase();
    const player = await db.getPlayer(playerId);

    if (!player) {
      throw new Error('Player not found');
    }

    const allResults = await db.getGameResults(playerId, limit);

    const history = allResults
      .filter((result) => {
        // Only include games where player won
        const playerWon =
          (result.player1Id === playerId && result.player1Winnings > BigInt(0)) ||
          (result.player2Id === playerId && (result.player2Winnings ?? BigInt(0)) > BigInt(0));
        return playerWon;
      })
      .map((result) => {
        const amount = result.player1Id === playerId ? result.player1Winnings : (result.player2Winnings ?? BigInt(0));
        return {
          gameId: result.gameId,
          amount: amount.toString(),
          claimed: !!result.txHash,
          claimedAt: result.txHash ? result.timestamp : undefined,
          txHash: result.txHash,
        };
      });

    const claimedCount = history.filter((h) => h.claimed).length;
    const unclaimedCount = history.filter((h) => !h.claimed).length;

    return {
      playerId,
      totalWinnings: player.totalWinnings.toString(),
      claimedCount,
      unclaimedCount,
      history,
    };
  } catch (error) {
    console.error('Error getting winnings history:', error);
    throw error;
  }
}

/**
 * Generate mock transaction hash for testing
 */
function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Validate claim request
 */
export function validateClaimRequest(request: ClaimWinningsRequest): {
  valid: boolean;
  error?: string;
} {
  if (!request.playerId) {
    return { valid: false, error: 'Player ID is required' };
  }

  if (!request.gameId) {
    return { valid: false, error: 'Game ID is required' };
  }

  if (!request.address || !request.address.startsWith('0x')) {
    return { valid: false, error: 'Valid Ethereum address is required' };
  }

  return { valid: true };
}

