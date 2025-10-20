// PostgreSQL database client implementation

import { Pool, QueryResult } from 'pg';
import { IGameDatabase } from './db-client';
import { GameSession, Player, GameResult, GameQueue } from './game-types';

export class PostgresGameDatabase implements IGameDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL connection successful');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // Player operations
  async createPlayer(player: Player): Promise<Player> {
    const query = `
      INSERT INTO players (
        id, wallet_address, username, total_winnings, total_bets,
        games_won, games_lost, games_drawn, joined_at, last_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const result = await this.pool.query(query, [
      player.id,
      player.walletAddress,
      player.username,
      player.totalWinnings.toString(),
      player.totalBets.toString(),
      player.gamesWon,
      player.gamesLost,
      player.gamesDrawn,
      player.joinedAt,
      player.lastActive,
    ]);

    return this.rowToPlayer(result.rows[0]);
  }

  async getPlayer(id: string): Promise<Player | null> {
    const result = await this.pool.query('SELECT * FROM players WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.rowToPlayer(result.rows[0]) : null;
  }

  async getPlayerByAddress(address: `0x${string}`): Promise<Player | null> {
    const result = await this.pool.query(
      'SELECT * FROM players WHERE LOWER(wallet_address) = LOWER($1)',
      [address]
    );
    return result.rows.length > 0 ? this.rowToPlayer(result.rows[0]) : null;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }
    if (updates.totalWinnings !== undefined) {
      fields.push(`total_winnings = $${paramCount++}`);
      values.push(updates.totalWinnings.toString());
    }
    if (updates.totalBets !== undefined) {
      fields.push(`total_bets = $${paramCount++}`);
      values.push(updates.totalBets.toString());
    }
    if (updates.gamesWon !== undefined) {
      fields.push(`games_won = $${paramCount++}`);
      values.push(updates.gamesWon);
    }
    if (updates.gamesLost !== undefined) {
      fields.push(`games_lost = $${paramCount++}`);
      values.push(updates.gamesLost);
    }
    if (updates.gamesDrawn !== undefined) {
      fields.push(`games_drawn = $${paramCount++}`);
      values.push(updates.gamesDrawn);
    }
    if (updates.lastActive !== undefined) {
      fields.push(`last_active = $${paramCount++}`);
      values.push(updates.lastActive);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE players SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Player not found');
    return this.rowToPlayer(result.rows[0]);
  }

  async getLeaderboard(limit: number): Promise<Player[]> {
    const result = await this.pool.query(
      `SELECT * FROM players ORDER BY total_winnings DESC LIMIT $1`,
      [limit]
    );
    return result.rows.map((row) => this.rowToPlayer(row));
  }

  // Game session operations
  async createGameSession(session: GameSession): Promise<GameSession> {
    const query = `
      INSERT INTO game_sessions (
        id, mode, status, player1_id, player1_address, player1_bet,
        player1_rolls, player1_outcome, player2_id, player2_address,
        player2_bet, player2_rolls, player2_outcome, current_round,
        max_rounds, total_pot, created_at, started_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;

    const result = await this.pool.query(query, [
      session.id,
      session.mode,
      session.status,
      session.player1.id,
      session.player1.address,
      session.player1.betAmount.toString(),
      JSON.stringify(session.player1.rolls),
      session.player1.outcome,
      session.player2?.id || null,
      session.player2?.address || null,
      session.player2?.betAmount.toString() || null,
      session.player2 ? JSON.stringify(session.player2.rolls) : null,
      session.player2?.outcome || null,
      session.currentRound,
      session.maxRounds,
      session.totalPot.toString(),
      session.createdAt,
      session.startedAt || null,
    ]);

    return this.rowToGameSession(result.rows[0]);
  }

  async getGameSession(id: string): Promise<GameSession | null> {
    const result = await this.pool.query('SELECT * FROM game_sessions WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.rowToGameSession(result.rows[0]) : null;
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.player1 !== undefined) {
      fields.push(`player1_rolls = $${paramCount++}`);
      values.push(JSON.stringify(updates.player1.rolls));
      fields.push(`player1_outcome = $${paramCount++}`);
      values.push(updates.player1.outcome);
    }
    if (updates.player2 !== undefined) {
      fields.push(`player2_rolls = $${paramCount++}`);
      values.push(JSON.stringify(updates.player2.rolls));
      fields.push(`player2_outcome = $${paramCount++}`);
      values.push(updates.player2.outcome);
    }
    if (updates.currentRound !== undefined) {
      fields.push(`current_round = $${paramCount++}`);
      values.push(updates.currentRound);
    }
    if (updates.winner !== undefined) {
      fields.push(`winner_id = $${paramCount++}`);
      values.push(updates.winner);
    }
    if (updates.finishedAt !== undefined) {
      fields.push(`finished_at = $${paramCount++}`);
      values.push(updates.finishedAt);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE game_sessions SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Game session not found');
    return this.rowToGameSession(result.rows[0]);
  }

  async finishGameSession(id: string, winner?: string): Promise<GameSession> {
    const query = `
      UPDATE game_sessions
      SET status = 'finished', winner_id = $2, finished_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await this.pool.query(query, [id, winner || null]);
    if (result.rows.length === 0) throw new Error('Game session not found');
    return this.rowToGameSession(result.rows[0]);
  }

  // Game result operations
  async createGameResult(result: GameResult): Promise<GameResult> {
    const query = `
      INSERT INTO game_results (
        id, game_id, player1_id, player2_id, player1_outcome, player2_outcome,
        winner_id, player1_winnings, player2_winnings, tx_hash, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    await this.pool.query(query, [
      result.gameId,
      result.gameId,
      result.player1Id,
      result.player2Id || null,
      result.player1Outcome,
      result.player2Outcome || null,
      result.winner || null,
      result.player1Winnings.toString(),
      result.player2Winnings?.toString() || null,
      result.txHash,
      result.timestamp,
    ]);

    return result;
  }

  async getGameResults(playerId: string, limit: number): Promise<GameResult[]> {
    const query = `
      SELECT * FROM game_results
      WHERE player1_id = $1 OR player2_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;

    const result = await this.pool.query(query, [playerId, limit]);
    return result.rows.map((row) => this.rowToGameResult(row));
  }

  // Queue operations
  async addToQueue(queueEntry: GameQueue): Promise<GameQueue> {
    const query = `
      INSERT INTO game_queue (id, player_id, wallet_address, bet_amount, mode, joined_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.pool.query(query, [
      id,
      queueEntry.playerId,
      queueEntry.address,
      queueEntry.betAmount.toString(),
      queueEntry.mode,
      queueEntry.joinedAt,
    ]);

    return queueEntry;
  }

  async removeFromQueue(playerId: string): Promise<void> {
    await this.pool.query('DELETE FROM game_queue WHERE player_id = $1', [playerId]);
  }

  async getQueueEntries(limit: number): Promise<GameQueue[]> {
    const result = await this.pool.query(
      'SELECT * FROM game_queue ORDER BY joined_at ASC LIMIT $1',
      [limit]
    );

    return result.rows.map((row) => ({
      playerId: row.player_id,
      address: row.wallet_address,
      betAmount: BigInt(row.bet_amount),
      joinedAt: row.joined_at,
      mode: row.mode,
    }));
  }

  async clearQueue(): Promise<void> {
    await this.pool.query('DELETE FROM game_queue');
  }

  // Helper methods
  private rowToPlayer(row: any): Player {
    return {
      id: row.id,
      username: row.username,
      walletAddress: row.wallet_address,
      totalWinnings: BigInt(row.total_winnings),
      totalBets: BigInt(row.total_bets),
      gamesWon: row.games_won,
      gamesLost: row.games_lost,
      gamesDrawn: row.games_drawn,
      joinedAt: row.joined_at,
      lastActive: row.last_active,
    };
  }

  private rowToGameSession(row: any): GameSession {
    return {
      id: row.id,
      mode: row.mode,
      status: row.status,
      player1: {
        id: row.player1_id,
        address: row.player1_address,
        betAmount: BigInt(row.player1_bet),
        rolls: row.player1_rolls || [],
        outcome: row.player1_outcome,
      },
      player2: row.player2_id
        ? {
            id: row.player2_id,
            address: row.player2_address,
            betAmount: BigInt(row.player2_bet),
            rolls: row.player2_rolls || [],
            outcome: row.player2_outcome,
          }
        : undefined,
      currentRound: row.current_round,
      maxRounds: row.max_rounds,
      createdAt: row.created_at,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      winner: row.winner_id,
      totalPot: BigInt(row.total_pot),
      txHash: row.tx_hash,
    };
  }

  private rowToGameResult(row: any): GameResult {
    return {
      gameId: row.game_id,
      player1Id: row.player1_id,
      player2Id: row.player2_id,
      player1Outcome: row.player1_outcome,
      player2Outcome: row.player2_outcome,
      winner: row.winner_id,
      player1Winnings: BigInt(row.player1_winnings),
      player2Winnings: row.player2_winnings ? BigInt(row.player2_winnings) : undefined,
      txHash: row.tx_hash,
      timestamp: row.created_at,
    };
  }
}

