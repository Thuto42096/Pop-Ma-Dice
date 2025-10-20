# Pop Ma Dice - Frontend Components

## Overview

Complete set of React components for the Pop Ma Dice multiplayer dice game frontend. All components are built with TypeScript, Tailwind CSS, and integrate with WebSocket for real-time updates.

## Components

### 1. **GameBoard** (`app/components/GameBoard.tsx`)

Main game board component for displaying active games.

**Features:**
- Real-time game state updates via WebSocket
- Display player rolls and game results
- Support for PvE and PvP modes
- Live roll history

**Props:**
```typescript
interface GameBoardProps {
  gameId: string;
  playerId: string;
  opponentId?: string;
  mode: 'pve' | 'pvp';
}
```

**Usage:**
```tsx
<GameBoard 
  gameId="game_123" 
  playerId="player_456" 
  opponentId="player_789"
  mode="pvp" 
/>
```

---

### 2. **Leaderboard** (`app/components/Leaderboard.tsx`)

Displays top players ranked by winnings and win rate.

**Features:**
- Top 10 players display
- Real-time ranking updates
- Win/loss statistics
- Win rate percentage
- Medal indicators (🥇🥈🥉)

**Usage:**
```tsx
<Leaderboard />
```

**Real-time Events:**
- `leaderboard:update` - Updates when player rankings change

---

### 3. **ClaimWinnings** (`app/components/ClaimWinnings.tsx`)

Component for claiming earned winnings from completed games.

**Features:**
- Display unclaimed winnings
- List pending claims
- Gas estimation
- Claim single or all winnings
- Transaction status display

**Usage:**
```tsx
<ClaimWinnings />
```

**Requires:**
- Connected wallet (wagmi)
- Smart contract integration

---

### 4. **PlayerStats** (`app/components/PlayerStats.tsx`)

Displays comprehensive player statistics and game history.

**Features:**
- Total winnings and bets
- Win/loss/draw counts
- Win rate percentage
- Recent games list
- Real-time stats updates

**Usage:**
```tsx
<PlayerStats />
```

**Real-time Events:**
- `player:stats` - Updates when player stats change

---

### 5. **QueueStatus** (`app/components/QueueStatus.tsx`)

Matchmaking queue interface for PvP games.

**Features:**
- Join/leave queue
- Bet amount selection
- Queue size display
- Match found notifications
- Queue tips and information

**Usage:**
```tsx
<QueueStatus />
```

**Real-time Events:**
- `queue:update` - Queue size changes
- `queue:match` - Match found notification

---

### 6. **GameHistory** (`app/components/GameHistory.tsx`)

Displays player's game history with filtering and pagination.

**Features:**
- Filter by result (all/wins/losses)
- Pagination (10 items per page)
- Game details (opponent, bet, winnings, rolls)
- Claim status indicator
- Transaction hash display

**Usage:**
```tsx
<GameHistory />
```

---

### 7. **Dashboard** (`app/dashboard/page.tsx`)

Main dashboard page combining all components.

**Features:**
- Tab-based navigation
- Wallet connection
- All components in one place
- Responsive design
- Dark theme

**Tabs:**
1. My Stats - Player statistics
2. Leaderboard - Top players
3. Claim Winnings - Claim earnings
4. Matchmaking - Join queue
5. Game History - Past games

**Usage:**
Navigate to `/dashboard` in your app.

---

## Integration Guide

### 1. WebSocket Integration

All components use the `useWebSocket` hook for real-time updates:

```typescript
import { useWebSocket } from '@/lib/use-websocket';

const { on, joinGame, joinQueue, leaveQueue } = useWebSocket();

// Listen for events
const unsubscribe = on('game:roll', (msg) => {
  console.log('Roll:', msg.data);
});

// Clean up
return unsubscribe;
```

### 2. Wallet Integration

Components use `wagmi` for wallet connection:

```typescript
import { useAccount } from 'wagmi';

const { address, isConnected } = useAccount();
```

### 3. Smart Contract Integration

ClaimWinnings component uses smart contract hooks:

```typescript
import { useSmartContract } from '@/lib/use-smart-contract';
import { useClaimWinnings } from '@/lib/use-claim-winnings';

const { estimateGas, getGameState } = useSmartContract();
const { claimAllWinnings, getUnclaimedWinnings } = useClaimWinnings();
```

---

## Real-time Events

### WebSocket Events

**Game Events:**
- `game:created` - Game started
- `game:roll` - Roll executed
- `game:result` - Game finished

**Queue Events:**
- `queue:update` - Queue size changed
- `queue:match` - Match found

**Player Events:**
- `player:stats` - Stats updated
- `leaderboard:update` - Rankings changed

---

## Styling

All components use **Tailwind CSS** with:
- Responsive design
- Dark/light theme support
- Smooth animations
- Gradient backgrounds
- Shadow effects

### Custom Animations

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-in-out; }
```

---

## Component Tree

```
Dashboard
├── Header (Wallet Connection)
├── Tab Navigation
└── Tab Content
    ├── PlayerStats
    │   ├── Player Info
    │   ├── Stats Grid
    │   └── Recent Games
    ├── Leaderboard
    │   └── Rankings Table
    ├── ClaimWinnings
    │   ├── Unclaimed Summary
    │   ├── Gas Estimate
    │   ├── Pending Claims
    │   └── Action Buttons
    ├── QueueStatus
    │   ├── Queue Info
    │   ├── Bet Input
    │   └── Join/Leave Buttons
    └── GameHistory
        ├── Filter Buttons
        ├── Games Table
        └── Pagination
```

---

## API Endpoints Used

- `GET /api/leaderboard` - Fetch leaderboard
- `GET /api/player/stats` - Fetch player stats
- `GET /api/game/history` - Fetch game history
- `GET /api/winnings/unclaimed` - Fetch unclaimed winnings
- `GET /api/winnings/estimate-gas` - Estimate gas
- `POST /api/winnings/claim` - Claim winnings
- `POST /api/winnings/claim-all` - Claim all winnings

---

## Error Handling

All components include:
- Loading states
- Error messages
- Fallback UI
- Graceful degradation

---

## Performance

- Lazy loading of components
- Memoization where needed
- Efficient re-renders
- Pagination for large lists
- WebSocket connection pooling

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Export game history to CSV
- [ ] Advanced filtering options
- [ ] Player search functionality
- [ ] Achievement badges
- [ ] Replay game feature
- [ ] Social features (friends, chat)
- [ ] Mobile app version

---

## Troubleshooting

### Components not updating in real-time
- Check WebSocket connection status
- Verify event names match backend
- Check browser console for errors

### Wallet not connecting
- Ensure MetaMask/wallet extension is installed
- Check network is set to Base
- Clear browser cache and try again

### Data not loading
- Check API endpoints are running
- Verify player ID is correct
- Check network tab for failed requests

---

## Contributing

When adding new components:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Include loading states
5. Document props and usage
6. Add WebSocket integration if needed
7. Test on mobile devices

---

## License

MIT License - See LICENSE file for details

