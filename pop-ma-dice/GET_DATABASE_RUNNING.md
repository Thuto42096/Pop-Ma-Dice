# How to Get the Database Running

## 🚀 The Fastest Way (2 Commands)

```bash
npm run db:start
npm run db:setup
```

**That's it!** Your database is now running and initialized.

---

## ✅ Verify It's Working

```bash
# Check if container is running
docker ps | grep postgres

# Test connection
npm run db:setup
```

You should see:
```
✅ Database connection successful
✓ players table created
✓ game_sessions table created
✓ game_results table created
✓ game_queue table created
✓ All indexes created
🎉 Database setup complete!
```

---

## 📋 What Gets Created

### Database
- **Name:** `pop_ma_dice`
- **User:** `popmauser`
- **Password:** `popmapass123`
- **Port:** 5432

### Tables
1. **players** - User accounts and statistics
2. **game_sessions** - Active games
3. **game_results** - Completed games
4. **game_queue** - Matchmaking queue

### Indexes
- Fast lookups for players, games, and queue operations

---

## 🛠️ Database Commands

```bash
# Start database
npm run db:start

# Stop database
npm run db:stop

# Initialize/reset schema
npm run db:setup

# View logs
npm run db:logs

# Connect to database CLI
docker exec -it pop-ma-dice-db psql -U popmauser -d pop_ma_dice
```

---

## ⚠️ Prerequisites

### Check Docker
```bash
docker --version
docker ps
```

If Docker is not installed:
- **macOS:** Download Docker Desktop from https://www.docker.com/products/docker-desktop
- **Linux:** `sudo apt-get install docker.io`
- **Windows:** Download Docker Desktop from https://www.docker.com/products/docker-desktop

### Check Docker Daemon
If you see "Cannot connect to Docker daemon":
- **macOS:** Open Docker Desktop app
- **Linux:** `sudo systemctl start docker`
- **Windows:** Open Docker Desktop app

---

## 🔧 Troubleshooting

### "Docker daemon is not running"
```bash
# macOS
open /Applications/Docker.app

# Linux
sudo systemctl start docker

# Windows
# Open Docker Desktop app
```

### "Port 5432 already in use"
```bash
# Find what's using port 5432
lsof -i :5432

# Kill the process
kill -9 <PID>

# Or use different port (edit docker-compose.yml)
```

### "Connection refused"
```bash
# Make sure database is running
docker ps

# If not running, start it
npm run db:start

# Wait a few seconds for it to initialize
sleep 5

# Then setup
npm run db:setup
```

### "Permission denied" (Linux)
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
# Then try again
```

### "Database already exists"
```bash
# Stop and remove everything
npm run db:stop
docker volume rm pop-ma-dice_postgres_data

# Start fresh
npm run db:start
npm run db:setup
```

---

## 📊 Check Database Status

### View Running Containers
```bash
docker ps
```

### View Database Logs
```bash
npm run db:logs
```

### Connect to Database
```bash
# Using Docker
docker exec -it pop-ma-dice-db psql -U popmauser -d pop_ma_dice

# Then in psql:
\dt                    # List tables
SELECT * FROM players; # Query data
\q                     # Exit
```

---

## 🔗 Connection String

Use this to connect from your application:

```
postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice
```

This is already set in `.env.local` if you created it.

---

## 🚀 Next Steps After Database is Running

### 1. Run Tests
```bash
npm test
```

Expected output:
```
Test Suites: 3 passed, 2 failed (database tests need DB)
Tests:       65 passed, 10 failed
```

### 2. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

### 3. Test Wallet Connection
1. Install MetaMask or other wallet
2. Switch to Base network
3. Click "Connect Wallet" in app
4. Approve connection

### 4. Play a Game
1. Create a game
2. Join matchmaking queue
3. Play against another player
4. Claim winnings

---

## 📚 More Information

- **DATABASE_SETUP_GUIDE.md** - Detailed setup for different systems
- **DATABASE_QUICK_SETUP.md** - Quick reference
- **QUICK_START.md** - Full quick start guide
- **INTEGRATION_TESTING_COMPLETE.md** - Testing report

---

## 💡 Tips

### Keep Database Running
```bash
# Run in background
npm run db:start

# Keep terminal open to see logs
npm run db:logs
```

### Reset Database
```bash
# Stop and remove data
npm run db:stop
docker volume rm pop-ma-dice_postgres_data

# Start fresh
npm run db:start
npm run db:setup
```

### Backup Database
```bash
# Export data
docker exec pop-ma-dice-db pg_dump -U popmauser pop_ma_dice > backup.sql

# Restore data
docker exec -i pop-ma-dice-db psql -U popmauser pop_ma_dice < backup.sql
```

---

## ✨ Summary

| Step | Command | Time |
|------|---------|------|
| 1. Start Database | `npm run db:start` | 10 seconds |
| 2. Initialize Schema | `npm run db:setup` | 5 seconds |
| 3. Verify Connection | `npm run db:setup` | 2 seconds |
| **Total** | **2 commands** | **~20 seconds** |

---

## 🎉 You're Done!

Your database is now:
- ✅ Running
- ✅ Initialized
- ✅ Ready for testing
- ✅ Ready for development

**Start building!**

```bash
npm run dev
```

