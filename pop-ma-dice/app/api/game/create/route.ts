// POST /api/game/create - Create a new game session

import { NextRequest, NextResponse } from 'next/server';
import { GameEngine } from '@/lib/game-engine';
import { getDatabase } from '@/lib/db-client';
import { MatchmakingService } from '@/lib/matchmaking';
import { notifyGameCreated, notifyMatchFound, notifyQueueUpdate } from '@/lib/websocket-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, address, betAmount, mode = 'pvp' } = body;

    // Validate input
    if (!playerId || !address || !betAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, address, betAmount' },
        { status: 400 }
      );
    }

    // Validate bet amount
    const bet = BigInt(betAmount);
    if (!GameEngine.validateBet(bet)) {
      return NextResponse.json(
        { error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get or create player
    let player = await db.getPlayerByAddress(address);
    if (!player) {
      player = {
        id: playerId,
        username: `Player_${playerId.slice(0, 6)}`,
        walletAddress: address,
        totalWinnings: BigInt(0),
        totalBets: BigInt(0),
        gamesWon: 0,
        gamesLost: 0,
        gamesDrawn: 0,
        joinedAt: new Date(),
        lastActive: new Date(),
      };
      await db.createPlayer(player);
    }

    // Update player's last active time
    await db.updatePlayer(playerId, {
      lastActive: new Date(),
    });

    if (mode === 'pve') {
      // Create PvE game immediately
      const game = GameEngine.createGameSession(playerId, address, bet, 'pve');
      await db.createGameSession(game);

      // Notify player of game creation
      notifyGameCreated(game);

      return NextResponse.json({
        success: true,
        game,
        message: 'PvE game created successfully',
      });
    } else {
      // PvP: Try to find a match
      const game = await MatchmakingService.joinQueue(
        playerId,
        address,
        bet,
        'pvp'
      );

      if (game) {
        // Match found - notify both players
        notifyGameCreated(game);
        notifyMatchFound(
          game.id,
          game.player1.id,
          game.player2!.id,
          game
        );

        return NextResponse.json({
          success: true,
          game,
          message: 'Match found! Game started.',
        });
      } else {
        // Added to queue - notify queue update
        const queueStatus = await MatchmakingService.getQueueStatus();
        notifyQueueUpdate(queueStatus.totalPlayers);

        return NextResponse.json({
          success: true,
          game: null,
          message: 'Added to matchmaking queue. Waiting for opponent...',
          queueStatus,
        });
      }
    }
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create game',
      },
      { status: 500 }
    );
  }
}

