// GET /api/winnings/estimate-gas - Estimate gas for claiming winnings

import { NextRequest, NextResponse } from 'next/server';
import { estimateClaimWinningsGas } from '@/lib/smart-contract-integration';

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');
    const playerAddress = request.nextUrl.searchParams.get('playerAddress');
    const winningsAmount = request.nextUrl.searchParams.get('winningsAmount');

    if (!gameId || !playerAddress || !winningsAmount) {
      return NextResponse.json(
        { error: 'gameId, playerAddress, and winningsAmount are required' },
        { status: 400 }
      );
    }

    if (!playerAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Estimate gas
    const estimate = await estimateClaimWinningsGas(
      gameId,
      playerAddress as `0x${string}`,
      BigInt(winningsAmount)
    );

    return NextResponse.json({
      success: true,
      gameId,
      playerAddress,
      winningsAmount,
      gasLimit: estimate.gasLimit.toString(),
      gasPrice: estimate.gasPrice.toString(),
      estimatedCost: estimate.estimatedCost.toString(),
      estimatedCostEth: (Number(estimate.estimatedCost) / 1e18).toFixed(6),
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to estimate gas',
      },
      { status: 500 }
    );
  }
}

