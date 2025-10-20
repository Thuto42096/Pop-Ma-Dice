// GET /api/leaderboard - Get top players leaderboard

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db-client';
import { Leaderboard } from '@/lib/game-types';
import { notifyLeaderboardUpdate } from '@/lib/websocket-integration';

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '100'),
      1000
    );

    const db = await getDatabase();
    const topPlayers = await db.getLeaderboard(limit);

    const leaderboard: Leaderboard[] = topPlayers.map((player, index) => ({
      rank: index + 1,
      playerId: player.id,
      username: player.username,
      totalWinnings: player.totalWinnings,
      gamesWon: player.gamesWon,
      gamesLost: player.gamesLost,
      winRate:
        player.gamesWon + player.gamesLost > 0
          ? (player.gamesWon / (player.gamesWon + player.gamesLost)) * 100
          : 0,
    }));

    // Broadcast leaderboard updates to all connected players
    leaderboard.forEach((entry) => {
      notifyLeaderboardUpdate(entry.playerId, entry.rank, {
        totalWinnings: entry.totalWinnings.toString(),
        gamesWon: entry.gamesWon,
        gamesLost: entry.gamesLost,
        winRate: entry.winRate.toFixed(2),
      });
    });

    return NextResponse.json({
      success: true,
      leaderboard,
      totalPlayers: leaderboard.length,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get leaderboard',
      },
      { status: 500 }
    );
  }
}

