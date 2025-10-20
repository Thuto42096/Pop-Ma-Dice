'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/lib/use-websocket';

interface GameBoardProps {
  gameId: string;
  playerId: string;
  opponentId?: string;
  mode: 'pve' | 'pvp';
}

export function GameBoard({ gameId, playerId, opponentId, mode }: GameBoardProps) {
  const { on, joinGame } = useWebSocket();
  const [gameState, setGameState] = useState<any>(null);
  const [rolls, setRolls] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Join game room
    joinGame(gameId, playerId);

    // Listen for game updates
    const unsubRoll = on('game:roll', (msg) => {
      console.log('Roll received:', msg.data);
      setRolls((prev) => [...prev, msg.data.rolls]);
    });

    const unsubResult = on('game:result', (msg) => {
      console.log('Game result:', msg.data);
      setGameState(msg.data.result);
    });

    return () => {
      unsubRoll();
      unsubResult();
    };
  }, [gameId, playerId, on, joinGame]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎲</div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {mode === 'pve' ? '🤖 Player vs Environment' : '👥 Player vs Player'}
        </h2>
        <p className="text-gray-600">Game ID: {gameId}</p>
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Your ID</p>
          <p className="font-mono text-sm text-gray-800">{playerId}</p>
        </div>
        {opponentId && (
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Opponent ID</p>
            <p className="font-mono text-sm text-gray-800">{opponentId}</p>
          </div>
        )}
      </div>

      {/* Rolls History */}
      {rolls.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Rolls</h3>
          <div className="space-y-2">
            {rolls.map((roll, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Roll {idx + 1}</span>
                <span className="font-mono font-bold text-gray-800">
                  [{roll[0]}, {roll[1]}] = {roll[0] + roll[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Result */}
      {gameState && (
        <div className={`rounded-lg p-4 ${
          gameState.winner === playerId
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className="font-semibold text-lg mb-2">
            {gameState.winner === playerId ? '🎉 You Won!' : '💥 You Lost'}
          </p>
          <p className="text-sm text-gray-700">
            {gameState.reason || 'Game finished'}
          </p>
        </div>
      )}
    </div>
  );
}

