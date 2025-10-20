'use client';

import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { base } from 'wagmi/chains';
import { formatEther } from 'viem';

export interface WalletState {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  chainId: number;
  isCorrectChain: boolean;
  balance: string | null;
  balanceLoading: boolean;
  balanceError: Error | null;
}

export interface UseWalletReturn extends WalletState {
  switchToBase: () => Promise<void>;
  formatBalance: (balance: string) => string;
  isReady: boolean;
}

/**
 * Hook for wallet connection and state management
 * Handles wallet connection, chain switching, and balance fetching
 */
export function useWallet(): UseWalletReturn {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isReady, setIsReady] = useState(false);

  // Fetch balance
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useBalance({
    address: address,
    chainId: base.id,
  });

  // Check if on correct chain
  const isCorrectChain = chainId === base.id;

  // Format balance
  const balance = balanceData ? formatEther(balanceData.value) : null;

  // Switch to Base chain
  const switchToBase = useCallback(async () => {
    if (!switchChain) {
      throw new Error('Chain switching not available');
    }
    try {
      switchChain({ chainId: base.id });
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }, [switchChain]);

  // Format balance to readable string
  const formatBalance = useCallback((bal: string): string => {
    const num = parseFloat(bal);
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  }, []);

  // Set ready state
  useEffect(() => {
    setIsReady(true);
  }, []);

  return {
    address,
    isConnected,
    chainId: chainId || 0,
    isCorrectChain,
    balance,
    balanceLoading,
    balanceError: balanceError as Error | null,
    switchToBase,
    formatBalance,
    isReady,
  };
}

/**
 * Hook to ensure wallet is on correct chain
 * Automatically switches to Base if needed
 */
export function useEnsureCorrectChain() {
  const { isCorrectChain, switchToBase } = useWallet();
  const [hasAttemptedSwitch, setHasAttemptedSwitch] = useState(false);

  useEffect(() => {
    if (!isCorrectChain && !hasAttemptedSwitch) {
      switchToBase().catch((error) => {
        console.error('Failed to switch chain:', error);
      });
      setHasAttemptedSwitch(true);
    }
  }, [isCorrectChain, hasAttemptedSwitch, switchToBase]);

  return { isCorrectChain, switchToBase };
}

/**
 * Hook to validate wallet address
 */
export function useValidateAddress(address: string | undefined): boolean {
  return address ? /^0x[a-fA-F0-9]{40}$/.test(address) : false;
}

/**
 * Hook to get wallet display name
 */
export function useWalletDisplayName(address: `0x${string}` | undefined): string {
  if (!address) return 'Not Connected';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

