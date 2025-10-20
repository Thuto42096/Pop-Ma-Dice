// POST /api/winnings/claim - Claim winnings for a specific game

import { NextRequest, NextResponse } from 'next/server';
import { claimGameWinnings, validateClaimRequest } from '@/lib/claim-winnings';
import { notifyPlayerStatsUpdate } from '@/lib/websocket-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, gameId, address } = body;

    // Validate request
    const validation = validateClaimRequest({ playerId, gameId, address });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Claim winnings
    const result = await claimGameWinnings({
      playerId,
      gameId,
      address,
    });

    // Notify player of successful claim
    notifyPlayerStatsUpdate(playerId, {
      winningsClaimed: result.winningsAmount,
      txHash: result.txHash,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error claiming winnings:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to claim winnings',
      },
      { status: 500 }
    );
  }
}

