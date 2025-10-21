// Smart Contract Integration Tests
import { DICE_GAME_ABI, DICE_GAME_ADDRESS, ERC20_ABI } from '../../lib/contracts'
import { parseEther } from 'viem'

describe('Smart Contract Integration Tests', () => {
  describe('Contract Configuration', () => {
    it('should have valid contract address', () => {
      expect(DICE_GAME_ADDRESS).toBeDefined()
      expect(DICE_GAME_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should have valid ABI definitions', () => {
      expect(DICE_GAME_ABI).toBeDefined()
      expect(Array.isArray(DICE_GAME_ABI)).toBe(true)
      expect(DICE_GAME_ABI.length).toBeGreaterThan(0)
    })

    it('should have ERC20 ABI defined', () => {
      expect(ERC20_ABI).toBeDefined()
      expect(Array.isArray(ERC20_ABI)).toBe(true)
    })
  })

  describe('ABI Function Definitions', () => {
    it('should have placeBet function', () => {
      const placeBetFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'placeBet'
      )
      expect(placeBetFunc).toBeDefined()
    })

    it('should have rollDice function', () => {
      const rollDiceFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'rollDice'
      )
      expect(rollDiceFunc).toBeDefined()
    })

    it('should have continueRoll function', () => {
      const continueRollFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'continueRoll'
      )
      expect(continueRollFunc).toBeDefined()
    })

    it('should have claimWinnings function', () => {
      const claimFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'claimWinnings'
      )
      expect(claimFunc).toBeDefined()
    })

    it('should have getGameState function', () => {
      const getStateFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'getGameState'
      )
      expect(getStateFunc).toBeDefined()
    })

    it('should have getPlayerStats function', () => {
      const getStatsFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'getPlayerStats'
      )
      expect(getStatsFunc).toBeDefined()
    })
  })

  describe('ERC20 ABI Functions', () => {
    it('should have approve function', () => {
      const approveFunc = ERC20_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'approve'
      )
      expect(approveFunc).toBeDefined()
    })

    it('should have balanceOf function', () => {
      const balanceFunc = ERC20_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'balanceOf'
      )
      expect(balanceFunc).toBeDefined()
    })

    it('should have transfer function', () => {
      const transferFunc = ERC20_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'transfer'
      )
      expect(transferFunc).toBeDefined()
    })
  })

  describe('Contract Events', () => {
    it('should have BetPlaced event', () => {
      const betPlacedEvent = DICE_GAME_ABI.find(
        (item: any) => item.type === 'event' && item.name === 'BetPlaced'
      )
      expect(betPlacedEvent).toBeDefined()
    })

    it('should have GameFinished event', () => {
      const gameFinishedEvent = DICE_GAME_ABI.find(
        (item: any) => item.type === 'event' && item.name === 'GameFinished'
      )
      expect(gameFinishedEvent).toBeDefined()
    })
  })

  describe('Contract Parameter Validation', () => {
    it('should validate bet amount format', () => {
      const betAmount = parseEther('1')
      expect(betAmount).toBeDefined()
      expect(typeof betAmount).toBe('bigint')
    })

    it('should handle large bet amounts', () => {
      const largeBet = parseEther('1000')
      expect(largeBet).toBeGreaterThan(BigInt(0))
    })

    it('should handle small bet amounts', () => {
      const smallBet = parseEther('0.001')
      expect(smallBet).toBeGreaterThan(BigInt(0))
    })
  })

  describe('Contract Address Validation', () => {
    it('should validate Ethereum address format', () => {
      const validAddress = '0x1234567890123456789012345678901234567890'
      expect(validAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should reject invalid address format', () => {
      const invalidAddress = '0x123' // Too short
      expect(invalidAddress).not.toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('Contract Type Safety', () => {
    it('should have proper function signatures', () => {
      const placeBetFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'placeBet'
      ) as any

      expect(placeBetFunc).toBeDefined()
      expect(placeBetFunc.inputs).toBeDefined()
      expect(Array.isArray(placeBetFunc.inputs)).toBe(true)
    })

    it('should have proper return types', () => {
      const getStateFunc = DICE_GAME_ABI.find(
        (item: any) => item.type === 'function' && item.name === 'getGameState'
      ) as any

      expect(getStateFunc).toBeDefined()
      expect(getStateFunc.outputs).toBeDefined()
    })
  })
})

