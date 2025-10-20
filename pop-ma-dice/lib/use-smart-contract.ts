// React hook for smart contract interactions
'use client';

import { useState, useCallback } from 'react';

export interface SmartContractState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any | null;
}

export interface UseSmartContractReturn {
  estimateGas: (gameId: string, playerAddress: string, winningsAmount: string) => Promise<void>;
  getGameState: (gameId: string) => Promise<void>;
  getPlayerStats: (playerAddress: string) => Promise<void>;
  watchTransaction: (txHash: string) => Promise<void>;
  state: SmartContractState;
  reset: () => void;
}

export function useSmartContract(): UseSmartContractReturn {
  const [state, setState] = useState<SmartContractState>({
    loading: false,
    error: null,
    success: false,
    data: null,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: null,
    });
  }, []);

  const estimateGas = useCallback(
    async (gameId: string, playerAddress: string, winningsAmount: string) => {
      setState({ loading: true, error: null, success: false, data: null });

      try {
        const response = await fetch(
          `/api/winnings/estimate-gas?gameId=${gameId}&playerAddress=${playerAddress}&winningsAmount=${winningsAmount}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to estimate gas');
        }

        const data = await response.json();
        setState({
          loading: false,
          error: null,
          success: true,
          data,
        });
      } catch (error) {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
          data: null,
        });
        throw error;
      }
    },
    []
  );

  const getGameState = useCallback(async (gameId: string) => {
    setState({ loading: true, error: null, success: false, data: null });

    try {
      const response = await fetch(`/api/winnings/game-state?gameId=${gameId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get game state');
      }

      const data = await response.json();
      setState({
        loading: false,
        error: null,
        success: true,
        data,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        data: null,
      });
      throw error;
    }
  }, []);

  const getPlayerStats = useCallback(async (playerAddress: string) => {
    setState({ loading: true, error: null, success: false, data: null });

    try {
      const response = await fetch(
        `/api/winnings/player-stats-contract?playerAddress=${playerAddress}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get player stats');
      }

      const data = await response.json();
      setState({
        loading: false,
        error: null,
        success: true,
        data,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        data: null,
      });
      throw error;
    }
  }, []);

  const watchTransaction = useCallback(async (txHash: string) => {
    setState({ loading: true, error: null, success: false, data: null });

    try {
      // Poll for transaction status
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds with 2 second intervals

      while (!confirmed && attempts < maxAttempts) {
        const response = await fetch(`/api/winnings/watch-transaction?txHash=${txHash}`);

        if (response.ok) {
          const data = await response.json();
          if (data.confirmed) {
            confirmed = true;
            setState({
              loading: false,
              error: null,
              success: true,
              data,
            });
          }
        }

        if (!confirmed) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      if (!confirmed) {
        throw new Error('Transaction confirmation timeout');
      }
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        data: null,
      });
      throw error;
    }
  }, []);

  return {
    estimateGas,
    getGameState,
    getPlayerStats,
    watchTransaction,
    state,
    reset,
  };
}

