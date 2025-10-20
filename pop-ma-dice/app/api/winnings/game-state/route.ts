// GET /api/winnings/game-state - Get game state from smart contract

import { NextRequest, NextResponse } from 'next/server';
import { getGameStateFromContract, isWinningsClaimed } from '@/lib/smart-contract-integration';

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId is required' },
        { status: 400 }
      );
    }

    // Get game state from contract
    const gameState = await getGameStateFromContract(gameId);
    const claimed = await isWinningsClaimed(gameId);

    return NextResponse.json({
      success: true,
      gameId,
      gameState: {
        player: gameState.player,
        betAmount: gameState.betAmount.toString(),
        token: gameState.token,
        initialRoll: gameState.initialRoll,
        lastRoll: gameState.lastRoll,
        finished: gameState.finished,
        won: gameState.won,
        winnings: gameState.winnings.toString(),
        claimed,
      },
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

