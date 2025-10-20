# 🔌 WebSocket Implementation Guide

**Status:** ✅ **IMPLEMENTED**

Real-time game updates for Pop Ma Dice multiplayer backend using Socket.IO.

---

## 📋 Overview

WebSocket enables real-time communication between clients and server for:
- **Live game updates** - See opponent's rolls instantly
- **Queue notifications** - Get matched immediately
- **Leaderboard updates** - Real-time ranking changes
- **Player notifications** - Game invites and results

---

## 🚀 Quick Start

### 1. Server Setup (Next.js)

The WebSocket server is automatically initialized when the app starts.

```typescript
import { getWebSocketServer } from '@/lib/websocket-server';

const ws = getWebSocketServer();
```

### 2. Client Connection (React)

```typescript
import { useWebSocket } from '@/lib/use-websocket';

export function GameComponent() {
  const { isConnected, joinGame, on } = useWebSocket({
    enabled: true,
    onConnect: () => console.log('Connected!'),
  });

  useEffect(() => {
    // Subscribe to game updates
    const unsubscribe = on('game:roll', (message) => {
      console.log('Opponent rolled:', message.data.rolls);
    });

    return unsubscribe;
  }, [on]);

  return <div>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>;
}
```

---

## 📡 Events

### Player Events

#### `player:join`
Join as a player

**Client → Server:**
```json
{
  "playerId": "player_123",
  "address": "0x1234..."
}
```

**Server → Client:**
```json
{
  "type": "player:connected",
  "data": {
    "playerId": "player_123",
    "socketId": "socket_id"
  }
}
```

---

### Game Events

#### `game:join`
Join a game session

**Client → Server:**
```json
{
  "sessionId": "game_123",
  "playerId": "player_123"
}
```

**Server → Client:**
```json
{
  "type": "game:player-joined",
  "data": {
    "playerId": "player_123",
    "sessionId": "game_123"
  }
}
```

#### `game:roll`
Receive roll updates

**Server → Client:**
```json
{
  "type": "game:roll",
  "data": {
    "sessionId": "game_123",
    "playerId": "player_123",
    "rolls": [5, 2],
    "result": "win"
  }
}
```

#### `game:result`
Game finished

**Server → Client:**
```json
{
  "type": "game:result",
  "data": {
    "sessionId": "game_123",
    "result": {
      "gameId": "game_123",
      "winner": "player_123",
      "player1Winnings": "1000000000000000000"
    }
  }
}
```

---

### Queue Events

#### `queue:join`
Join matchmaking queue

**Client → Server:**
```json
{
  "playerId": "player_123",
  "betAmount": "1000000000000000000"
}
```

#### `queue:match`
Match found

**Server → Client:**
```json
{
  "type": "queue:match",
  "data": {
    "matchFound": true,
    "sessionId": "game_123",
    "opponent": "player_456"
  }
}
```

---

### Leaderboard Events

#### `leaderboard:update`
Leaderboard changed

**Server → Client:**
```json
{
  "type": "leaderboard:update",
  "data": {
    "playerId": "player_123",
    "rank": 1,
    "totalWinnings": "5000000000000000000"
  }
}
```

---

## 🎯 Usage Examples

### Example 1: Real-time Game Updates

```typescript
import { useWebSocket } from '@/lib/use-websocket';
import { useEffect, useState } from 'react';

export function GameBoard() {
  const { isConnected, joinGame, on } = useWebSocket();
  const [rolls, setRolls] = useState<number[]>([]);

  useEffect(() => {
    // Subscribe to rolls
    const unsubscribe = on('game:roll', (message) => {
      setRolls(message.data.rolls);
    });

    return unsubscribe;
  }, [on]);

  return (
    <div>
      <p>Status: {isConnected ? '🟢 Live' : '🔴 Offline'}</p>
      <p>Last roll: {rolls.join(', ')}</p>
    </div>
  );
}
```

### Example 2: Matchmaking Queue

```typescript
export function QueueComponent() {
  const { joinQueue, leaveQueue, on } = useWebSocket();
  const [matched, setMatched] = useState(false);

  const handleJoinQueue = () => {
    joinQueue('player_123', '1000000000000000000');
  };

  useEffect(() => {
    const unsubscribe = on('queue:match', (message) => {
      if (message.data.matchFound) {
        setMatched(true);
        console.log('Matched with:', message.data.opponent);
      }
    });

    return unsubscribe;
  }, [on]);

  return (
    <div>
      <button onClick={handleJoinQueue}>Join Queue</button>
      {matched && <p>✅ Match found!</p>}
    </div>
  );
}
```

### Example 3: Leaderboard Updates

```typescript
export function LeaderboardComponent() {
  const { on } = useWebSocket();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const unsubscribe = on('leaderboard:update', (message) => {
      setLeaderboard((prev) => [
        ...prev,
        {
          playerId: message.data.playerId,
          rank: message.data.rank,
          winnings: message.data.totalWinnings,
        },
      ]);
    });

    return unsubscribe;
  }, [on]);

  return (
    <div>
      {leaderboard.map((entry) => (
        <div key={entry.playerId}>
          #{entry.rank} - {entry.playerId}: {entry.winnings}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 API Reference

### useWebSocket Hook

```typescript
const {
  isConnected,        // boolean - Connection status
  isConnecting,       // boolean - Connecting status
  error,              // Error | null - Connection error
  client,             // WebSocketClient - Raw client
  joinPlayer,         // (playerId, address) => void
  joinGame,           // (sessionId, playerId) => void
  leaveGame,          // (sessionId, playerId) => void
  joinQueue,          // (playerId, betAmount) => void
  leaveQueue,         // (playerId) => void
  on,                 // (type, handler) => unsubscribe
  onEvent,            // (event, handler) => unsubscribe
} = useWebSocket(options);
```

### Server Integration

```typescript
import { notifyGameRoll, notifyGameResult } from '@/lib/websocket-integration';

// Notify roll
notifyGameRoll(sessionId, playerId, [5, 2], 'win');

// Notify result
notifyGameResult(result, game);
```

---

## 🛠️ Configuration

### Environment Variables

```env
NEXT_PUBLIC_URL=http://localhost:3000
```

### Socket.IO Options

```typescript
{
  cors: {
    origin: process.env.NEXT_PUBLIC_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
}
```

---

## 📊 Rooms

WebSocket uses rooms for efficient broadcasting:

- `game:{sessionId}` - Game session room
- `player:{playerId}` - Player notifications
- `queue:matchmaking` - Matchmaking queue
- `leaderboard:global` - Global leaderboard
- `notifications:{playerId}` - Player notifications

---

## ✅ Testing

### Test Connection

```bash
# Check WebSocket endpoint
curl http://localhost:3000/api/websocket
```

### Test with Socket.IO Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('player:join', {
    playerId: 'test_player',
    address: '0x1234...',
  });
});

socket.on('message', (message) => {
  console.log('Message:', message);
});
```

---

## 🚀 Next Steps

1. ✅ WebSocket server implemented
2. ✅ Client hook created
3. ⏳ Integrate with game API endpoints
4. ⏳ Add real-time leaderboard
5. ⏳ Add player notifications

---

## 📚 Files

- `lib/websocket-server.ts` - Server implementation
- `lib/websocket-client.ts` - Client implementation
- `lib/use-websocket.ts` - React hook
- `lib/websocket-integration.ts` - Game event integration
- `app/api/websocket/route.ts` - API endpoint

---

## 🎲 Ready for Real-time Gaming!

Your WebSocket infrastructure is now ready for live game updates! 🚀

