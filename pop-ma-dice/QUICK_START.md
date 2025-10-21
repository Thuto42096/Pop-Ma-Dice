# Pop Ma Dice - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd pop-ma-dice
npm install
```

### 2. Start Database
```bash
# Option A: Using Docker (Recommended)
npm run db:start
npm run db:setup

# Option B: Using Local PostgreSQL
# See DATABASE_SETUP_GUIDE.md for instructions
```

### 3. Create Environment File
```bash
# Copy and edit .env.local
cp .env.example .env.local
```

**Required variables:**
```
DATABASE_URL=postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice
NEXT_PUBLIC_DICE_GAME_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### 4. Run Tests
```bash
# All tests
npm test

# Specific tests
npm run test:contracts    # Smart contracts
npm run test:game         # Game engine
npm run test:api          # API endpoints
npm run test:db           # Database (requires running DB)
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Test Results

**Current Status:** ✅ 65/75 tests passing (86.7%)

- ✅ Smart Contracts: 21/21 ✓
- ✅ Game Engine: 11/11 ✓
- ✅ API Endpoints: 18/18 ✓
- ✅ WebSocket: 15/15 ✓
- ⏳ Database: 0/10 (requires running PostgreSQL)

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Database
npm run db:start        # Start Docker database
npm run db:stop         # Stop Docker database
npm run db:setup        # Initialize schema
npm run db:logs         # View database logs

# Linting
npm run lint            # Run ESLint
```

---

## 🎮 Game Features

### Pop Ma Dice Rules
- **Pop (Win):** [5,2], [2,5], [4,3], [3,4], [6,1], [1,6], [6,5], [5,6]
- **Krap (Lose):** [2,1], [1,2], [1,1], [6,6]
- **Continue:** Any other combination

### Game Modes
- **PvP:** Player vs Player
- **PvE:** Player vs Computer

### Features
- 🎲 Dice rolling mechanics
- 💰 Betting system
- 🏆 Leaderboard
- 👥 Multiplayer matchmaking
- 💳 Wallet integration (MetaMask, Coinbase, WalletConnect)
- ⛓️ Smart contract integration (Base network)
- 📊 Real-time updates via WebSocket

---

## 🔗 Wallet Integration

### Supported Wallets
- MetaMask
- Coinbase Wallet
- WalletConnect

### Setup
1. Install wallet extension
2. Create account on Base network
3. Get testnet tokens (if needed)
4. Connect wallet in app

---

## 📁 Project Structure

```
pop-ma-dice/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   ├── game-engine.ts     # Game logic
│   ├── game-types.ts      # Type definitions
│   ├── websocket-*.ts     # WebSocket integration
│   └── smart-contract-*.ts # Contract integration
├── __tests__/             # Test files
├── public/                # Static assets
├── .env.local             # Environment variables
├── jest.config.js         # Jest configuration
├── next.config.mjs        # Next.js configuration
└── package.json           # Dependencies
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if database is running
docker ps

# Start database
npm run db:start

# View logs
npm run db:logs
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Tests Failing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm test
```

### Wallet Connection Issues
1. Ensure wallet extension is installed
2. Switch to Base network
3. Refresh page
4. Check browser console for errors

---

## 📚 Documentation

- `DATABASE_SETUP_GUIDE.md` - Database setup instructions
- `INTEGRATION_TESTING_COMPLETE.md` - Testing report
- `BUILD_AND_TEST_REPORT.md` - Build report
- `API_TESTING_GUIDE.md` - API documentation

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Start database
3. ✅ Run tests
4. ✅ Start dev server
5. ✅ Test wallet connection
6. ✅ Play a game!

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review test files for examples
3. Check browser console for errors
4. Review application logs

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Other Platforms
See deployment documentation for your platform.

---

**Happy Gaming! 🎲**

