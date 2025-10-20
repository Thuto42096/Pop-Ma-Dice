// GET /api/winnings/player-stats-contract - Get player stats from smart contract

import { NextRequest, NextResponse } from 'next/server';
import { getPlayerStatsFromContract } from '@/lib/smart-contract-integration';

export async function GET(request: NextRequest) {
  try {
    const playerAddress = request.nextUrl.searchParams.get('playerAddress');

    if (!playerAddress) {
      return NextResponse.json(
        { error: 'playerAddress is required' },
        { status: 400 }
      );
    }

    if (!playerAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // Get player stats from contract
    const stats = await getPlayerStatsFromContract(playerAddress as `0x${string}`);

    return NextResponse.json({
      success: true,
      playerAddress,
      stats: {
        totalBets: stats.totalBets.toString(),
        totalWinnings: stats.totalWinnings.toString(),
        gamesWon: stats.gamesWon.toString(),
        gamesLost: stats.gamesLost.toString(),
        totalBetsEth: (Number(stats.totalBets) / 1e18).toFixed(4),
        totalWinningsEth: (Number(stats.totalWinnings) / 1e18).toFixed(4),
      },
    });
  } catch (error) {
    console.error('Error getting player stats from contract:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get player stats',
      },
      { status: 500 }
    );
  }
}

