// jest.setup.js
import '@testing-library/jest-dom'
import fs from 'fs'
import path from 'path'

// Load .env.test file if it exists
const envTestPath = path.join(process.cwd(), '.env.test')
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=')
      if (key && value) {
        process.env[key] = value
      }
    }
  })
}

// Mock environment variables for testing (fallback if not in .env.test)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice'
process.env.NEXT_PUBLIC_DICE_GAME_CONTRACT = process.env.NEXT_PUBLIC_DICE_GAME_CONTRACT || '0x0000000000000000000000000000000000000000'
process.env.NEXT_PUBLIC_BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
process.env.NODE_ENV = 'test'

// Suppress console errors during tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

