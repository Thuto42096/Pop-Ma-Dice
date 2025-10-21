#!/usr/bin/env node

import { Pool } from 'pg'

// Load environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice'

const pool = new Pool({
  connectionString: DATABASE_URL,
})

async function setupDatabase() {
  try {
    console.log('🔄 Setting up Pop Ma Dice database...\n')

    // Test connection
    console.log('📡 Testing database connection...')
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful\n')

    // Create tables
    console.log('📊 Creating tables...')
    
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
    `)
    console.log('  ✓ players table created')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        player1_id VARCHAR(255) NOT NULL,
        player2_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('  ✓ game_sessions table created')

    await pool.query(`
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
    `)
    console.log('  ✓ game_results table created')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_queue (
        id SERIAL PRIMARY KEY,
        player_id VARCHAR(255) UNIQUE NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('  ✓ game_queue table created\n')

    // Create indexes
    console.log('🔍 Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_game_sessions_player1 ON game_sessions(player1_id);',
      'CREATE INDEX IF NOT EXISTS idx_game_sessions_player2 ON game_sessions(player2_id);',
      'CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);',
      'CREATE INDEX IF NOT EXISTS idx_game_results_player1 ON game_results(player1_id);',
      'CREATE INDEX IF NOT EXISTS idx_game_results_player2 ON game_results(player2_id);',
      'CREATE INDEX IF NOT EXISTS idx_game_queue_player ON game_queue(player_id);',
    ]

    for (const indexQuery of indexes) {
      await pool.query(indexQuery)
    }
    console.log('  ✓ All indexes created\n')

    // Verify tables
    console.log('✅ Verifying tables...')
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)

    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`)
    })

    console.log('\n🎉 Database setup complete!\n')
    console.log('📝 Connection details:')
    console.log(`   Database URL: ${DATABASE_URL}\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()

