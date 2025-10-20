'use client';

import React, { useEffect, useState } from 'react';
import { useWallet, useWalletDisplayName } from '@/lib/use-wallet';
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

interface WalletConnectProps {
  className?: string;
  showBalance?: boolean;
  compact?: boolean;
}

/**
 * Wallet connection component with chain switching and balance display
 */
export function WalletConnect({
  className = '',
  showBalance = true,
  compact = false,
}: WalletConnectProps) {
  const { isConnected, isCorrectChain, balance, switchToBase, formatBalance } = useWallet();
  const { address } = useWallet();
  const displayName = useWalletDisplayName(address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-gray-200 rounded-lg px-4 py-2 ${className}`}>
        <div className="h-5 w-24 bg-gray-300 rounded animate-pulse" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Wallet>
        <ConnectWallet
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors ${className}`}
        >
          <Avatar className="h-5 w-5" />
          <Name className="ml-2" />
        </ConnectWallet>
      </Wallet>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => switchToBase()}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="text-lg">⚠️</span>
          Switch to Base
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <Wallet>
        <ConnectWallet className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors ${className}`}>
          <Avatar className="h-5 w-5" />
          <Name className="ml-2 text-sm" />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className="text-sm" />
            {showBalance && <EthBalance />}
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
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Wallet>
        <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <Avatar className="h-5 w-5" />
          <Name className="ml-2" />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className="text-sm" />
            {showBalance && <EthBalance />}
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

      {showBalance && balance && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4 py-2 border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Balance</p>
          <p className="font-mono font-bold text-green-600">
            {formatBalance(balance)} ETH
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Minimal wallet connect button
 */
export function WalletConnectButton() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <Wallet>
        <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          <Avatar className="h-5 w-5" />
          <Name className="ml-2" />
        </ConnectWallet>
      </Wallet>
    );
  }

  return (
    <Wallet>
      <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}

