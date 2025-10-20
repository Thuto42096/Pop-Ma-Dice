# Wallet Integration Guide

## Overview

Complete wallet integration for Pop Ma Dice using Wagmi, Viem, and Coinbase OnchainKit. Supports MetaMask, Coinbase Wallet, and WalletConnect.

---

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

**Required Variables:**

```env
# OnchainKit API Key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Base Network RPC URL
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Smart Contract Address
NEXT_PUBLIC_DICE_GAME_CONTRACT=0x...
```

### 2. Get API Keys

**OnchainKit API Key:**
1. Visit https://onchainkit.xyz
2. Sign up and create a project
3. Copy your API key

**WalletConnect Project ID:**
1. Visit https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID

---

## Components

### WalletConnect Component

Main wallet connection component with balance display and chain switching.

**Usage:**

```tsx
import { WalletConnect } from '@/app/components/WalletConnect';

export function MyApp() {
  return (
    <div>
      <WalletConnect 
        showBalance={true}
        compact={false}
      />
    </div>
  );
}
```

**Props:**

```typescript
interface WalletConnectProps {
  className?: string;      // Custom CSS classes
  showBalance?: boolean;   // Show ETH balance (default: true)
  compact?: boolean;       // Compact mode (default: false)
}
```

### WalletConnectButton

Minimal wallet button without balance display.

```tsx
import { WalletConnectButton } from '@/app/components/WalletConnect';

export function Header() {
  return <WalletConnectButton />;
}
```

---

## Hooks

### useWallet

Main hook for wallet state and operations.

**Usage:**

```typescript
import { useWallet } from '@/lib/use-wallet';

export function MyComponent() {
  const {
    address,           // Wallet address
    isConnected,       // Connection status
    chainId,           // Current chain ID
    isCorrectChain,    // Is on Base network
    balance,           // ETH balance
    balanceLoading,    // Balance loading state
    balanceError,      // Balance error
    switchToBase,      // Switch to Base chain
    formatBalance,     // Format balance string
    isReady,           // Component ready
  } = useWallet();

  return (
    <div>
      {isConnected ? (
        <>
          <p>Address: {address}</p>
          <p>Balance: {formatBalance(balance || '0')} ETH</p>
          {!isCorrectChain && (
            <button onClick={() => switchToBase()}>
              Switch to Base
            </button>
          )}
        </>
      ) : (
        <p>Connect wallet to continue</p>
      )}
    </div>
  );
}
```

### useEnsureCorrectChain

Automatically switches to Base network if needed.

```typescript
import { useEnsureCorrectChain } from '@/lib/use-wallet';

export function GameComponent() {
  const { isCorrectChain } = useEnsureCorrectChain();

  if (!isCorrectChain) {
    return <p>Switching to Base network...</p>;
  }

  return <div>Game content</div>;
}
```

### useValidateAddress

Validates Ethereum address format.

```typescript
import { useValidateAddress } from '@/lib/use-wallet';

const isValid = useValidateAddress('0x...');
```

### useWalletDisplayName

Gets shortened wallet address for display.

```typescript
import { useWalletDisplayName } from '@/lib/use-wallet';

const displayName = useWalletDisplayName(address);
// Returns: "0x1234...5678"
```

---

## Provider Setup

The wallet provider is configured in `app/providers.tsx`:

```typescript
import { WagmiProvider, createConfig } from 'wagmi';
import { coinbaseWallet, metaMaskWallet, walletConnectWallet } from '@wagmi/connectors';
import { base } from 'wagmi/chains';

const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ appName: 'Pop Ma Dice' }),
    metaMaskWallet(),
    walletConnectWallet({ projectId: '...' }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});
```

---

## Supported Wallets

✅ **Coinbase Wallet** - Native support  
✅ **MetaMask** - Full support  
✅ **WalletConnect** - Multi-chain support  

---

## Smart Contract Integration

### Contract Configuration

Located in `lib/contracts.ts`:

```typescript
export const DICE_GAME_ADDRESS = '0x...';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export const DICE_GAME_ABI = parseAbi([
  'function placeBet(uint256 amount, address token) payable returns (uint256 gameId)',
  'function claimWinnings(uint256 gameId) returns (uint256 amount)',
  // ... more functions
]);
```

### Creating Transactions

```typescript
import { createBetTransaction } from '@/lib/contracts';

const calls = createBetTransaction(
  '0.1',                    // bet amount
  USDC_ADDRESS,             // token address
  false                      // isNative
);
```

---

## Error Handling

### Chain Switching Errors

```typescript
const { switchToBase } = useWallet();

try {
  await switchToBase();
} catch (error) {
  console.error('Failed to switch chain:', error);
  // Show error to user
}
```

### Balance Fetching Errors

```typescript
const { balanceError } = useWallet();

if (balanceError) {
  console.error('Failed to fetch balance:', balanceError);
}
```

---

## Testing

### Local Testing

1. Install MetaMask or Coinbase Wallet extension
2. Create a test wallet
3. Switch to Base network
4. Get test ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Testnet Configuration

For Base Sepolia testnet:

```typescript
import { baseSepolia } from 'wagmi/chains';

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});
```

---

## Security Best Practices

✅ **Never expose private keys** - Always use wallet extensions  
✅ **Validate addresses** - Use `useValidateAddress` hook  
✅ **Check chain ID** - Ensure on correct network  
✅ **Handle errors gracefully** - Show user-friendly messages  
✅ **Use HTTPS** - Always in production  
✅ **Verify contracts** - Check contract addresses  

---

## Troubleshooting

### Wallet not connecting

1. Check browser console for errors
2. Ensure wallet extension is installed
3. Try refreshing the page
4. Clear browser cache

### Wrong network

1. Use `switchToBase()` to switch automatically
2. Or manually switch in wallet extension
3. Verify `NEXT_PUBLIC_BASE_RPC_URL` is correct

### Balance not showing

1. Check wallet has ETH
2. Verify RPC URL is working
3. Check network connection
4. Try refreshing page

### Transaction failing

1. Check gas price
2. Verify contract address
3. Check token approval
4. Ensure sufficient balance

---

## Advanced Usage

### Custom Wallet Configuration

```typescript
import { createConfig } from 'wagmi';
import { custom } from '@wagmi/connectors';

const config = createConfig({
  connectors: [
    custom({
      id: 'my-wallet',
      name: 'My Wallet',
      type: 'injected',
      async connect() {
        // Custom connection logic
      },
    }),
  ],
});
```

### Transaction Monitoring

```typescript
import { useWaitForTransactionReceipt } from 'wagmi';

const { data: receipt } = useWaitForTransactionReceipt({
  hash: txHash,
});
```

---

## Resources

- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Base Network Docs](https://docs.base.org)
- [Coinbase Wallet SDK](https://docs.coinbase.com/wallet-sdk)

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review component examples
3. Check browser console for errors
4. Visit documentation links above

