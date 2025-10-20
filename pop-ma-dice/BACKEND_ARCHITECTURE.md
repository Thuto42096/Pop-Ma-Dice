# Pop Ma Dice - Multiplayer Backend Architecture

## Overview

The Pop Ma Dice backend is designed to support multiplayer gameplay where players can compete against each other in real-time dice games. The system manages game sessions, player matchmaking, statistics tracking, and blockchain integration.

## Architecture Components

### 1. **Game Types** (`lib/game-types.ts`)
Defines all TypeScript interfaces and types:
- `Player` - Player profile and statistics
- `GameSession` - Active game state
- `GameResult` - Completed game record
- `GameQueue` - Matchmaking queue entry
- Game rules and constants

### 2. **Game Engine** (`lib/game-engine.ts`)
Core game logic:
- `createGameSession()` - Initialize new game
- `addPlayer2()` - Add second player to PvP game
- `executeRound()` - Run one round of dice rolls
- `calculateWinnings()` - Determine payouts
- `validateBet()` - Check bet constraints

### 3. **Database Layer** (`lib/db-client.ts`)
Abstract database interface:
- `IGameDatabase` - Interface for database operations
- `InMemoryGameDatabase` - Development implementation
- Supports PostgreSQL and MongoDB (schema in `lib/db-schema.ts`)

Operations:
- Player CRUD and leaderboard queries
- Game session management
- Game result tracking
- Queue management

### 4. **Matchmaking Service** (`lib/matchmaking.ts`)
Player pairing system:
- `joinQueue()` - Add player to matchmaking
- `findMatch()` - Find opponent with similar bet
- `leaveQueue()` - Remove from queue
- `getQueueStatus()` - Queue statistics
- `cleanupStaleQueue()` - Remove old entries

### 5. **API Endpoints**

#### Game Management
- **POST `/api/game/create`** - Create new game or join queue
  ```json
  {
    "playerId": "0x123...",
    "address": "0x123...",
    "betAmount": "1000000000000000000",
    "mode": "pvp" | "pve"
  }
  ```

- **POST `/api/game/play`** - Execute game round
  ```json
  {
    "gameId": "game_123..."
  }
  ```

- **GET `/api/game/state?gameId=...`** - Get current game state

#### Player Stats
- **GET `/api/player/stats?playerId=...&limit=50`** - Player statistics and history

#### Leaderboard
- **GET `/api/leaderboard?limit=100`** - Top players by winnings

## Game Flow

### PvP (Player vs Player)

1. **Player 1 Creates Game**
   ```
   POST /api/game/create
   → Added to queue (waiting for opponent)
   ```

2. **Player 2 Joins**
   ```
   POST /api/game/create
   → Matched with Player 1
   → Game session created
   ```

3. **Play Rounds**
   ```
   POST /api/game/play (Player 1)
   → Dice rolled for both players
   → Outcomes determined
   → Game continues or finishes
   ```

4. **Game Finishes**
   ```
   → Winner determined
   → Winnings calculated
   → Player stats updated
   → Game result recorded
   ```

### PvE (Player vs House)

1. **Player Creates PvE Game**
   ```
   POST /api/game/create (mode: "pve")
   → Game session created immediately
   ```

2. **Play Rounds**
   ```
   POST /api/game/play
   → Player rolls dice
   → Outcome determined
   → Game continues or finishes
   ```

## Game Rules

### Win Conditions (Pop)
- [5,2], [2,5], [4,3], [3,4], [6,1], [1,6], [6,5], [5,6]

### Lose Conditions (Krap)
- [2,1], [1,2], [1,1], [6,6]

### Bet Constraints
- Minimum: 0.001 ETH
- Maximum: 1 ETH
- Tolerance for matching: ±10%

## Database Schema

### PostgreSQL Tables
- `players` - Player profiles and stats
- `game_sessions` - Active and completed games
- `game_results` - Game outcome records
- `game_queue` - Matchmaking queue

### MongoDB Collections
- `players`
- `game_sessions`
- `game_results`
- `game_queue`

## Deployment

### Development
Uses in-memory database (`InMemoryGameDatabase`)

### Production
1. Set up PostgreSQL or MongoDB
2. Run schema migrations
3. Update `getDatabase()` in `lib/db-client.ts`
4. Deploy to production environment

### Environment Variables
```
DATABASE_URL=postgresql://...
# or
MONGODB_URI=mongodb://...
```

## Next Steps

1. **Implement Real Database**
   - PostgreSQL client (pg or prisma)
   - MongoDB client (mongoose or native)

2. **Add WebSocket Support**
   - Real-time game state updates
   - Live player notifications
   - Queue status streaming

3. **Blockchain Integration**
   - Smart contract for bet escrow
   - Automated payout execution
   - Transaction verification

4. **Security**
   - Wallet signature verification
   - Rate limiting
   - Input validation
   - Fraud detection

5. **Monitoring**
   - Game statistics
   - Player activity tracking
   - Performance metrics
   - Error logging

