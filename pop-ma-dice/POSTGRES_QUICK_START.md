# PostgreSQL Quick Start - 5 Minutes to Production

## Option A: Docker (Fastest - Recommended)

### 1. Create docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: pop-ma-dice-db
    environment:
      POSTGRES_USER: popmauser
      POSTGRES_PASSWORD: popmapass123
      POSTGRES_DB: pop_ma_dice
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Create .env.local

```env
DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice
NODE_ENV=development
```

### 4. Run Migrations

```bash
cd pop-ma-dice
npx ts-node scripts/migrate-db.ts
```

### 5. Start App

```bash
npm run dev
```

✅ Done! Your database is ready.

---

## Option B: Local PostgreSQL

### macOS

```bash
# Install
brew install postgresql@15

# Start
brew services start postgresql@15

# Create database
psql -U postgres -c "CREATE DATABASE pop_ma_dice;"
psql -U postgres -c "CREATE USER popmauser WITH PASSWORD 'popmapass123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE pop_ma_dice TO popmauser;"
```

### Ubuntu/Debian

```bash
# Install
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql -c "CREATE DATABASE pop_ma_dice;"
sudo -u postgres psql -c "CREATE USER popmauser WITH PASSWORD 'popmapass123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pop_ma_dice TO popmauser;"
```

### Windows

1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password for `postgres` user
4. Open Command Prompt:

```cmd
psql -U postgres
CREATE DATABASE pop_ma_dice;
CREATE USER popmauser WITH PASSWORD 'popmapass123';
GRANT ALL PRIVILEGES ON DATABASE pop_ma_dice TO popmauser;
\q
```

### Then for all platforms:

```bash
# Create .env.local
echo "DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice" > pop-ma-dice/.env.local

# Run migrations
cd pop-ma-dice
npx ts-node scripts/migrate-db.ts

# Start app
npm run dev
```

---

## Option C: Cloud Database (Neon)

### 1. Sign Up

Go to https://neon.tech and create free account

### 2. Create Project

- Click "New Project"
- Name: "pop-ma-dice"
- Region: Choose closest to you
- Click "Create"

### 3. Get Connection String

- Copy the connection string from dashboard
- It looks like: `postgresql://user:password@host/database`

### 4. Create .env.local

```env
DATABASE_URL=postgresql://user:password@host/database
NODE_ENV=development
```

### 5. Run Migrations

```bash
cd pop-ma-dice
npx ts-node scripts/migrate-db.ts
```

### 6. Start App

```bash
npm run dev
```

---

## Verify Setup

### Test Connection

```bash
# Test PostgreSQL connection
psql postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice

# List tables
\dt

# Exit
\q
```

### Test API

```bash
# Create a game
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test_player",
    "address": "0x1234567890123456789012345678901234567890",
    "betAmount": "1000000000000000000",
    "mode": "pve"
  }'

# Get leaderboard
curl http://localhost:3000/api/leaderboard?limit=10
```

---

## Troubleshooting

### "Connection refused"
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify port 5432 is not blocked

### "Database does not exist"
- Run migrations: `npx ts-node scripts/migrate-db.ts`
- Check database name matches DATABASE_URL

### "Permission denied"
- Verify user credentials
- Check user has database privileges
- Re-run GRANT commands

### "Module not found: pg"
```bash
npm install pg --legacy-peer-deps
npm install --save-dev @types/pg --legacy-peer-deps
```

---

## What's Included

✅ PostgreSQL database client  
✅ Connection pooling (20 max connections)  
✅ Automatic schema creation  
✅ Type-safe operations  
✅ BigInt support for large numbers  
✅ Production-ready configuration  

---

## Next Steps

1. ✅ Database installed and running
2. ✅ Schema created with migrations
3. ✅ Application connected
4. 🚀 Ready for production!

For more details, see:
- `POSTGRES_SETUP.md` - Detailed installation guide
- `POSTGRES_INTEGRATION.md` - Complete integration guide
- `BACKEND_ARCHITECTURE.md` - System architecture

