// WebSocket Server for real-time game updates
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameSession, Player } from './game-types';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface GameUpdateMessage extends WebSocketMessage {
  type: 'game:update' | 'game:roll' | 'game:result' | 'game:joined' | 'game:left';
  data: {
    sessionId: string;
    playerId?: string;
    [key: string]: any;
  };
}

export interface PlayerUpdateMessage extends WebSocketMessage {
  type: 'player:joined' | 'player:left' | 'player:stats';
  data: {
    playerId: string;
    [key: string]: any;
  };
}

export interface QueueUpdateMessage extends WebSocketMessage {
  type: 'queue:update' | 'queue:match';
  data: {
    queueSize?: number;
    matchFound?: boolean;
    sessionId?: string;
    opponent?: Player;
  };
}

export interface LeaderboardUpdateMessage extends WebSocketMessage {
  type: 'leaderboard:update';
  data: {
    rank: number;
    playerId: string;
    [key: string]: any;
  };
}

// Room names
export const ROOM_NAMES = {
  GAME: (sessionId: string) => `game:${sessionId}`,
  PLAYER: (playerId: string) => `player:${playerId}`,
  QUEUE: 'queue:matchmaking',
  LEADERBOARD: 'leaderboard:global',
  NOTIFICATIONS: (playerId: string) => `notifications:${playerId}`,
};

export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private connectedPlayers: Map<string, string> = new Map(); // playerId -> socketId
  private activeSessions: Map<string, Set<string>> = new Map(); // sessionId -> Set<socketId>

  constructor() {}

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
    return this.io;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Player joins
      socket.on('player:join', (data: { playerId: string; address: string }) => {
        this.handlePlayerJoin(socket, data);
      });

      // Player leaves
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket);
      });

      // Game events
      socket.on('game:join', (data: { sessionId: string; playerId: string }) => {
        this.handleGameJoin(socket, data);
      });

      socket.on('game:leave', (data: { sessionId: string; playerId: string }) => {
        this.handleGameLeave(socket, data);
      });

      // Queue events
      socket.on('queue:join', (data: { playerId: string; betAmount: string }) => {
        this.handleQueueJoin(socket, data);
      });

      socket.on('queue:leave', (data: { playerId: string }) => {
        this.handleQueueLeave(socket, data);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Handle player join
   */
  private handlePlayerJoin(socket: Socket, data: { playerId: string; address: string }): void {
    const { playerId } = data;
    this.connectedPlayers.set(playerId, socket.id);
    socket.join(ROOM_NAMES.PLAYER(playerId));
    socket.join(ROOM_NAMES.NOTIFICATIONS(playerId));

    console.log(`👤 Player joined: ${playerId} (${socket.id})`);

    // Notify player of successful connection
    socket.emit('player:connected', {
      playerId,
      socketId: socket.id,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle player disconnect
   */
  private handlePlayerDisconnect(socket: Socket): void {
    let playerId: string | null = null;

    // Find player by socket ID
    for (const [pid, sid] of this.connectedPlayers.entries()) {
      if (sid === socket.id) {
        playerId = pid;
        break;
      }
    }

    if (playerId) {
      this.connectedPlayers.delete(playerId);
      console.log(`👤 Player disconnected: ${playerId}`);

      // Notify other players
      this.broadcastToRoom(ROOM_NAMES.LEADERBOARD, {
        type: 'player:offline',
        data: { playerId },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle game join
   */
  private handleGameJoin(socket: Socket, data: { sessionId: string; playerId: string }): void {
    const { sessionId, playerId } = data;
    socket.join(ROOM_NAMES.GAME(sessionId));

    if (!this.activeSessions.has(sessionId)) {
      this.activeSessions.set(sessionId, new Set());
    }
    this.activeSessions.get(sessionId)!.add(socket.id);

    console.log(`🎮 Player ${playerId} joined game ${sessionId}`);

    // Notify game room
    this.broadcastToRoom(ROOM_NAMES.GAME(sessionId), {
      type: 'game:player-joined',
      data: { playerId, sessionId },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle game leave
   */
  private handleGameLeave(socket: Socket, data: { sessionId: string; playerId: string }): void {
    const { sessionId, playerId } = data;
    socket.leave(ROOM_NAMES.GAME(sessionId));

    const sessionSockets = this.activeSessions.get(sessionId);
    if (sessionSockets) {
      sessionSockets.delete(socket.id);
      if (sessionSockets.size === 0) {
        this.activeSessions.delete(sessionId);
      }
    }

    console.log(`🎮 Player ${playerId} left game ${sessionId}`);

    // Notify game room
    this.broadcastToRoom(ROOM_NAMES.GAME(sessionId), {
      type: 'game:player-left',
      data: { playerId, sessionId },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle queue join
   */
  private handleQueueJoin(socket: Socket, data: { playerId: string; betAmount: string }): void {
    const { playerId, betAmount } = data;
    socket.join(ROOM_NAMES.QUEUE);

    console.log(`📋 Player ${playerId} joined queue with bet ${betAmount}`);

    // Broadcast queue update
    this.broadcastToRoom(ROOM_NAMES.QUEUE, {
      type: 'queue:player-joined',
      data: { playerId, betAmount },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle queue leave
   */
  private handleQueueLeave(socket: Socket, data: { playerId: string }): void {
    const { playerId } = data;
    socket.leave(ROOM_NAMES.QUEUE);

    console.log(`📋 Player ${playerId} left queue`);

    // Broadcast queue update
    this.broadcastToRoom(ROOM_NAMES.QUEUE, {
      type: 'queue:player-left',
      data: { playerId },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast message to a room
   */
  broadcastToRoom(room: string, message: WebSocketMessage): void {
    if (!this.io) return;
    this.io.to(room).emit('message', message);
  }

  /**
   * Send message to specific player
   */
  sendToPlayer(playerId: string, message: WebSocketMessage): void {
    if (!this.io) return;
    this.io.to(ROOM_NAMES.PLAYER(playerId)).emit('message', message);
  }

  /**
   * Send message to game session
   */
  sendToGame(sessionId: string, message: GameUpdateMessage): void {
    if (!this.io) return;
    this.io.to(ROOM_NAMES.GAME(sessionId)).emit('message', message);
  }

  /**
   * Broadcast to queue
   */
  broadcastToQueue(message: QueueUpdateMessage): void {
    this.broadcastToRoom(ROOM_NAMES.QUEUE, message);
  }

  /**
   * Broadcast to leaderboard
   */
  broadcastToLeaderboard(message: LeaderboardUpdateMessage): void {
    this.broadcastToRoom(ROOM_NAMES.LEADERBOARD, message);
  }

  /**
   * Get connected players count
   */
  getConnectedPlayersCount(): number {
    return this.connectedPlayers.size;
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export function getWebSocketServer(): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer();
  }
  return wsServer;
}

