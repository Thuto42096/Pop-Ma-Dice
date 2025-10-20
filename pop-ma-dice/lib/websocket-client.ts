// WebSocket Client for real-time game updates
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from './websocket-server';

export interface WebSocketClientConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

export type MessageHandler = (message: WebSocketMessage) => void;
export type EventHandler = (data: any) => void;

export class WebSocketClient {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected = false;
  private playerId: string | null = null;

  constructor(private config: WebSocketClientConfig = {}) {
    this.config = {
      url: config.url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
      autoConnect: config.autoConnect !== false,
      reconnection: config.reconnection !== false,
      reconnectionDelay: config.reconnectionDelay || 1000,
      reconnectionDelayMax: config.reconnectionDelayMax || 5000,
      reconnectionAttempts: config.reconnectionAttempts || 5,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url!, {
          autoConnect: this.config.autoConnect,
          reconnection: this.config.reconnection,
          reconnectionDelay: this.config.reconnectionDelay,
          reconnectionDelayMax: this.config.reconnectionDelayMax,
          reconnectionAttempts: this.config.reconnectionAttempts,
          transports: ['websocket', 'polling'],
        });

        this.setupEventHandlers();

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('✅ WebSocket connected');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Generic message handler
    this.socket.on('message', (message: WebSocketMessage) => {
      this.handleMessage(message);
    });

    // Player events
    this.socket.on('player:connected', (data) => {
      this.playerId = data.playerId;
      this.emit('player:connected', data);
    });

    // Connection events
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('disconnected', {});
    });

    this.socket.on('reconnect', () => {
      this.isConnected = true;
      this.emit('reconnected', {});
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    const { type } = message;

    // Call type-specific handlers
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Call generic message handlers
    const genericHandlers = this.messageHandlers.get('*');
    if (genericHandlers) {
      genericHandlers.forEach((handler) => handler(message));
    }
  }

  /**
   * Subscribe to message type
   */
  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  /**
   * Subscribe to event
   */
  onEvent(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Join player
   */
  joinPlayer(playerId: string, address: string): void {
    if (!this.socket) return;
    this.socket.emit('player:join', { playerId, address });
  }

  /**
   * Join game
   */
  joinGame(sessionId: string, playerId: string): void {
    if (!this.socket) return;
    this.socket.emit('game:join', { sessionId, playerId });
  }

  /**
   * Leave game
   */
  leaveGame(sessionId: string, playerId: string): void {
    if (!this.socket) return;
    this.socket.emit('game:leave', { sessionId, playerId });
  }

  /**
   * Join queue
   */
  joinQueue(playerId: string, betAmount: string): void {
    if (!this.socket) return;
    this.socket.emit('queue:join', { playerId, betAmount });
  }

  /**
   * Leave queue
   */
  leaveQueue(playerId: string): void {
    if (!this.socket) return;
    this.socket.emit('queue:leave', { playerId });
  }

  /**
   * Check if connected
   */
  isConnectedToServer(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Get player ID
   */
  getPlayerId(): string | null {
    return this.playerId;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(config?: WebSocketClientConfig): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(config);
  }
  return wsClient;
}

export function resetWebSocketClient(): void {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }
}

