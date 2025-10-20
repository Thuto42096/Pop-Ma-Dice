# 🎲 API Testing Guide

Quick reference for testing Pop Ma Dice API endpoints.

---

## 🚀 Quick Start

### 1. Verify Server is Running
```bash
curl http://localhost:3000/api/leaderboard?limit=1
```

### 2. Create a Game
```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player_1",
    "address": "0x1234567890123456789012345678901234567890",
    "betAmount": "1000000000000000000",
    "mode": "pve"
  }'
```

### 3. Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard?limit=10
```

### 4. Get Player Stats
```bash
curl http://localhost:3000/api/player/stats?playerId=player_1
```

---

## 📊 API Endpoints

### POST /api/game/create
**Create a new game**

**Request:**
```json
{
  "playerId": "string",
  "address": "string (0x...)",
  "betAmount": "string (wei)",
  "mode": "pve" | "pvp"
}
```

**Response:**
```json
{
  "sessionId": "string",
  "player1Id": "string",
  "player2Id": "string | null",
  "betAmount": "string",
  "mode": "string",
  "status": "active"
}
```

---

### POST /api/game/play
**Play a game turn**

**Request:**
```json
{
  "sessionId": "string",
  "playerId": "string",
  "rollCount": 1 | 2
}
```

**Response:**
```json
{
  "sessionId": "string",
  "rolls": [number, number],
  "result": "win" | "lose" | "continue",
  "winnings": "string | null"
}
```

---

### GET /api/game/state
**Get current game state**

**Query Parameters:**
- `sessionId` (required): Game session ID

**Response:**
```json
{
  "sessionId": "string",
  "player1Id": "string",
  "player2Id": "string | null",
  "status": "active" | "completed",
  "betAmount": "string",
  "mode": "string"
}
```

---

### GET /api/leaderboard
**Get leaderboard**

**Query Parameters:**
- `limit` (optional, default: 10): Number of players to return

**Response:**
```json
{
  "leaderboard": [
    {
      "playerId": "string",
      "address": "string",
      "wins": number,
      "losses": number,
      "draws": number,
      "totalWinnings": "string"
    }
  ]
}
```

---

### GET /api/player/stats
**Get player statistics**

**Query Parameters:**
- `playerId` (required): Player ID

**Response:**
```json
{
  "playerId": "string",
  "address": "string",
  "wins": number,
  "losses": number,
  "draws": number,
  "totalWinnings": "string",
  "createdAt": "ISO 8601 timestamp"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Single Player Game (PvE)
```bash
# Create game
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test_player",
    "address": "0x1111111111111111111111111111111111111111",
    "betAmount": "1000000000000000000",
    "mode": "pve"
  }'

# Play game (replace SESSION_ID)
curl -X POST http://localhost:3000/api/game/play \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID",
    "playerId": "test_player",
    "rollCount": 2
  }'
```

### Scenario 2: Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard?limit=5
```

### Scenario 3: Get Player Stats
```bash
curl http://localhost:3000/api/player/stats?playerId=test_player
```

---

## 🔍 Debugging

### Check Database Connection
```bash
node verify-db.mjs
```

### Check Server Logs
```bash
# Terminal running: npm run dev
# Look for errors in the output
```

### Test Database Directly
```bash
DATABASE_URL="postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice" \
npx ts-node scripts/migrate-db.ts
```

---

## 📝 Notes

- All amounts are in **wei** (smallest unit of ETH)
- 1 ETH = 1000000000000000000 wei
- Player IDs must be unique
- Addresses must be valid Ethereum addresses (0x...)
- Session IDs are auto-generated UUIDs

---

## ✅ Success Indicators

- ✅ Server responds to requests
- ✅ Database stores game data
- ✅ Leaderboard updates correctly
- ✅ Player stats are tracked
- ✅ Game logic executes properly

