# PostgreSQL Setup Guide for Pop Ma Dice

## Option 1: Local PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Ubuntu/Debian
```bash
# Update package manager
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Verify installation
psql --version
```

### Windows
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer and follow setup wizard
3. Remember the password you set for `postgres` user
4. PostgreSQL will start automatically

## Option 2: Docker (Recommended for Development)

### Using Docker Compose

Create `docker-compose.yml` in project root:

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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U popmauser"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Start the database:
```bash
docker-compose up -d
```

## Option 3: Cloud Database (Neon, Supabase, Railway)

### Using Neon (Recommended)
1. Go to https://neon.tech
2. Sign up for free account
3. Create new project
4. Copy connection string
5. Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

### Using Supabase
1. Go to https://supabase.com
2. Create new project
3. Get connection string from project settings
4. Add to `.env.local`

## Create Database and User

### Using psql (Command Line)

```bash
# Connect to PostgreSQL
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

# Connect to database
\c pop_ma_dice

# Grant schema privileges
GRANT ALL ON SCHEMA public TO popmauser;

# Exit psql
\q
```

## Environment Variables

Create `.env.local` in `pop-ma-dice/` directory:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice

# Node Environment
NODE_ENV=development

# Other existing variables
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Pop Ma Dice
```

For production, use a secure password and connection string.

## Verify Connection

```bash
# Test connection
psql postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice

# If successful, you'll see:
# pop_ma_dice=>

# Exit
\q
```

## Next Steps

1. Install database client library:
   ```bash
   npm install pg
   npm install --save-dev @types/pg
   ```

2. Run migrations (see next section)

3. Test connection in application

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `brew services list` (macOS)
- Check port 5432 is not blocked
- Verify credentials in DATABASE_URL

### Permission Denied
- Ensure user has correct privileges
- Run GRANT commands again
- Check user password

### Database Already Exists
```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE IF EXISTS pop_ma_dice;"

# Recreate
psql -U postgres -c "CREATE DATABASE pop_ma_dice;"
```

## Useful Commands

```bash
# List databases
psql -U postgres -l

# Connect to database
psql -U popmauser -d pop_ma_dice

# List tables
\dt

# Describe table
\d table_name

# View all users
\du

# Backup database
pg_dump -U popmauser pop_ma_dice > backup.sql

# Restore database
psql -U popmauser pop_ma_dice < backup.sql
```

## Security Notes

- Never commit `.env.local` to git
- Use strong passwords in production
- Restrict database access to application server
- Enable SSL for remote connections
- Regular backups recommended

