// POST /api/winnings/claim-all - Claim all unclaimed winnings for a player

import { NextRequest, NextResponse } from 'next/server';
import { claimAllWinnings } from '@/lib/claim-winnings';
import { notifyPlayerStatsUpdate } from '@/lib/websocket-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, address } = body;

    // Validate input
    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Valid Ethereum address is required' },
        { status: 400 }
      );
    }

    // Claim all winnings
    const result = await claimAllWinnings(playerId, address);

    // Notify player of successful claims
    if (result.gamesClaimed > 0) {
      notifyPlayerStatsUpdate(playerId, {
        totalWinningsClaimed: result.totalClaimed,
        gamesClaimed: result.gamesClaimed,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error claiming all winnings:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to claim winnings',
      },
      { status: 500 }
    );
  }
}

