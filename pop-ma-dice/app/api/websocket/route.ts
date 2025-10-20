// WebSocket API route handler
import { NextRequest, NextResponse } from 'next/server';

/**
 * WebSocket endpoint for real-time game updates
 * 
 * This endpoint handles WebSocket connections for:
 * - Real-time game state updates
 * - Player notifications
 * - Matchmaking queue updates
 * - Leaderboard updates
 * 
 * Usage:
 * const ws = new WebSocket('ws://localhost:3000/api/websocket');
 * 
 * Events:
 * - player:join - Join as a player
 * - game:join - Join a game session
 * - game:leave - Leave a game session
 * - queue:join - Join matchmaking queue
 * - queue:leave - Leave matchmaking queue
 */

export async function GET(request: NextRequest) {
  // WebSocket connections are handled by the socket.io server
  // This endpoint is for documentation and health checks
  return NextResponse.json({
    status: 'ok',
    message: 'WebSocket server is running',
    endpoint: 'ws://localhost:3000/socket.io',
    events: {
      'player:join': 'Join as a player',
      'player:leave': 'Leave as a player',
      'game:join': 'Join a game session',
      'game:leave': 'Leave a game session',
      'queue:join': 'Join matchmaking queue',
      'queue:leave': 'Leave matchmaking queue',
    },
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use WebSocket connection instead' },
    { status: 405 }
  );
}

