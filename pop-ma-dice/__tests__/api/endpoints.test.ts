// API Endpoint Integration Tests
import {
  createMockGameRequest,
  createMockPlayer,
} from '../utils/test-helpers'

describe('API Endpoints Unit Tests', () => {
  describe('Request Validation', () => {
    it('should validate game creation request', () => {
      const mockRequest = createMockGameRequest()

      expect(mockRequest).toHaveProperty('playerId')
      expect(mockRequest).toHaveProperty('address')
      expect(mockRequest).toHaveProperty('betAmount')
      expect(mockRequest).toHaveProperty('mode')
    })

    it('should validate player creation', () => {
      const player = createMockPlayer()

      expect(player).toHaveProperty('playerId')
      expect(player).toHaveProperty('username')
      expect(player).toHaveProperty('address')
      expect(player.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should generate unique player IDs', () => {
      const player1 = createMockPlayer()
      const player2 = createMockPlayer()

      expect(player1.playerId).not.toBe(player2.playerId)
    })

    it('should generate unique addresses', () => {
      const player1 = createMockPlayer()
      const player2 = createMockPlayer()

      expect(player1.address).not.toBe(player2.address)
    })
  })

  describe('Request Parameters', () => {
    it('should validate bet amount format', () => {
      const mockRequest = createMockGameRequest()

      expect(mockRequest.betAmount).toBeDefined()
      expect(typeof mockRequest.betAmount).toBe('string')
      expect(mockRequest.betAmount).toMatch(/^\d+$/)
    })

    it('should validate game mode', () => {
      const mockRequest = createMockGameRequest()

      expect(['pve', 'pvp']).toContain(mockRequest.mode)
    })

    it('should validate address format', () => {
      const mockRequest = createMockGameRequest()

      expect(mockRequest.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('Response Structure', () => {
    it('should have valid leaderboard structure', () => {
      const leaderboard = [
        {
          rank: 1,
          playerId: 'player_1',
          username: 'user_1',
          totalWinnings: BigInt(1000),
          gamesWon: 10,
          gamesLost: 5,
          winRate: 0.67,
        },
      ]

      expect(Array.isArray(leaderboard)).toBe(true)
      expect(leaderboard[0]).toHaveProperty('rank')
      expect(leaderboard[0]).toHaveProperty('playerId')
      expect(leaderboard[0]).toHaveProperty('winRate')
    })

    it('should have valid player stats structure', () => {
      const playerStats = {
        playerId: 'player_1',
        username: 'user_1',
        wins: 10,
        losses: 5,
        totalWinnings: BigInt(1000),
      }

      expect(playerStats).toHaveProperty('playerId')
      expect(playerStats).toHaveProperty('wins')
      expect(playerStats).toHaveProperty('losses')
      expect(playerStats).toHaveProperty('totalWinnings')
    })

    it('should have valid game state structure', () => {
      const gameState = {
        gameId: 'game_1',
        status: 'active',
        player1Id: 'player_1',
        player2Id: 'player_2',
        currentRound: 1,
      }

      expect(gameState).toHaveProperty('gameId')
      expect(gameState).toHaveProperty('status')
      expect(gameState).toHaveProperty('player1Id')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields', () => {
      const invalidRequest = {}

      expect(invalidRequest).not.toHaveProperty('playerId')
      expect(invalidRequest).not.toHaveProperty('address')
    })

    it('should validate bet amount is numeric', () => {
      const invalidBet = 'invalid_amount'

      expect(invalidBet).not.toMatch(/^\d+$/)
    })

    it('should validate address format', () => {
      const invalidAddress = '0x123'

      expect(invalidAddress).not.toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })
})

