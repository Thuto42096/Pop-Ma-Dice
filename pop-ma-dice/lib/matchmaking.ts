// Matchmaking service for pairing players

import { GameEngine } from './game-engine';
import { GameSession, GameQueue } from './game-types';
import { getDatabase } from './db-client';

export class MatchmakingService {
  /**
   * Add player to matchmaking queue
   */
  static async joinQueue(
    playerId: string,
    address: `0x${string}`,
    betAmount: bigint,
    mode: 'pvp' | 'pve' = 'pvp'
  ): Promise<GameSession | null> {
    const db = await getDatabase();

    // Check if player already in queue
    const existingQueue = await db.getQueueEntries(1000);
    const alreadyQueued = existingQueue.find((q) => q.playerId === playerId);
    if (alreadyQueued) {
      throw new Error('Player already in queue');
    }

    // Add to queue
    const queueEntry: GameQueue = {
      playerId,
      address,
      betAmount,
      joinedAt: new Date(),
      mode,
    };

    await db.addToQueue(queueEntry);

    // Try to find a match
    if (mode === 'pvp') {
      return this.findMatch(playerId, address, betAmount);
    }

    return null;
  }

  /**
   * Find a match for a player
   */
  private static async findMatch(
    playerId: string,
    address: `0x${string}`,
    betAmount: bigint
  ): Promise<GameSession | null> {
    const db = await getDatabase();
    const queueEntries = await db.getQueueEntries(1000);

    // Find a player with similar bet amount (within 10%)
    const tolerance = (betAmount * BigInt(10)) / BigInt(100);
    const potentialMatch = queueEntries.find(
      (q) =>
        q.playerId !== playerId &&
        q.betAmount >= betAmount - tolerance &&
        q.betAmount <= betAmount + tolerance
    );

    if (!potentialMatch) {
      return null; // No match found yet
    }

    // Create game session
    const game = GameEngine.createGameSession(playerId, address, betAmount, 'pvp');
    const gameWithPlayer2 = GameEngine.addPlayer2(
      game,
      potentialMatch.playerId,
      potentialMatch.address,
      potentialMatch.betAmount
    );

    // Save game session
    await db.createGameSession(gameWithPlayer2);

    // Remove both players from queue
    await db.removeFromQueue(playerId);
    await db.removeFromQueue(potentialMatch.playerId);

    return gameWithPlayer2;
  }

  /**
   * Leave matchmaking queue
   */
  static async leaveQueue(playerId: string): Promise<void> {
    const db = getDatabase();
    await db.removeFromQueue(playerId);
  }

  /**
   * Get queue status
   */
  static async getQueueStatus(): Promise<{
    totalPlayers: number;
    averageWaitTime: number;
  }> {
    const db = await getDatabase();
    const queueEntries = await db.getQueueEntries(1000);

    if (queueEntries.length === 0) {
      return { totalPlayers: 0, averageWaitTime: 0 };
    }

    const now = new Date();
    const waitTimes = queueEntries.map(
      (q) => (now.getTime() - q.joinedAt.getTime()) / 1000
    );
    const averageWaitTime =
      waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;

    return {
      totalPlayers: queueEntries.length,
      averageWaitTime,
    };
  }

  /**
   * Clean up stale queue entries (older than 5 minutes)
   */
  static async cleanupStaleQueue(): Promise<number> {
    const db = await getDatabase();
    const queueEntries = await db.getQueueEntries(1000);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    let removed = 0;
    for (const entry of queueEntries) {
      if (entry.joinedAt < fiveMinutesAgo) {
        await db.removeFromQueue(entry.playerId);
        removed++;
      }
    }

    return removed;
  }
}

