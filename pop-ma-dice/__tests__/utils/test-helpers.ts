// Test helper utilities
import { Pool } from 'pg'

let testPool: Pool | null = null

export async function getTestDatabase(): Promise<Pool> {
  if (!testPool) {
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }
  return testPool
}

export async function setupTestDatabase(): Promise<void> {
  const pool = await getTestDatabase()
  
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        player_id VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        wallet_address VARCHAR(255) UNIQUE,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        total_winnings BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        player1_id VARCHAR(255) NOT NULL,
        player2_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_results (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(255) UNIQUE NOT NULL,
        player1_id VARCHAR(255) NOT NULL,
        player2_id VARCHAR(255),
        winner_id VARCHAR(255),
        player1_winnings BIGINT DEFAULT 0,
        player2_winnings BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_queue (
        id SERIAL PRIMARY KEY,
        player_id VARCHAR(255) UNIQUE NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
  } catch (error) {
    // Tables might already exist
    console.log('Tables already exist or error creating tables')
  }
}

export async function cleanupTestDatabase(): Promise<void> {
  const pool = await getTestDatabase()
  
  try {
    await pool.query('TRUNCATE TABLE game_queue CASCADE')
    await pool.query('TRUNCATE TABLE game_results CASCADE')
    await pool.query('TRUNCATE TABLE game_sessions CASCADE')
    await pool.query('TRUNCATE TABLE players CASCADE')
  } catch (error) {
    console.error('Error cleaning up test database:', error)
  }
}

export async function closeTestDatabase(): Promise<void> {
  if (testPool) {
    await testPool.end()
    testPool = null
  }
}

export function createMockPlayer(overrides = {}) {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return {
    playerId: `player_${uniqueId}`,
    username: `test_user_${uniqueId}`,
    address: `0x${Math.random().toString(16).slice(2).padStart(40, '0')}`,
    ...overrides,
  }
}

export function createMockGameRequest(overrides = {}) {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return {
    playerId: `player_${uniqueId}`,
    address: `0x${Math.random().toString(16).slice(2).padStart(40, '0')}`,
    betAmount: '1000000000000000000', // 1 ETH in wei
    mode: 'pve',
    ...overrides,
  }
}

export async function insertTestPlayer(pool: Pool, playerId: string, address: string) {
  return pool.query(
    'INSERT INTO players (player_id, username, wallet_address) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [playerId, `user_${playerId}`, address]
  )
}

export async function getPlayerFromDb(pool: Pool, playerId: string) {
  const result = await pool.query('SELECT * FROM players WHERE player_id = $1', [playerId])
  return result.rows[0]
}

export async function getGameResultFromDb(pool: Pool, gameId: string) {
  const result = await pool.query('SELECT * FROM game_results WHERE game_id = $1', [gameId])
  return result.rows[0]
}

