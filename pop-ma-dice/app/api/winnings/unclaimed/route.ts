// GET /api/winnings/unclaimed - Get unclaimed winnings for a player

import { NextRequest, NextResponse } from 'next/server';
import { getClaimStatus } from '@/lib/claim-winnings';

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Get claim status
    const status = await getClaimStatus(playerId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Error getting unclaimed winnings:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get unclaimed winnings',
      },
      { status: 500 }
    );
  }
}

