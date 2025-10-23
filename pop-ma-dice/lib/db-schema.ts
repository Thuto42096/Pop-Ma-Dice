// Database schema definitions for PostgreSQL/MongoDB

/**
 * PostgreSQL Schema SQL
 * Run this to set up the database
 */
export const POSTGRES_SCHEMA = `
-- Players table
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(255) PRIMARY KEY,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  total_winnings NUMERIC(78, 0) DEFAULT 0,
  total_bets NUMERIC(78, 0) DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  games_drawn INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id VARCHAR(255) PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  player1_id VARCHAR(255) NOT NULL REFERENCES players(id),
  player1_address VARCHAR(255) NOT NULL,
  player1_bet NUMERIC(78, 0) NOT NULL,
  player1_rolls JSONB DEFAULT '[]',
  player1_outcome VARCHAR(50),
  player2_id VARCHAR(255) REFERENCES players(id),
  player2_address VARCHAR(255),
  player2_bet NUMERIC(78, 0),
  player2_rolls JSONB DEFAULT '[]',
  player2_outcome VARCHAR(50),
  current_round INTEGER DEFAULT 0,
  max_rounds INTEGER DEFAULT 10,
  winner_id VARCHAR(255),
  total_pot NUMERIC(78, 0) NOT NULL,
  tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game results table
CREATE TABLE IF NOT EXISTS game_results (
  id VARCHAR(255) PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL REFERENCES game_sessions(id),
  player1_id VARCHAR(255) NOT NULL REFERENCES players(id),
  player2_id VARCHAR(255) REFERENCES players(id),
  player1_outcome VARCHAR(50),
  player2_outcome VARCHAR(50),
  winner_id VARCHAR(255),
  player1_winnings NUMERIC(78, 0) DEFAULT 0,
  player2_winnings NUMERIC(78, 0) DEFAULT 0,
  tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game queue table
CREATE TABLE IF NOT EXISTS game_queue (
  id VARCHAR(255) PRIMARY KEY,
  player_id VARCHAR(255) NOT NULL REFERENCES players(id),
  wallet_address VARCHAR(255) NOT NULL,
  bet_amount NUMERIC(78, 0) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_players_wallet ON players(wallet_address);
CREATE INDEX idx_game_sessions_player1 ON game_sessions(player1_id);
CREATE INDEX idx_game_sessions_player2 ON game_sessions(player2_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_results_player1 ON game_results(player1_id);
CREATE INDEX idx_game_results_player2 ON game_results(player2_id);
CREATE INDEX idx_game_queue_player ON game_queue(player_id);
`;

