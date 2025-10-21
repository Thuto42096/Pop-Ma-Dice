// Game Engine Integration Tests
import { GameEngine } from '../../lib/game-engine'
import { rollDice, determineOutcome } from '../../lib/game-types'

describe('Game Engine Integration Tests', () => {
  describe('Dice Rolling', () => {
    it('should roll two dice with values between 1 and 6', () => {
      const rolls = rollDice()

      expect(rolls).toHaveLength(2)
      expect(rolls[0]).toBeGreaterThanOrEqual(1)
      expect(rolls[0]).toBeLessThanOrEqual(6)
      expect(rolls[1]).toBeGreaterThanOrEqual(1)
      expect(rolls[1]).toBeLessThanOrEqual(6)
    })

    it('should generate different rolls on multiple calls', () => {
      const rolls1 = rollDice()
      const rolls2 = rollDice()
      const rolls3 = rollDice()

      // Very unlikely to get same rolls 3 times in a row
      const allSame =
        rolls1[0] === rolls2[0] && rolls1[1] === rolls2[1] &&
        rolls2[0] === rolls3[0] && rolls2[1] === rolls3[1]

      expect(allSame).toBe(false)
    })
  })

  describe('Game Outcome Determination', () => {
    it('should identify winning rolls (Pop)', () => {
      const winningRolls = [
        [5, 2], [2, 5], [4, 3], [3, 4], [6, 1], [1, 6], [6, 5], [5, 6]
      ]

      winningRolls.forEach(roll => {
        const outcome = determineOutcome(roll as [number, number])
        expect(outcome).toBe('win')
      })
    })

    it('should identify losing rolls (Krap)', () => {
      const losingRolls = [
        [2, 1], [1, 2], [1, 1], [6, 6]
      ]

      losingRolls.forEach(roll => {
        const outcome = determineOutcome(roll as [number, number])
        expect(outcome).toBe('lose')
      })
    })

    it('should identify continue rolls (null outcome)', () => {
      const continueRolls = [
        [2, 3], [3, 2], [4, 4], [5, 5]
      ]

      continueRolls.forEach(roll => {
        const outcome = determineOutcome(roll as [number, number])
        expect(outcome).toBeNull()
      })
    })
  })

  describe('Game Session Creation', () => {
    it('should create a game session correctly', () => {
      const gameSession = GameEngine.createGameSession(
        'player1',
        '0x1234567890123456789012345678901234567890' as `0x${string}`,
        BigInt(1000000000000000000),
        'pvp'
      )

      expect(gameSession).toHaveProperty('id')
      expect(gameSession).toHaveProperty('player1')
      expect(gameSession).toHaveProperty('status')
      expect(gameSession.status).toBe('waiting')
      expect(gameSession.mode).toBe('pvp')
    })

    it('should add second player to game session', () => {
      const gameSession = GameEngine.createGameSession(
        'player1',
        '0x1234567890123456789012345678901234567890' as `0x${string}`,
        BigInt(1000000000000000000),
        'pvp'
      )

      const updatedGame = GameEngine.addPlayer2(
        gameSession,
        'player2',
        '0x0987654321098765432109876543210987654321' as `0x${string}`,
        BigInt(1000000000000000000)
      )

      expect(updatedGame.player2).toBeDefined()
      expect(updatedGame.status).toBe('active')
      expect(updatedGame.totalPot).toBe(BigInt(2000000000000000000))
    })
  })

  describe('Game Rules Validation', () => {
    it('should validate Pop Ma Dice winning rules', () => {
      const winningCombos = [
        [5, 2], [2, 5], [4, 3], [3, 4],
        [6, 1], [1, 6], [6, 5], [5, 6]
      ]

      winningCombos.forEach(combo => {
        const outcome = determineOutcome(combo as [number, number])
        expect(outcome).toBe('win')
      })
    })

    it('should validate Krap losing rules', () => {
      const losingCombos = [
        [2, 1], [1, 2], [1, 1], [6, 6]
      ]

      losingCombos.forEach(combo => {
        const outcome = determineOutcome(combo as [number, number])
        expect(outcome).toBe('lose')
      })
    })

    it('should validate continue rules (null outcome)', () => {
      const continueCombos = [
        [2, 2], [2, 3], [2, 4], [2, 6],
        [3, 3], [3, 5], [3, 6],
        [4, 4], [4, 5], [4, 6],
        [5, 5]
      ]

      continueCombos.forEach(combo => {
        const outcome = determineOutcome(combo as [number, number])
        expect(outcome).toBeNull()
      })
    })
  })

  describe('Game Execution', () => {
    it('should execute a round successfully', () => {
      const gameSession = GameEngine.createGameSession(
        'player1',
        '0x1234567890123456789012345678901234567890' as `0x${string}`,
        BigInt(1000000000000000000),
        'pve'
      )

      // Add player2 to make game active
      const activeGame = GameEngine.addPlayer2(
        gameSession,
        'player2',
        '0x0987654321098765432109876543210987654321' as `0x${string}`,
        BigInt(1000000000000000000)
      )

      const updatedGame = GameEngine.executeRound(activeGame)

      expect(updatedGame.player1.rolls.length).toBeGreaterThan(0)
      expect(updatedGame.currentRound).toBeGreaterThanOrEqual(0)
    })
  })
})

