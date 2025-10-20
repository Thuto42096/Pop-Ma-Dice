// Database client for managing game data
// Supports both PostgreSQL and MongoDB

import { GameSession, Player, GameResult, GameQueue } from './game-types';

export interface IGameDatabase {
  // Player operations
  createPlayer(player: Player): Promise<Player>;
  getPlayer(id: string): Promise<Player | null>;
  getPlayerByAddress(address: `0x${string}`): Promise<Player | null>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player>;
  getLeaderboard(limit: number): Promise<Player[]>;

  // Game session operations
  createGameSession(session: GameSession): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | null>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession>;
  finishGameSession(id: string, winner?: string): Promise<GameSession>;

  // Game result operations
  createGameResult(result: GameResult): Promise<GameResult>;
  getGameResults(playerId: string, limit: number): Promise<GameResult[]>;

  // Queue operations
  addToQueue(queueEntry: GameQueue): Promise<GameQueue>;
  removeFromQueue(playerId: string): Promise<void>;
  getQueueEntries(limit: number): Promise<GameQueue[]>;
  clearQueue(): Promise<void>;
}

/**
 * In-memory database implementation for development
 * Replace with actual PostgreSQL or MongoDB client in production
 */
export class InMemoryGameDatabase implements IGameDatabase {
  private players = new Map<string, Player>();
  private gameSessions = new Map<string, GameSession>();
  private gameResults: GameResult[] = [];
  private gameQueue: GameQueue[] = [];

  async createPlayer(player: Player): Promise<Player> {
    this.players.set(player.id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | null> {
    return this.players.get(id) || null;
  }

  async getPlayerByAddress(address: `0x${string}`): Promise<Player | null> {
    for (const player of this.players.values()) {
      if (player.walletAddress.toLowerCase() === address.toLowerCase()) {
        return player;
      }
    }
    return null;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error('Player not found');
    const updated = { ...player, ...updates };
    this.players.set(id, updated);
    return updated;
  }

  async getLeaderboard(limit: number): Promise<Player[]> {
    return Array.from(this.players.values())
      .sort((a, b) => Number(b.totalWinnings - a.totalWinnings))
      .slice(0, limit);
  }

  async createGameSession(session: GameSession): Promise<GameSession> {
    this.gameSessions.set(session.id, session);
    return session;
  }

  async getGameSession(id: string): Promise<GameSession | null> {
    return this.gameSessions.get(id) || null;
  }

  async updateGameSession(
    id: string,
    updates: Partial<GameSession>
  ): Promise<GameSession> {
    const session = this.gameSessions.get(id);
    if (!session) throw new Error('Game session not found');
    const updated = { ...session, ...updates };
    this.gameSessions.set(id, updated);
    return updated;
  }

  async finishGameSession(
    id: string,
    winner?: string
  ): Promise<GameSession> {
    const session = this.gameSessions.get(id);
    if (!session) throw new Error('Game session not found');
    const updated = {
      ...session,
      status: 'finished' as const,
      finishedAt: new Date(),
      winner,
    };
    this.gameSessions.set(id, updated);
    return updated;
  }

  async createGameResult(result: GameResult): Promise<GameResult> {
    this.gameResults.push(result);
    return result;
  }

  async getGameResults(playerId: string, limit: number): Promise<GameResult[]> {
    return this.gameResults
      .filter(
        (r) => r.player1Id === playerId || r.player2Id === playerId
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async addToQueue(queueEntry: GameQueue): Promise<GameQueue> {
    this.gameQueue.push(queueEntry);
    return queueEntry;
  }

  async removeFromQueue(playerId: string): Promise<void> {
    this.gameQueue = this.gameQueue.filter((q) => q.playerId !== playerId);
  }

  async getQueueEntries(limit: number): Promise<GameQueue[]> {
    return this.gameQueue.slice(0, limit);
  }

  async clearQueue(): Promise<void> {
    this.gameQueue = [];
  }
}

// Singleton instance
let dbInstance: IGameDatabase | null = null;

export function getDatabase(): IGameDatabase {
  if (!dbInstance) {
    // In production, initialize with PostgreSQL or MongoDB client
    dbInstance = new InMemoryGameDatabase();
  }
  return dbInstance;
}

export function setDatabase(db: IGameDatabase): void {
  dbInstance = db;
}

