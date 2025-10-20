// POST /api/game/play - Execute a round in an active game

import { NextRequest, NextResponse } from 'next/server';
import { GameEngine } from '@/lib/game-engine';
import { getDatabase } from '@/lib/db-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing gameId' },
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

    if (game.status !== 'active') {
      return NextResponse.json(
        { error: `Game is ${game.status}, cannot play` },
        { status: 400 }
      );
    }

    // Execute round
    const updatedGame = GameEngine.executeRound(game);

    // Save updated game
    await db.updateGameSession(gameId, updatedGame);

    // If game finished, update player stats
    if (updatedGame.status === 'finished') {
      const winnings = GameEngine.calculateWinnings(updatedGame);

      // Update player 1
      const player1 = await db.getPlayer(updatedGame.player1.id);
      if (player1) {
        const isWinner = updatedGame.winner === updatedGame.player1.id;
        await db.updatePlayer(updatedGame.player1.id, {
          totalBets: player1.totalBets + updatedGame.player1.betAmount,
          totalWinnings: player1.totalWinnings + winnings.player1Winnings,
          gamesWon: player1.gamesWon + (isWinner ? 1 : 0),
          gamesLost: player1.gamesLost + (isWinner ? 0 : 1),
          gamesDrawn: player1.gamesDrawn + (!updatedGame.winner ? 1 : 0),
        });
      }

      // Update player 2 if exists
      if (updatedGame.player2) {
        const player2 = await db.getPlayer(updatedGame.player2.id);
        if (player2) {
          const isWinner = updatedGame.winner === updatedGame.player2.id;
          await db.updatePlayer(updatedGame.player2.id, {
            totalBets: player2.totalBets + updatedGame.player2.betAmount,
            totalWinnings: player2.totalWinnings + winnings.player2Winnings,
            gamesWon: player2.gamesWon + (isWinner ? 1 : 0),
            gamesLost: player2.gamesLost + (isWinner ? 0 : 1),
            gamesDrawn: player2.gamesDrawn + (!updatedGame.winner ? 1 : 0),
          });
        }
      }

      // Create game result
      await db.createGameResult({
        gameId: updatedGame.id,
        player1Id: updatedGame.player1.id,
        player2Id: updatedGame.player2?.id,
        player1Outcome: updatedGame.player1.outcome,
        player2Outcome: updatedGame.player2?.outcome,
        winner: updatedGame.winner,
        player1Winnings: winnings.player1Winnings,
        player2Winnings: winnings.player2Winnings,
        txHash: updatedGame.txHash || '',
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      game: updatedGame,
      round: updatedGame.currentRound,
      finished: updatedGame.status === 'finished',
      winner: updatedGame.winner,
    });
  } catch (error) {
    console.error('Error playing game:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to play game',
      },
      { status: 500 }
    );
  }
}

