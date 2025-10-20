'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/lib/use-websocket';
import { useAccount } from 'wagmi';

interface QueueEntry {
  playerId: string;
  betAmount: string;
  joinedAt: string;
}

export function QueueStatus() {
  const { address } = useAccount();
  const { on, joinQueue, leaveQueue } = useWebSocket();
  const [queueSize, setQueueSize] = useState(0);
  const [isInQueue, setIsInQueue] = useState(false);
  const [matched, setMatched] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState('0.01');

  useEffect(() => {
    // Listen for queue updates
    const unsubQueue = on('queue:update', (msg) => {
      setQueueSize(msg.data.queueSize || 0);
    });

    // Listen for match found
    const unsubMatch = on('queue:match', (msg) => {
      if (msg.data.matchFound) {
        setMatched(true);
        setMatchedOpponent(msg.data.opponentId);
        setIsInQueue(false);
      }
    });

    return () => {
      unsubQueue();
      unsubMatch();
    };
  }, [on]);

  const handleJoinQueue = async () => {
    if (!address) return;
    setLoading(true);
    try {
      joinQueue(address, betAmount);
      setIsInQueue(true);
    } catch (error) {
      console.error('Error joining queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!address) return;
    setLoading(true);
    try {
      leaveQueue(address);
      setIsInQueue(false);
    } catch (error) {
      console.error('Error leaving queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetMatch = () => {
    setMatched(false);
    setMatchedOpponent(null);
  };

  if (!address) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">Connect your wallet to join the queue</p>
      </div>
    );
  }

  if (matched) {
    return (
      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 text-center">
        <div className="text-5xl mb-4 animate-bounce">🎉</div>
        <h3 className="text-2xl font-bold text-green-700 mb-2">Match Found!</h3>
        <p className="text-green-600 mb-4">You've been matched with an opponent</p>
        <p className="text-sm text-gray-600 mb-4 font-mono">
          Opponent: {matchedOpponent?.slice(0, 8)}...
        </p>
        <button
          onClick={handleResetMatch}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>⏳</span> Matchmaking Queue
      </h2>

      {/* Queue Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
        <p className="text-sm text-gray-600 mb-1">Players in Queue</p>
        <p className="text-4xl font-bold text-blue-600">{queueSize}</p>
        <p className="text-xs text-gray-500 mt-2">
          {isInQueue ? '✅ You are in the queue' : '⏸️ You are not in the queue'}
        </p>
      </div>

      {/* Bet Amount Input */}
      {!isInQueue && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bet Amount (ETH)
          </label>
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.01"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum bet: 0.0001 ETH
          </p>
        </div>
      )}

      {/* Queue Info */}
      {isInQueue && (
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Your Bet</p>
          <p className="text-2xl font-bold text-yellow-600">{betAmount} ETH</p>
          <p className="text-xs text-gray-500 mt-2">
            Waiting for opponent... This may take a few moments.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isInQueue ? (
          <button
            onClick={handleJoinQueue}
            disabled={loading || !betAmount || parseFloat(betAmount) <= 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Joining...' : 'Join Queue'}
          </button>
        ) : (
          <button
            onClick={handleLeaveQueue}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Leaving...' : 'Leave Queue'}
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Bet amounts must be within ±10% of other players</li>
          <li>• Matches are found automatically</li>
          <li>• You'll be notified when a match is found</li>
        </ul>
      </div>
    </div>
  );
}

