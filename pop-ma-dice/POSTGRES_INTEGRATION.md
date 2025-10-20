# PostgreSQL Integration Guide

## Overview

Pop Ma Dice now has full PostgreSQL support! The backend automatically detects and uses PostgreSQL when `DATABASE_URL` is configured, otherwise falls back to in-memory database for development.

## Quick Start

### 1. Install PostgreSQL

Choose one of the options from `POSTGRES_SETUP.md`:
- Local installation (macOS, Ubuntu, Windows)
- Docker (recommended for development)
- Cloud service (Neon, Supabase, Railway)

### 2. Create Database and User

```bash
# Using psql
psql -U postgres

# Create database
CREATE DATABASE pop_ma_dice;

# Create user
CREATE USER popmauser WITH PASSWORD 'popmapass123';

# Grant privileges
ALTER ROLE popmauser SET client_encoding TO 'utf8';
ALTER ROLE popmauser SET default_transaction_isolation TO 'read committed';
ALTER ROLE popmauser SET default_transaction_deferrable TO on;
ALTER ROLE popmauser SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE pop_ma_dice TO popmauser;

# Exit
\q
```

### 3. Configure Environment

Create `.env.local` in `pop-ma-dice/`:

```env
DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice
NODE_ENV=development
```

### 4. Run Migrations

```bash
cd pop-ma-dice

# Install dependencies (if not already done)
npm install

# Run migration script
npx ts-node scripts/migrate-db.ts
```

Expected output:
```
🔄 Running database migrations...
✅ CREATE TABLE IF NOT EXISTS players...
✅ CREATE TABLE IF NOT EXISTS game_sessions...
✅ CREATE TABLE IF NOT EXISTS game_results...
✅ CREATE TABLE IF NOT EXISTS game_queue...
✅ CREATE INDEX IF NOT EXISTS idx_players_wallet...
...
✅ Database migration completed successfully!
```

### 5. Start Development Server

```bash
npm run dev
```

The application will automatically connect to PostgreSQL!

## Architecture

### Database Client

The `PostgresGameDatabase` class in `lib/postgres-client.ts` implements the `IGameDatabase` interface:

```typescript
// Automatically selected based on DATABASE_URL
const db = await getDatabase();

// All operations work the same way
await db.createPlayer(player);
await db.createGameSession(game);
await db.getLeaderboard(100);
```

### Connection Pooling

PostgreSQL client uses connection pooling for performance:
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

### Data Types

Large numbers (bets, winnings) are stored as `NUMERIC(78, 0)` and converted to/from `BigInt`:

```typescript
// Automatic conversion
const player = await db.getPlayer('player1');
console.log(player.totalWinnings); // BigInt
```

## Database Schema

### Tables

#### `players`
- `id` - Player ID (primary key)
- `wallet_address` - Ethereum address (unique)
- `username` - Display name
- `total_winnings` - Total ETH won
- `total_bets` - Total ETH bet
- `games_won`, `games_lost`, `games_drawn` - Statistics
- `joined_at`, `last_active` - Timestamps

#### `game_sessions`
- `id` - Game ID (primary key)
- `mode` - 'pvp' or 'pve'
- `status` - 'waiting', 'active', 'finished', 'cancelled'
- `player1_*`, `player2_*` - Player data
- `player1_rolls`, `player2_rolls` - JSONB arrays of rolls
- `current_round`, `max_rounds` - Round tracking
- `winner_id` - Winner player ID
- `total_pot` - Total bet amount
- `tx_hash` - Blockchain transaction hash

#### `game_results`
- `id` - Result ID (primary key)
- `game_id` - Reference to game_sessions
- `player1_id`, `player2_id` - Player references
- `player1_outcome`, `player2_outcome` - 'win', 'lose', 'draw'
- `winner_id` - Winner player ID
- `player1_winnings`, `player2_winnings` - Payout amounts
- `tx_hash` - Blockchain transaction hash

#### `game_queue`
- `id` - Queue entry ID (primary key)
- `player_id` - Player reference
- `wallet_address` - Player's wallet
- `bet_amount` - Bet amount
- `mode` - Game mode
- `joined_at` - Queue join time

### Indexes

Optimized indexes for common queries:
- `idx_players_wallet` - Fast wallet lookups
- `idx_game_sessions_player1/2` - Player game queries
- `idx_game_sessions_status` - Status filtering
- `idx_game_results_player1/2` - Result lookups
- `idx_game_queue_player` - Queue management

## Testing

### Test Connection

```bash
# Test PostgreSQL connection
psql postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice

# List tables
\dt

# Exit
\q
```

### Test API Endpoints

```bash
# Create a game
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player1",
    "address": "0x1234567890123456789012345678901234567890",
    "betAmount": "1000000000000000000",
    "mode": "pve"
  }'

# Get leaderboard
curl http://localhost:3000/api/leaderboard?limit=10
```

## Troubleshooting

### Connection Refused
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Check port 5432
lsof -i :5432
```

### Permission Denied
```bash
# Verify user privileges
psql -U postgres -c "\du"

# Re-grant privileges
psql -U postgres -d pop_ma_dice -c "GRANT ALL ON SCHEMA public TO popmauser;"
```

### Migration Fails
```bash
# Check database exists
psql -U postgres -l

# Check user can connect
psql -U popmauser -d pop_ma_dice

# Re-run migration
npx ts-node scripts/migrate-db.ts
```

### Data Not Persisting
- Verify `DATABASE_URL` is set correctly
- Check `.env.local` is in `pop-ma-dice/` directory
- Restart development server after changing `.env.local`

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
```

### Connection String Format

```
postgresql://username:password@host:port/database
```

### SSL Connections

For remote databases, enable SSL:

```
postgresql://username:password@host:5432/database?sslmode=require
```

### Backups

```bash
# Backup database
pg_dump -U popmauser pop_ma_dice > backup.sql

# Restore database
psql -U popmauser pop_ma_dice < backup.sql
```

## Performance Tips

1. **Connection Pooling** - Already configured with 20 max connections
2. **Indexes** - All common queries are indexed
3. **JSONB** - Rolls stored as JSONB for efficient querying
4. **Numeric** - Large numbers use NUMERIC(78,0) for precision

## Next Steps

1. ✅ PostgreSQL installed and configured
2. ✅ Database schema created
3. ✅ Application connected
4. 🚀 Ready for production deployment!

For next features:
- WebSocket real-time updates
- Blockchain integration
- Advanced analytics
- Monitoring and logging

