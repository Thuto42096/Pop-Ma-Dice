'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { PlayerStats } from '@/app/components/PlayerStats';
import { Leaderboard } from '@/app/components/Leaderboard';
import { ClaimWinnings } from '@/app/components/ClaimWinnings';
import { QueueStatus } from '@/app/components/QueueStatus';
import { GameHistory } from '@/app/components/GameHistory';

type TabType = 'stats' | 'leaderboard' | 'claim' | 'queue' | 'history';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'stats', label: 'My Stats', icon: '📊' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'claim', label: 'Claim Winnings', icon: '💰' },
    { id: 'queue', label: 'Matchmaking', icon: '⏳' },
    { id: 'history', label: 'Game History', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎲</span>
            <div>
              <h1 className="text-3xl font-bold text-white">Pop Ma Dice</h1>
              <p className="text-blue-100 text-sm">Multiplayer Dice Game</p>
            </div>
          </div>
          <Wallet>
            <ConnectWallet className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-2 px-4 rounded-lg">
              <Avatar className="h-5 w-5" />
              <Name className="ml-2" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address className="text-sm" />
                <EthBalance />
              </Identity>
              <WalletDropdownLink
                icon="wallet"
                href="https://keys.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wallet
              </WalletDropdownLink>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Pop Ma Dice</h2>
            <p className="text-blue-700 mb-6">
              Connect your wallet to start playing and earning!
            </p>
            <Wallet>
              <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2">
                <Avatar className="h-5 w-5" />
                <Name />
              </ConnectWallet>
            </Wallet>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="mb-8 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {activeTab === 'stats' && <PlayerStats />}
              {activeTab === 'leaderboard' && <Leaderboard />}
              {activeTab === 'claim' && <ClaimWinnings />}
              {activeTab === 'queue' && <QueueStatus />}
              {activeTab === 'history' && <GameHistory />}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>🎲 Pop Ma Dice © 2024 | Built with Next.js, Wagmi, and Viem</p>
        </div>
      </footer>
    </div>
  );
}

