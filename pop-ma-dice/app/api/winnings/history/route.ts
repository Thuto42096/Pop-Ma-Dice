// GET /api/winnings/history - Get winnings history for a player

import { NextRequest, NextResponse } from 'next/server';
import { getWinningsHistory } from '@/lib/claim-winnings';

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId');
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '50'),
      500
    );

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Get winnings history
    const history = await getWinningsHistory(playerId, limit);

    return NextResponse.json({
      success: true,
      ...history,
    });
  } catch (error) {
    console.error('Error getting winnings history:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get winnings history',
      },
      { status: 500 }
    );
  }
}

