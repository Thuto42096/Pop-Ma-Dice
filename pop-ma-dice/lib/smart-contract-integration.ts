// Smart Contract Integration for Claim Winnings
import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { DICE_GAME_ADDRESS, DICE_GAME_ABI, ERC20_ABI, USDC_ADDRESS } from './contracts';

export interface ClaimWinningsContractRequest {
  gameId: string;
  playerAddress: `0x${string}`;
  winningsAmount: bigint;
  tokenAddress: `0x${string}`;
  privateKey?: `0x${string}`;
}

export interface ContractTransactionResult {
  success: boolean;
  txHash: string;
  blockNumber?: number;
  gasUsed?: bigint;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  estimatedCost: bigint;
}

// Initialize clients
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

/**
 * Estimate gas for claiming winnings
 */
export async function estimateClaimWinningsGas(
  gameId: string,
  playerAddress: `0x${string}`,
  winningsAmount: bigint
): Promise<GasEstimate> {
  try {
    // Estimate gas for claimWinnings function
    const gasEstimate = await publicClient.estimateContractGas({
      address: DICE_GAME_ADDRESS,
      abi: DICE_GAME_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(gameId)],
      account: playerAddress,
    });

    // Get current gas price
    const gasPrice = await publicClient.getGasPrice();

    const estimatedCost = gasEstimate * gasPrice;

    return {
      gasLimit: gasEstimate,
      gasPrice,
      estimatedCost,
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
}

/**
 * Claim winnings via smart contract
 */
export async function claimWinningsViaContract(
  request: ClaimWinningsContractRequest
): Promise<ContractTransactionResult> {
  try {
    const { gameId, playerAddress, winningsAmount, tokenAddress, privateKey } = request;

    // Validate inputs
    if (!gameId || !playerAddress || !winningsAmount || !tokenAddress) {
      throw new Error('Missing required parameters');
    }

    // Check if player has sufficient balance
    const balance = await publicClient.getBalance({
      address: playerAddress,
    });

    if (balance < parseEther('0.001')) {
      throw new Error('Insufficient balance for gas fees');
    }

    // Get game state from contract
    const gameState = await publicClient.readContract({
      address: DICE_GAME_ADDRESS,
      abi: DICE_GAME_ABI,
      functionName: 'getGameState',
      args: [BigInt(gameId)],
    });

    if (!gameState || !gameState.finished) {
      throw new Error('Game not finished or does not exist');
    }

    if (!gameState.won) {
      throw new Error('Player did not win this game');
    }

    // Prepare claim transaction
    const encodedData = encodeFunctionData({
      abi: DICE_GAME_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(gameId)],
    });

    // In production, you would sign and send the transaction
    // For now, return a mock result
    const txHash = generateMockTxHash();

    return {
      success: true,
      txHash,
      status: 'pending',
    };
  } catch (error) {
    console.error('Error claiming winnings via contract:', error);
    return {
      success: false,
      txHash: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Claim multiple winnings in batch
 */
export async function claimMultipleWinningsViaContract(
  requests: ClaimWinningsContractRequest[]
): Promise<ContractTransactionResult[]> {
  try {
    const results: ContractTransactionResult[] = [];

    for (const request of requests) {
      const result = await claimWinningsViaContract(request);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error claiming multiple winnings:', error);
    throw error;
  }
}

/**
 * Get player stats from contract
 */
export async function getPlayerStatsFromContract(
  playerAddress: `0x${string}`
): Promise<{
  totalBets: bigint;
  totalWinnings: bigint;
  gamesWon: bigint;
  gamesLost: bigint;
}> {
  try {
    const stats = await publicClient.readContract({
      address: DICE_GAME_ADDRESS,
      abi: DICE_GAME_ABI,
      functionName: 'getPlayerStats',
      args: [playerAddress],
    });

    return {
      totalBets: stats[0],
      totalWinnings: stats[1],
      gamesWon: stats[2],
      gamesLost: stats[3],
    };
  } catch (error) {
    console.error('Error getting player stats from contract:', error);
    throw error;
  }
}

/**
 * Get game state from contract
 */
export async function getGameStateFromContract(gameId: string) {
  try {
    const gameState = await publicClient.readContract({
      address: DICE_GAME_ADDRESS,
      abi: DICE_GAME_ABI,
      functionName: 'getGameState',
      args: [BigInt(gameId)],
    });

    return {
      player: gameState.player,
      betAmount: gameState.betAmount,
      token: gameState.token,
      initialRoll: gameState.initialRoll,
      lastRoll: gameState.lastRoll,
      finished: gameState.finished,
      won: gameState.won,
      winnings: gameState.winnings,
    };
  } catch (error) {
    console.error('Error getting game state from contract:', error);
    throw error;
  }
}

/**
 * Check if winnings have been claimed
 */
export async function isWinningsClaimed(gameId: string): Promise<boolean> {
  try {
    const gameState = await getGameStateFromContract(gameId);
    // If winnings are 0 and game was won, it means already claimed
    return gameState.won && gameState.winnings === BigInt(0);
  } catch (error) {
    console.error('Error checking if winnings claimed:', error);
    return false;
  }
}

/**
 * Verify token approval for contract
 */
export async function verifyTokenApproval(
  playerAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
  amount: bigint
): Promise<boolean> {
  try {
    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [playerAddress, DICE_GAME_ADDRESS],
    });

    return allowance >= amount;
  } catch (error) {
    console.error('Error verifying token approval:', error);
    return false;
  }
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  playerAddress: `0x${string}`,
  tokenAddress: `0x${string}`
): Promise<bigint> {
  try {
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [playerAddress],
    });

    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return BigInt(0);
  }
}

/**
 * Watch for claim transaction confirmation
 */
export async function watchClaimTransaction(
  txHash: string,
  maxWaitTime: number = 60000 // 60 seconds
): Promise<{
  confirmed: boolean;
  blockNumber?: number;
  gasUsed?: bigint;
  status?: 'success' | 'reverted';
}> {
  try {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (receipt) {
        return {
          confirmed: true,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          status: receipt.status === 'success' ? 'success' : 'reverted',
        };
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      confirmed: false,
    };
  } catch (error) {
    console.error('Error watching transaction:', error);
    return {
      confirmed: false,
    };
  }
}

/**
 * Generate mock transaction hash for testing
 */
function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Validate contract address
 */
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format winnings amount for display
 */
export function formatWinningsAmount(amount: bigint): string {
  const eth = Number(amount) / 1e18;
  return eth.toFixed(4);
}

