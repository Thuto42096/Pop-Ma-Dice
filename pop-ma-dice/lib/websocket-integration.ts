// WebSocket integration for game events
import { getWebSocketServer, ROOM_NAMES } from './websocket-server';
import { GameSession, GameResult, Player } from './game-types';

/**
 * Notify players when a game is created
 */
export function notifyGameCreated(game: GameSession): void {
  const ws = getWebSocketServer();

  // Notify player 1
  ws.sendToPlayer(game.player1.id, {
    type: 'game:created',
    data: {
      sessionId: game.id,
      game,
    },
    timestamp: Date.now(),
  });

  // Notify player 2 if PvP
  if (game.player2) {
    ws.sendToPlayer(game.player2.id, {
      type: 'game:created',
      data: {
        sessionId: game.id,
        game,
      },
      timestamp: Date.now(),
    });
  }

  // Broadcast to game room
  ws.sendToGame(game.id, {
    type: 'game:update',
    data: {
      sessionId: game.id,
      game,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify players of a roll
 */
export function notifyGameRoll(
  sessionId: string,
  playerId: string,
  rolls: number[],
  result: 'win' | 'lose' | 'draw' | 'continue'
): void {
  const ws = getWebSocketServer();

  ws.sendToGame(sessionId, {
    type: 'game:roll',
    data: {
      sessionId,
      playerId,
      rolls,
      result,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify players of game result
 */
export function notifyGameResult(result: GameResult, game: GameSession): void {
  const ws = getWebSocketServer();

  // Notify both players
  ws.sendToPlayer(result.player1Id, {
    type: 'game:result',
    data: {
      sessionId: result.gameId,
      result,
      game,
    },
    timestamp: Date.now(),
  });

  if (result.player2Id) {
    ws.sendToPlayer(result.player2Id, {
      type: 'game:result',
      data: {
        sessionId: result.gameId,
        result,
        game,
      },
      timestamp: Date.now(),
    });
  }

  // Broadcast to game room
  ws.sendToGame(result.gameId, {
    type: 'game:result',
    data: {
      sessionId: result.gameId,
      result,
      game,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify queue update
 */
export function notifyQueueUpdate(queueSize: number): void {
  const ws = getWebSocketServer();

  ws.broadcastToQueue({
    type: 'queue:update',
    data: {
      queueSize,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify match found
 */
export function notifyMatchFound(
  sessionId: string,
  player1Id: string,
  player2Id: string,
  game: GameSession
): void {
  const ws = getWebSocketServer();

  // Notify both players
  ws.sendToPlayer(player1Id, {
    type: 'queue:match',
    data: {
      matchFound: true,
      sessionId,
      opponent: player2Id,
      game,
    },
    timestamp: Date.now(),
  });

  ws.sendToPlayer(player2Id, {
    type: 'queue:match',
    data: {
      matchFound: true,
      sessionId,
      opponent: player1Id,
      game,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify leaderboard update
 */
export function notifyLeaderboardUpdate(
  playerId: string,
  rank: number,
  stats: any
): void {
  const ws = getWebSocketServer();

  ws.broadcastToLeaderboard({
    type: 'leaderboard:update',
    data: {
      playerId,
      rank,
      ...stats,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify player stats update
 */
export function notifyPlayerStatsUpdate(playerId: string, stats: any): void {
  const ws = getWebSocketServer();

  ws.sendToPlayer(playerId, {
    type: 'player:stats',
    data: {
      playerId,
      ...stats,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify player joined
 */
export function notifyPlayerJoined(player: Player, rank: number = 0): void {
  const ws = getWebSocketServer();

  ws.broadcastToLeaderboard({
    type: 'leaderboard:update',
    data: {
      playerId: player.id,
      username: player.username,
      address: player.walletAddress,
      rank,
    },
    timestamp: Date.now(),
  });
}

/**
 * Notify player left
 */
export function notifyPlayerLeft(playerId: string, rank: number = 0): void {
  const ws = getWebSocketServer();

  ws.broadcastToLeaderboard({
    type: 'leaderboard:update',
    data: {
      playerId,
      rank,
    },
    timestamp: Date.now(),
  });
}

/**
 * Get WebSocket server stats
 */
export function getWebSocketStats() {
  const ws = getWebSocketServer();

  return {
    connectedPlayers: ws.getConnectedPlayersCount(),
    activeSessions: ws.getActiveSessionsCount(),
    timestamp: Date.now(),
  };
}

