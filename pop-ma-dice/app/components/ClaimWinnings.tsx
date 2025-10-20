'use client';

import React, { useState, useEffect } from 'react';
import { useClaimWinnings } from '@/lib/use-claim-winnings';
import { useSmartContract } from '@/lib/use-smart-contract';
import { useAccount } from 'wagmi';

export function ClaimWinnings() {
  const { address } = useAccount();
  const { claimAllWinnings, getUnclaimedWinnings, state: claimState } = useClaimWinnings();
  const { estimateGas, state: gasState } = useSmartContract();
  const [unclaimedData, setUnclaimedData] = useState<any>(null);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const fetchData = async () => {
      try {
        // Get unclaimed winnings
        await getUnclaimedWinnings(address);
      } catch (error) {
        console.error('Error fetching unclaimed winnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, getUnclaimedWinnings]);

  useEffect(() => {
    if (claimState.data) {
      setUnclaimedData(claimState.data);
    }
  }, [claimState.data]);

  useEffect(() => {
    if (gasState.data) {
      setGasEstimate(gasState.data);
    }
  }, [gasState.data]);

  const handleEstimateGas = async () => {
    if (!address || !unclaimedData?.pendingClaims?.[0]) return;
    const firstClaim = unclaimedData.pendingClaims[0];
    await estimateGas(firstClaim.gameId, address, firstClaim.amount.toString());
  };

  const handleClaimAll = async () => {
    if (!address) return;
    try {
      await claimAllWinnings(address, address);
    } catch (error) {
      console.error('Error claiming winnings:', error);
    }
  };

  if (!address) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">Connect your wallet to claim winnings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">💰</div>
          <p className="text-gray-600">Loading winnings...</p>
        </div>
      </div>
    );
  }

  const unclaimedAmount = unclaimedData?.unclaimedWinnings || '0';
  const pendingCount = unclaimedData?.pendingClaims?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>💰</span> Claim Winnings
      </h2>

      {/* Unclaimed Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Unclaimed Winnings</p>
          <p className="text-2xl font-bold text-green-600">
            {parseFloat(unclaimedAmount).toFixed(4)} ETH
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Pending Claims</p>
          <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
        </div>
      </div>

      {/* Gas Estimate */}
      {gasEstimate && (
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Estimated Gas Cost</p>
          <p className="text-lg font-mono font-bold text-gray-800">
            {gasEstimate.estimatedCostEth} ETH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Gas Limit: {gasEstimate.gasLimit} | Price: {gasEstimate.gasPrice}
          </p>
        </div>
      )}

      {/* Pending Claims List */}
      {pendingCount > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Pending Claims</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unclaimedData?.pendingClaims?.map((claim: any, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Game {idx + 1}</span>
                <span className="font-mono font-bold text-gray-800">
                  {parseFloat(claim.amount).toFixed(4)} ETH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleEstimateGas}
          disabled={gasState.loading || pendingCount === 0}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {gasState.loading ? 'Estimating...' : 'Estimate Gas'}
        </button>
        <button
          onClick={handleClaimAll}
          disabled={claimState.loading || pendingCount === 0}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {claimState.loading ? 'Claiming...' : `Claim All (${pendingCount})`}
        </button>
      </div>

      {/* Status Messages */}
      {claimState.error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">Error: {claimState.error}</p>
        </div>
      )}

      {claimState.success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 text-sm">✅ {claimState.data?.message}</p>
        </div>
      )}

      {pendingCount === 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm">No unclaimed winnings</p>
        </div>
      )}
    </div>
  );
}

