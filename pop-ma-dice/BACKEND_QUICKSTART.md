# Backend Quick Start Guide

## Current Status

✅ **Backend infrastructure is ready for development!**

The multiplayer backend is fully implemented with:
- Game engine and logic
- Matchmaking system
- Player management
- Statistics tracking
- API endpoints
- In-memory database (for development)

## Testing the Backend

### 1. Start the Development Server
```bash
cd pop-ma-dice
npm run dev
```

### 2. Test Game Creation (PvE)

```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player1",
    "address": "0x1234567890123456789012345678901234567890",
    "betAmount": "1000000000000000000",
    "mode": "pve"
  }'
```

Response:
```json
{
  "success": true,
  "game": {
    "id": "game_1234567890_abc123",
    "mode": "pve",
    "status": "active",
    "player1": {...},
    "currentRound": 0,
    "totalPot": "1000000000000000000"
  }
}
```

### 3. Play a Round

```bash
curl -X POST http://localhost:3000/api/game/play \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "game_1234567890_abc123"
  }'
```

### 4. Get Game State

```bash
curl http://localhost:3000/api/game/state?gameId=game_1234567890_abc123
```

### 5. Get Player Stats

```bash
curl http://localhost:3000/api/player/stats?playerId=player1&limit=10
```

### 6. Get Leaderboard

```bash
curl http://localhost:3000/api/leaderboard?limit=10
```

## Testing PvP Matchmaking

### Player 1 Joins Queue
```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player1",
    "address": "0x1111111111111111111111111111111111111111",
    "betAmount": "1000000000000000000",
    "mode": "pvp"
  }'
```

Response: `"message": "Added to matchmaking queue..."`

### Player 2 Joins Queue (Same Bet)
```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player2",
    "address": "0x2222222222222222222222222222222222222222",
    "betAmount": "1000000000000000000",
    "mode": "pvp"
  }'
```

Response: `"success": true, "game": {...}` - Match found!

## File Structure

```
pop-ma-dice/
├── lib/
│   ├── game-types.ts          # Type definitions
│   ├── game-engine.ts         # Game logic
│   ├── game-engine.ts         # Game logic
│   ├── db-client.ts           # Database interface
│   ├── db-schema.ts           # Database schemas
│   └── matchmaking.ts         # Matchmaking logic
├── app/api/
│   ├── game/
│   │   ├── create/route.ts    # Create game
│   │   ├── play/route.ts      # Play round
│   │   └── state/route.ts     # Get state
│   ├── player/
│   │   └── stats/route.ts     # Player stats
│   └── leaderboard/route.ts   # Leaderboard
├── BACKEND_ARCHITECTURE.md    # Full documentation
└── BACKEND_QUICKSTART.md      # This file
```

## Next Steps

### Phase 1: Database Integration (Recommended)
1. Choose PostgreSQL or MongoDB
2. Set up database instance
3. Implement database client in `lib/db-client.ts`
4. Run migrations from `lib/db-schema.ts`

### Phase 2: Real-time Updates
1. Add WebSocket support
2. Implement live game state streaming
3. Add player notifications

### Phase 3: Blockchain Integration
1. Deploy smart contract for bet escrow
2. Add wallet signature verification
3. Implement automated payouts

### Phase 4: Security & Monitoring
1. Add rate limiting
2. Implement fraud detection
3. Add comprehensive logging
4. Set up monitoring dashboards

## Common Issues

### "Player already in queue"
- Player is already waiting for a match
- Call `leaveQueue()` first or wait for match

### "Invalid bet amount"
- Bet must be between 0.001 ETH and 1 ETH
- Check `GAME_RULES.MIN_BET` and `MAX_BET`

### "Game not found"
- Game ID is incorrect or game has expired
- Check game ID format: `game_timestamp_random`

## Development Tips

1. **Use Postman or Insomnia** for API testing
2. **Check console logs** for detailed error messages
3. **Monitor database** for data consistency
4. **Test edge cases** like simultaneous requests
5. **Load test** matchmaking with multiple players

## API Response Format

All endpoints return:
```json
{
  "success": true/false,
  "data": {...},
  "error": "error message if failed"
}
```

## Performance Considerations

- In-memory database is suitable for development only
- Matchmaking tolerance: ±10% of bet amount
- Queue cleanup: Removes entries older than 5 minutes
- Max leaderboard entries: 1000

## Support

For issues or questions:
1. Check `BACKEND_ARCHITECTURE.md` for detailed docs
2. Review API endpoint implementations
3. Check game logic in `lib/game-engine.ts`
4. Review database schema in `lib/db-schema.ts`

