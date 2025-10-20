'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWebSocket } from '@/lib/use-websocket';

interface PlayerStatsData {
  player: {
    id: string;
    username: string;
    walletAddress: string;
    joinedAt: string;
    lastActive: string;
  };
  stats: {
    totalBets: string;
    totalWinnings: string;
    gamesWon: number;
    gamesLost: number;
    gamesDrawn: number;
    totalGames: number;
    winRate: number;
    averageWinnings: string;
  };
  recentGames: Array<{
    gameId: string;
    result: 'win' | 'loss' | 'draw';
    amount: string;
    timestamp: string;
  }>;
}

export function PlayerStats() {
  const { address } = useAccount();
  const { on } = useWebSocket();
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/player/stats?playerId=${address}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchStats();

    // Listen for stats updates
    const unsubscribe = on('player:stats', (msg) => {
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            ...msg.data,
          },
        };
      });
    });

    return unsubscribe;
  }, [address, on]);

  if (!address) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">Connect your wallet to view stats</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading stats...</p>
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

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-700">No stats available</p>
      </div>
    );
  }

  const { player, stats: playerStats, recentGames } = stats;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span> Player Statistics
      </h2>

      {/* Player Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
        <p className="text-sm text-gray-600 mb-1">Player ID</p>
        <p className="font-mono text-sm text-gray-800 mb-3">{player.id}</p>
        <p className="text-xs text-gray-500">
          Joined: {new Date(player.joinedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Total Winnings</p>
          <p className="text-xl font-bold text-green-600">
            {parseFloat(playerStats.totalWinnings).toFixed(4)} ETH
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">Total Bets</p>
          <p className="text-xl font-bold text-blue-600">
            {parseFloat(playerStats.totalBets).toFixed(4)} ETH
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Win Rate</p>
          <p className="text-xl font-bold text-purple-600">
            {playerStats.winRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-gray-600 mb-1">Games Won</p>
          <p className="text-xl font-bold text-yellow-600">{playerStats.gamesWon}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-gray-600 mb-1">Games Lost</p>
          <p className="text-xl font-bold text-red-600">{playerStats.gamesLost}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Total Games</p>
          <p className="text-xl font-bold text-gray-600">{playerStats.totalGames}</p>
        </div>
      </div>

      {/* Recent Games */}
      {recentGames && recentGames.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Games</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentGames.map((game, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 flex items-center justify-between ${
                  game.result === 'win'
                    ? 'bg-green-50 border border-green-200'
                    : game.result === 'loss'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {game.result === 'win' ? '✅' : game.result === 'loss' ? '❌' : '➖'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {game.result.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(game.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-mono font-bold text-gray-800">
                  {parseFloat(game.amount).toFixed(4)} ETH
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

