// React hook for WebSocket
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketClient, WebSocketClientConfig, WebSocketClient } from './websocket-client';
import { WebSocketMessage } from './websocket-server';

export interface UseWebSocketOptions extends WebSocketClientConfig {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  client: WebSocketClient | null;
  joinPlayer: (playerId: string, address: string) => void;
  joinGame: (sessionId: string, playerId: string) => void;
  leaveGame: (sessionId: string, playerId: string) => void;
  joinQueue: (playerId: string, betAmount: string) => void;
  leaveQueue: (playerId: string) => void;
  on: (type: string, handler: (message: WebSocketMessage) => void) => () => void;
  onEvent: (event: string, handler: (data: any) => void) => () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<WebSocketClient | null>(null);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  const { enabled = true, onConnect, onDisconnect, onError, ...wsConfig } = options;

  // Initialize and connect
  useEffect(() => {
    if (!enabled) return;

    const initializeWebSocket = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        const client = getWebSocketClient(wsConfig);
        clientRef.current = client;

        // Setup event handlers
        const unsubscribeConnected = client.onEvent('player:connected', () => {
          setIsConnected(true);
          setIsConnecting(false);
          onConnect?.();
        });

        const unsubscribeDisconnected = client.onEvent('disconnected', () => {
          setIsConnected(false);
          onDisconnect?.();
        });

        const unsubscribeReconnected = client.onEvent('reconnected', () => {
          setIsConnected(true);
        });

        unsubscribesRef.current.push(
          unsubscribeConnected,
          unsubscribeDisconnected,
          unsubscribeReconnected
        );

        // Connect
        await client.connect();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsConnecting(false);
        onError?.(error);
        console.error('WebSocket initialization error:', error);
      }
    };

    initializeWebSocket();

    // Cleanup
    return () => {
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, [enabled, wsConfig, onConnect, onDisconnect, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const joinPlayer = useCallback((playerId: string, address: string) => {
    clientRef.current?.joinPlayer(playerId, address);
  }, []);

  const joinGame = useCallback((sessionId: string, playerId: string) => {
    clientRef.current?.joinGame(sessionId, playerId);
  }, []);

  const leaveGame = useCallback((sessionId: string, playerId: string) => {
    clientRef.current?.leaveGame(sessionId, playerId);
  }, []);

  const joinQueue = useCallback((playerId: string, betAmount: string) => {
    clientRef.current?.joinQueue(playerId, betAmount);
  }, []);

  const leaveQueue = useCallback((playerId: string) => {
    clientRef.current?.leaveQueue(playerId);
  }, []);

  const on = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    return clientRef.current?.on(type, handler) || (() => {});
  }, []);

  const onEvent = useCallback((event: string, handler: (data: any) => void) => {
    return clientRef.current?.onEvent(event, handler) || (() => {});
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    client: clientRef.current,
    joinPlayer,
    joinGame,
    leaveGame,
    joinQueue,
    leaveQueue,
    on,
    onEvent,
  };
}

