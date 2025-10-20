// GET /api/player/stats - Get player statistics and game history

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db-client';

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId');
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '50'),
      500
    );

    if (!playerId) {
      return NextResponse.json(
        { error: 'Missing playerId parameter' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const player = await db.getPlayer(playerId);

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const gameHistory = await db.getGameResults(playerId, limit);

    const stats = {
      player: {
        id: player.id,
        username: player.username,
        walletAddress: player.walletAddress,
        joinedAt: player.joinedAt,
        lastActive: player.lastActive,
      },
      stats: {
        totalBets: player.totalBets.toString(),
        totalWinnings: player.totalWinnings.toString(),
        gamesWon: player.gamesWon,
        gamesLost: player.gamesLost,
        gamesDrawn: player.gamesDrawn,
        totalGames: player.gamesWon + player.gamesLost + player.gamesDrawn,
        winRate:
          player.gamesWon + player.gamesLost > 0
            ? ((player.gamesWon / (player.gamesWon + player.gamesLost)) * 100).toFixed(2)
            : '0.00',
        averageWinnings:
          player.gamesWon > 0
            ? (player.totalWinnings / BigInt(player.gamesWon)).toString()
            : '0',
      },
      recentGames: gameHistory.map((result) => ({
        gameId: result.gameId,
        opponent: result.player1Id === playerId ? result.player2Id : result.player1Id,
        outcome: result.player1Id === playerId ? result.player1Outcome : result.player2Outcome,
        winnings:
          result.player1Id === playerId
            ? result.player1Winnings.toString()
            : result.player2Winnings?.toString() || '0',
        timestamp: result.timestamp,
      })),
    };

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error('Error getting player stats:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get player stats',
      },
      { status: 500 }
    );
  }
}

