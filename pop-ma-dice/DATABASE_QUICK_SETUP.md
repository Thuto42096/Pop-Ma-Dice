# Database Quick Setup

## 🚀 Fastest Way to Get Database Running

### Prerequisites Check
```bash
# Check if Docker is available
docker --version

# Check if Docker daemon is running
docker ps
```

---

## Option 1: Docker (Recommended - 2 Commands)

### Step 1: Start Database Container
```bash
npm run db:start
```

**What this does:**
- Starts PostgreSQL 15 container
- Creates database: `pop_ma_dice`
- Creates user: `popmauser` with password `popmapass123`
- Exposes port 5432

### Step 2: Initialize Schema
```bash
npm run db:setup
```

**What this does:**
- Creates all tables (players, game_sessions, game_results, game_queue)
- Creates indexes for performance
- Verifies connection

**Done!** ✅ Database is ready to use.

---

## Option 2: Local PostgreSQL

### macOS (Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start service
brew services start postgresql

# Create user and database
psql -U postgres -c "CREATE USER popmauser WITH PASSWORD 'popmapass123';"
psql -U postgres -c "CREATE DATABASE pop_ma_dice OWNER popmauser;"

# Initialize schema
npm run db:setup
```

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create user and database
sudo -u postgres psql -c "CREATE USER popmauser WITH PASSWORD 'popmapass123';"
sudo -u postgres psql -c "CREATE DATABASE pop_ma_dice OWNER popmauser;"

# Initialize schema
npm run db:setup
```

### Windows
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Run installer, remember the password for `postgres` user
3. Open Command Prompt and run:
```cmd
psql -U postgres -c "CREATE USER popmauser WITH PASSWORD 'popmapass123';"
psql -U postgres -c "CREATE DATABASE pop_ma_dice OWNER popmauser;"
npm run db:setup
```

---

## Verify Database is Running

### Check Docker Container
```bash
docker ps | grep postgres
```

Should show something like:
```
CONTAINER ID   IMAGE              STATUS
abc123def456   postgres:15-alpine Up 2 minutes
```

### Test Connection
```bash
# Using psql (if installed)
psql -U popmauser -d pop_ma_dice -h localhost -c "SELECT NOW();"

# Using Node.js
npm run db:setup
```

---

## Connection Details

```
Host:     localhost
Port:     5432
User:     popmauser
Password: popmapass123
Database: pop_ma_dice
```

### Connection String
```
postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice
```

---

## Useful Commands

### View Database Logs
```bash
npm run db:logs
```

### Stop Database
```bash
npm run db:stop
```

### Restart Database (Fresh)
```bash
npm run db:stop
docker volume rm pop-ma-dice_postgres_data  # Remove data
npm run db:start
npm run db:setup
```

### Connect to Database CLI
```bash
# Using Docker
docker exec -it pop-ma-dice-db psql -U popmauser -d pop_ma_dice

# Using local psql
psql -U popmauser -d pop_ma_dice -h localhost
```

### View Tables
```bash
# In psql CLI
\dt

# Or run query
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## Troubleshooting

### "Docker daemon is not running"
```bash
# Start Docker daemon
# macOS: Open Docker Desktop app
# Linux: sudo systemctl start docker
# Windows: Open Docker Desktop app
```

### "Connection refused"
```bash
# Check if database is running
docker ps

# Check if port 5432 is in use
lsof -i :5432

# Start database
npm run db:start
```

### "Database already exists"
```bash
# Drop and recreate
npm run db:stop
docker volume rm pop-ma-dice_postgres_data
npm run db:start
npm run db:setup
```

### "Permission denied" (Linux)
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, then try again
```

---

## Next Steps

1. ✅ Start database: `npm run db:start`
2. ✅ Initialize schema: `npm run db:setup`
3. ✅ Run tests: `npm test`
4. ✅ Start dev server: `npm run dev`

---

## Environment Setup

Create `.env.local` file:
```bash
# Database
DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice

# Smart Contract
NEXT_PUBLIC_DICE_GAME_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Wallet (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## Database Schema

### Tables Created
- `players` - User accounts and stats
- `game_sessions` - Active games
- `game_results` - Completed games
- `game_queue` - Matchmaking queue

### Indexes Created
- `idx_game_sessions_player1` - Fast player1 lookups
- `idx_game_sessions_player2` - Fast player2 lookups
- `idx_game_sessions_status` - Fast status queries
- `idx_game_results_player1` - Fast result lookups
- `idx_game_results_player2` - Fast result lookups
- `idx_game_queue_player` - Fast queue lookups

---

## That's It! 🎉

Your database is now ready for:
- ✅ Development
- ✅ Testing
- ✅ Integration testing
- ✅ Production deployment

**Start playing Pop Ma Dice!**

