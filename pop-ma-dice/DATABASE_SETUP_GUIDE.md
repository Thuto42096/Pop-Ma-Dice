# Database Setup Guide for Pop Ma Dice

## Quick Start Options

### Option 1: Using Docker (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Docker daemon running

#### Steps

1. **Start the database container:**
```bash
cd pop-ma-dice
docker compose up -d
```

2. **Verify the container is running:**
```bash
docker ps
```

You should see `pop-ma-dice-db` container running on port 5432.

3. **Check database health:**
```bash
docker compose ps
```

#### Connection Details
- **Host:** localhost
- **Port:** 5432
- **User:** popmauser
- **Password:** popmapass123
- **Database:** pop_ma_dice

#### Useful Docker Commands

```bash
# View logs
docker compose logs -f postgres

# Stop the database
docker compose down

# Remove all data and restart fresh
docker compose down -v
docker compose up -d

# Access PostgreSQL CLI
docker exec -it pop-ma-dice-db psql -U popmauser -d pop_ma_dice
```

---

### Option 2: Local PostgreSQL Installation

#### On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On macOS (with Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### On Windows:
- Download from https://www.postgresql.org/download/windows/
- Run the installer
- Remember the password you set for the `postgres` user

#### Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create user
CREATE USER popmauser WITH PASSWORD 'popmapass123';

# Create database
CREATE DATABASE pop_ma_dice OWNER popmauser;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pop_ma_dice TO popmauser;

# Exit
\q
```

#### Connection Details
- **Host:** localhost
- **Port:** 5432 (default)
- **User:** popmauser
- **Password:** popmapass123
- **Database:** pop_ma_dice

---

### Option 3: Cloud Database (Supabase/Railway/Render)

#### Using Supabase (Free tier available):

1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string
4. Update `.env.local`:
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

#### Using Railway:
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy connection string to `.env.local`

---

## Environment Configuration

### Create `.env.local` file:

```bash
# Database
DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice

# Smart Contract
NEXT_PUBLIC_DICE_GAME_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Wallet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

---

## Database Schema Setup

### Automatic Setup (Recommended)

```bash
# Run migrations
npm run migrate
```

### Manual Setup

Connect to the database and run:

```sql
-- Players table
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

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  player1_id VARCHAR(255) NOT NULL,
  player2_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game results table
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

-- Game queue table
CREATE TABLE IF NOT EXISTS game_queue (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(255) UNIQUE NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_game_sessions_player1 ON game_sessions(player1_id);
CREATE INDEX idx_game_sessions_player2 ON game_sessions(player2_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_results_player1 ON game_results(player1_id);
CREATE INDEX idx_game_results_player2 ON game_results(player2_id);
CREATE INDEX idx_game_queue_player ON game_queue(player_id);
```

---

## Verify Database Connection

### Using Node.js:
```bash
node verify-db.mjs
```

### Using psql:
```bash
psql -U popmauser -d pop_ma_dice -h localhost -c "SELECT NOW();"
```

### Using the test script:
```bash
npm run test:db
```

---

## Troubleshooting

### Connection Refused
- Ensure database is running: `docker ps` or `systemctl status postgresql`
- Check port 5432 is not blocked: `netstat -an | grep 5432`
- Verify credentials in `.env.local`

### Permission Denied
- For Docker: Add user to docker group: `sudo usermod -aG docker $USER`
- For PostgreSQL: Check user permissions

### Database Already Exists
```bash
# Drop and recreate
docker compose down -v
docker compose up -d
```

### Can't Connect from Application
- Verify DATABASE_URL in `.env.local`
- Check network connectivity
- Ensure database user has correct permissions

---

## Next Steps

1. ✅ Start database
2. ✅ Create tables and indexes
3. ✅ Verify connection
4. Run tests: `npm test:db`
5. Start development server: `npm run dev`

---

## Support

For issues, check:
- Docker logs: `docker compose logs postgres`
- PostgreSQL logs: `/var/log/postgresql/`
- Application logs: Check terminal output when running `npm run dev`

