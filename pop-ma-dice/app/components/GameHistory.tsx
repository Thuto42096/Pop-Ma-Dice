'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface GameRecord {
  gameId: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  betAmount: string;
  winnings: string;
  rolls: Array<[number, number]>;
  timestamp: string;
  txHash?: string;
  claimed: boolean;
}

export function GameHistory() {
  const { address } = useAccount();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!address) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/game/history?playerId=${address}&limit=50`);
        if (!response.ok) throw new Error('Failed to fetch game history');
        const data = await response.json();
        setGames(data.games || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchHistory();
  }, [address]);

  if (!address) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">Connect your wallet to view game history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📜</div>
          <p className="text-gray-600">Loading game history...</p>
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

  const filteredGames = games.filter((g) => filter === 'all' || g.result === filter);
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginatedGames = filteredGames.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📜</span> Game History
      </h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'win', 'loss'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f === 'all' ? 'All' : f === 'win' ? '✅ Wins' : '❌ Losses'}
          </button>
        ))}
      </div>

      {/* Games Table */}
      {paginatedGames.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Result</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Opponent</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Bet</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Winnings</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Rolls</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedGames.map((game, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-lg">
                      {game.result === 'win' ? '✅' : game.result === 'loss' ? '❌' : '➖'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-gray-600">
                      {game.opponent?.slice(0, 8)}...
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-mono font-semibold text-gray-800">
                      {parseFloat(game.betAmount).toFixed(4)} ETH
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className={`font-mono font-semibold ${
                      game.result === 'win' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(game.winnings).toFixed(4)} ETH
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-gray-600">
                      {game.rolls.map((r) => `[${r[0]},${r[1]}]`).join(' ')}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(game.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {game.claimed ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        Claimed
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No games found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

