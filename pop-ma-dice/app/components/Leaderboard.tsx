'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/lib/use-websocket';

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  totalWinnings: string;
  gamesWon: number;
  gamesLost: number;
  winRate: string;
}

export function Leaderboard() {
  const { on } = useWebSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial leaderboard
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=10');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Listen for leaderboard updates
    const unsubscribe = on('leaderboard:update', (msg) => {
      setLeaderboard((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((e) => e.playerId === msg.data.playerId);
        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            rank: msg.data.rank,
            totalWinnings: msg.data.totalWinnings,
            gamesWon: msg.data.gamesWon,
            gamesLost: msg.data.gamesLost,
            winRate: msg.data.winRate,
          };
        }
        return updated.sort((a, b) => a.rank - b.rank);
      });
    });

    return unsubscribe;
  }, [on]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏆</div>
          <p className="text-gray-600">Loading leaderboard...</p>
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🏆</span> Top Players
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Player</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Winnings</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">W/L</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leaderboard.map((entry, idx) => (
              <tr
                key={entry.playerId}
                className={`hover:bg-gray-50 transition-colors ${
                  idx < 3 ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {idx === 0 && <span className="text-2xl">🥇</span>}
                    {idx === 1 && <span className="text-2xl">🥈</span>}
                    {idx === 2 && <span className="text-2xl">🥉</span>}
                    {idx >= 3 && (
                      <span className="text-sm font-semibold text-gray-600">#{entry.rank}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-800">{entry.username}</p>
                    <p className="text-xs text-gray-500 font-mono">{entry.playerId.slice(0, 8)}...</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-mono font-semibold text-gray-800">
                    {parseFloat(entry.totalWinnings).toFixed(4)} ETH
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm text-gray-700">
                    <span className="text-green-600 font-semibold">{entry.gamesWon}</span>
                    {' / '}
                    <span className="text-red-600 font-semibold">{entry.gamesLost}</span>
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-gray-800">{entry.winRate}%</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No players yet</p>
        </div>
      )}
    </div>
  );
}

