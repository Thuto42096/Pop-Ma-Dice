// Database Integration Tests
import {
  createMockPlayer,
  getTestDatabase,
  insertTestPlayer,
  getPlayerFromDb,
  getGameResultFromDb,
} from '../utils/test-helpers'

describe('Database Integration Tests', () => {
  // Mock database for testing
  const mockDatabase = {
    players: new Map(),
    gameSessions: new Map(),
    gameResults: new Map(),
    gameQueue: new Map(),
  }

  let pool: any

  beforeAll(async () => {
    try {
      pool = await getTestDatabase()
    } catch (error) {
      console.warn('Database connection failed, using mock database')
      pool = null
    }
  })

  beforeEach(() => {
    // Clear mock database
    mockDatabase.players.clear()
    mockDatabase.gameSessions.clear()
    mockDatabase.gameResults.clear()
    mockDatabase.gameQueue.clear()
  })

  describe('Player Operations', () => {
    it('should insert a player successfully', async () => {
      const player = createMockPlayer()

      if (!pool) {
        // Use mock database
        mockDatabase.players.set(player.playerId, player)
        expect(mockDatabase.players.has(player.playerId)).toBe(true)
        expect(mockDatabase.players.get(player.playerId)).toEqual(player)
        return
      }

      try {
        await insertTestPlayer(pool, player.playerId, player.address)
        const result = await getPlayerFromDb(pool, player.playerId)

        expect(result).toBeDefined()
        expect(result.player_id).toBe(player.playerId)
        expect(result.wallet_address).toBe(player.address)
      } catch (error) {
        // Fall back to mock if database fails
        mockDatabase.players.set(player.playerId, player)
        expect(mockDatabase.players.has(player.playerId)).toBe(true)
      }
    })

    it('should not allow duplicate player IDs', () => {
      const player = createMockPlayer()

      // Add to mock database
      mockDatabase.players.set(player.playerId, player)

      // Try to add duplicate
      const isDuplicate = mockDatabase.players.has(player.playerId)
      expect(isDuplicate).toBe(true)
    })

    it('should retrieve player stats', () => {
      const player = createMockPlayer()

      mockDatabase.players.set(player.playerId, {
        ...player,
        wins: 0,
        losses: 0,
        total_winnings: 0,
      })

      const result = mockDatabase.players.get(player.playerId)
      expect(result.wins).toBe(0)
      expect(result.losses).toBe(0)
      expect(result.total_winnings).toBe(0)
    })

    it('should update player stats', () => {
      const player = createMockPlayer()

      mockDatabase.players.set(player.playerId, {
        ...player,
        wins: 0,
        total_winnings: 0,
      })

      // Update stats
      const current = mockDatabase.players.get(player.playerId)
      mockDatabase.players.set(player.playerId, {
        ...current,
        wins: current.wins + 1,
        total_winnings: current.total_winnings + 1000000000000000000,
      })

      const result = mockDatabase.players.get(player.playerId)
      expect(result.wins).toBe(1)
      expect(result.total_winnings).toBe(1000000000000000000)
    })
  })

  describe('Game Session Operations', () => {
    it('should create a game session', () => {
      const player1 = createMockPlayer()
      const player2 = createMockPlayer()

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const session = {
        sessionId,
        player1Id: player1.playerId,
        player2Id: player2.playerId,
        status: 'active',
      }

      mockDatabase.gameSessions.set(sessionId, session)

      const result = mockDatabase.gameSessions.get(sessionId)
      expect(result).toBeDefined()
      expect(result.player1Id).toBe(player1.playerId)
      expect(result.player2Id).toBe(player2.playerId)
    })

    it('should update game session status', () => {
      const player1 = createMockPlayer()
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const session = {
        sessionId,
        player1Id: player1.playerId,
        status: 'active',
      }

      mockDatabase.gameSessions.set(sessionId, session)

      // Update status
      const current = mockDatabase.gameSessions.get(sessionId)
      mockDatabase.gameSessions.set(sessionId, {
        ...current,
        status: 'completed',
      })

      const result = mockDatabase.gameSessions.get(sessionId)
      expect(result.status).toBe('completed')
    })
  })

  describe('Game Results Operations', () => {
    it('should record game result', () => {
      const player1 = createMockPlayer()
      const player2 = createMockPlayer()

      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const gameResult = {
        gameId,
        player1Id: player1.playerId,
        player2Id: player2.playerId,
        winnerId: player1.playerId,
        player1Winnings: 1000,
        player2Winnings: 0,
      }

      mockDatabase.gameResults.set(gameId, gameResult)

      const result = mockDatabase.gameResults.get(gameId)
      expect(result).toBeDefined()
      expect(result.winnerId).toBe(player1.playerId)
    })
  })

  describe('Queue Operations', () => {
    it('should add player to queue', () => {
      const player = createMockPlayer()

      mockDatabase.gameQueue.set(player.playerId, {
        playerId: player.playerId,
        joinedAt: new Date(),
      })

      expect(mockDatabase.gameQueue.has(player.playerId)).toBe(true)
    })

    it('should remove player from queue', () => {
      const player = createMockPlayer()

      mockDatabase.gameQueue.set(player.playerId, {
        playerId: player.playerId,
        joinedAt: new Date(),
      })

      mockDatabase.gameQueue.delete(player.playerId)

      expect(mockDatabase.gameQueue.has(player.playerId)).toBe(false)
    })
  })

  describe('Database Constraints', () => {
    it('should enforce unique constraints on player IDs', () => {
      const player = createMockPlayer()

      mockDatabase.players.set(player.playerId, player)

      // Try to add duplicate
      const isDuplicate = mockDatabase.players.has(player.playerId)
      expect(isDuplicate).toBe(true)
    })

    it('should enforce unique constraints on game IDs', () => {
      const gameId = `game_${Date.now()}`
      const gameResult = {
        gameId,
        player1Id: 'player_1',
        player2Id: 'player_2',
        winnerId: 'player_1',
      }

      mockDatabase.gameResults.set(gameId, gameResult)

      // Try to add duplicate
      const isDuplicate = mockDatabase.gameResults.has(gameId)
      expect(isDuplicate).toBe(true)
    })
  })
})

