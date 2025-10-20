// React hook for claiming winnings
'use client';

import { useState, useCallback } from 'react';

export interface ClaimWinningsState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any | null;
}

export interface UseClaimWinningsReturn {
  claimWinnings: (playerId: string, gameId: string, address: string) => Promise<void>;
  claimAllWinnings: (playerId: string, address: string) => Promise<void>;
  getUnclaimedWinnings: (playerId: string) => Promise<void>;
  getWinningsHistory: (playerId: string, limit?: number) => Promise<void>;
  state: ClaimWinningsState;
  reset: () => void;
}

export function useClaimWinnings(): UseClaimWinningsReturn {
  const [state, setState] = useState<ClaimWinningsState>({
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

  const claimWinnings = useCallback(
    async (playerId: string, gameId: string, address: string) => {
      setState({ loading: true, error: null, success: false, data: null });

      try {
        const response = await fetch('/api/winnings/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, gameId, address }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to claim winnings');
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

  const claimAllWinnings = useCallback(
    async (playerId: string, address: string) => {
      setState({ loading: true, error: null, success: false, data: null });

      try {
        const response = await fetch('/api/winnings/claim-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, address }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to claim winnings');
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

  const getUnclaimedWinnings = useCallback(async (playerId: string) => {
    setState({ loading: true, error: null, success: false, data: null });

    try {
      const response = await fetch(`/api/winnings/unclaimed?playerId=${playerId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get unclaimed winnings');
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

  const getWinningsHistory = useCallback(
    async (playerId: string, limit: number = 50) => {
      setState({ loading: true, error: null, success: false, data: null });

      try {
        const response = await fetch(
          `/api/winnings/history?playerId=${playerId}&limit=${limit}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get winnings history');
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

  return {
    claimWinnings,
    claimAllWinnings,
    getUnclaimedWinnings,
    getWinningsHistory,
    state,
    reset,
  };
}

