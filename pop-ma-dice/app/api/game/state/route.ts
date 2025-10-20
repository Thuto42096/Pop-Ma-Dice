// GET /api/game/state - Get current game state

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db-client';

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing gameId parameter' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const game = await db.getGameSession(gameId);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get game state',
      },
      { status: 500 }
    );
  }
}

