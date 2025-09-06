"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Button } from "./components/DemoComponents";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction
} from "@coinbase/onchainkit/transaction";
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
import { formatEther, parseEther } from "viem";

function DiceFace({ value }: { value: number }) {
  // Create authentic dice face patterns using dots
  const dot = "w-3.5 h-3.5 bg-gray-800 rounded-full shadow-inner";
  const empty = "w-3.5 h-3.5"; // Empty space

  switch (value) {
    case 1:
      return (
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
        </div>
      );
    case 2:
      return (
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={dot}></div>
        </div>
      );
    case 3:
      return (
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={dot}></div>
        </div>
      );
    case 4:
      return (
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
        </div>
      );
    case 5:
      return (
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
        </div>
      );
    case 6:
      return (
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
          <div className={dot}></div>
          <div className={empty}></div>
          <div className={dot}></div>
        </div>
      );
    default:
      return <div className="text-2xl font-bold text-black">?</div>;
  }
}

function Dice({ value, rolling }: { value: number; rolling: boolean }) {
  // Ensure value is a valid dice number (1-6)
  const diceValue = rolling ? 0 : (value >= 1 && value <= 6 ? value : 1);

  return (
    <div
      className={`w-24 h-24 flex items-center justify-center rounded-xl border-4 border-gray-800 bg-gradient-to-br from-white to-gray-100 shadow-xl transition-all duration-300 ${
        rolling ? "animate-bounce scale-110" : "hover:scale-105"
      }`}
      style={{
        boxShadow: rolling
          ? "0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)"
          : "0 8px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)"
      }}
    >
      {rolling ? (
        <div className="text-4xl font-bold text-gray-600 animate-pulse">?</div>
      ) : (
        <DiceFace value={diceValue} />
      )}
    </div>
  );
}

const TOKENS = [
  {
    symbol: "ETH",
    decimals: 18,
    address: undefined // Native ETH
  },
  {
    symbol: "USDC",
    decimals: 6,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}` // USDC on Base
  },
];

export default function DiceGame() {
  const { address, isConnected } = useAccount();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<{
    initialRoll?: [number, number];
    outcome?: string;
    reason?: string;
    error?: string;
    lastRoll?: [number, number];
    lastTotal?: number;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mode, setMode] = useState<"offchain" | "onchain">("offchain");
  const [betToken, setBetToken] = useState("ETH");
  const [betAmount, setBetAmount] = useState(0.01);

  const [txError, setTxError] = useState("");
  const [gameState, setGameState] = useState<"idle" | "continue" | "finished">("idle");
  const [currentDice, setCurrentDice] = useState<[number, number]>([1, 1]);
  const [additionalRolls, setAdditionalRolls] = useState<Array<{roll: [number, number], total: number}>>([]);

  // Get the current token configuration
  const currentToken = TOKENS.find(t => t.symbol === betToken);

  // Fetch balance using wagmi's useBalance hook
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useBalance({
    address: address,
    token: currentToken?.address, // undefined for ETH (native token)
  });



  // Convert balance to number for display
  const balance = balanceData ?
    currentToken?.decimals === 6 ?
      parseFloat((Number(balanceData.value) / 1e6).toString()) : // USDC has 6 decimals
      parseFloat(formatEther(balanceData.value)) : // ETH has 18 decimals
    null;

  const handleRoll = async () => {
    setIsRolling(true);
    setResult(null);
    setShowConfetti(false);
    setTxError("");
    setAdditionalRolls([]);
    try {
      const res = await fetch("/api/roll");
      const data = await res.json();

      setResult(data);
      setCurrentDice(data.initialRoll);
      setGameState(data.gameState);

      if (data.outcome === "win") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } catch {
      setResult({ error: "Failed to roll dice." });
      setGameState("idle");
    }
    setIsRolling(false);
  };

  const handleContinueRoll = async () => {
    setIsRolling(true);
    try {
      const res = await fetch("/api/roll/continue");
      const data = await res.json();


      // Update current dice to show the new roll
      setCurrentDice(data.roll);

      // Add this roll to the additional rolls history
      setAdditionalRolls(prev => [...prev, { roll: data.roll, total: data.total }]);

      // Update game state and result
      setGameState(data.gameState);
      setResult((prev) => ({
        ...prev,
        outcome: data.outcome,
        reason: data.reason,
        lastRoll: data.roll,
        lastTotal: data.total
      }));

      if (data.outcome === "win") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } catch {
      setResult((prev) => ({ ...prev, error: "Failed to continue rolling." }));
    }
    setIsRolling(false);
  };

  // Create transaction calls for the dice game
  const createBetTransaction = () => {
    // For demo purposes, we'll create a simple ETH transfer to simulate a bet
    // In a real implementation, this would call a smart contract like:
    // - DiceGame.placeBet(betAmount) for placing bets
    // - DiceGame.claimWinnings() for claiming winnings
    const calls = [{
      to: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Null address for demo
      data: '0x' as `0x${string}`,
      value: parseEther(betAmount.toString()),
    }];

    return calls;
  };

  const handleOnchainSuccess = async () => {
    // Transaction succeeded, now roll the dice
    await handleRoll();
  };

  const handleOnchainError = (error: Error | { message?: string }) => {
    setTxError(`Transaction failed: ${error?.message || 'Unknown error'}`);
    setGameState("idle");
  };

  const canBet = isConnected && betAmount > 0 && balance !== null && betAmount <= balance;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-900 relative">
      {/* Stake Display Window - Top Right Corner */}
      {mode === "onchain" && betAmount > 0 && (
        <div className={`fixed top-4 right-4 bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border-2 border-blue-200 z-10 animate-slide-in ${
          gameState !== "idle" ? "animate-glow" : ""
        }`}>
          <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Current Stake</div>
          <div className="text-xl font-bold text-gray-800 flex items-center gap-2 mt-1">
            <span className="text-2xl">💰</span>
            <span className="font-mono">{betAmount} {betToken}</span>
          </div>
          {gameState !== "idle" && (
            <div className="text-xs text-blue-500 font-medium mt-1 animate-pulse">
              🎲 Game in progress...
            </div>
          )}
        </div>
      )}

      <h1 className="text-3xl font-extrabold text-white mb-6 drop-shadow-lg">Pop Ma Dice 🎲</h1>
      <div className="mb-4 flex gap-4">
        <Button
          variant={mode === "offchain" ? "primary" : "outline"}
          onClick={() => setMode("offchain")}
        >
          Offchain
        </Button>
        <Button
          variant={mode === "onchain" ? "primary" : "outline"}
          onClick={() => setMode("onchain")}
        >
          Onchain
        </Button>
      </div>

      {/* Wallet Connection Section */}
      <div className="mb-6">
        <Wallet>
          <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
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
      <div className="flex space-x-12 mb-8">
        <Dice
          value={currentDice[0]}
          rolling={isRolling}
        />
        <Dice
          value={currentDice[1]}
          rolling={isRolling}
        />
      </div>

      {mode === "onchain" && (
        <div className="mb-6 flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="flex gap-2 w-full">
            <select
              className="flex-1 px-2 py-2 rounded border bg-white text-black font-medium"
              value={betToken}
              onChange={e => setBetToken(e.target.value)}
            >
              {TOKENS.map(t => (
                <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
              ))}
            </select>
            <input
              type="number"
              min="0.0001"
              step="0.0001"
              className="flex-1 px-2 py-2 rounded border"
              value={betAmount}
              onChange={e => setBetAmount(Number(e.target.value))}
              disabled={!isConnected}
            />
          </div>
          <div className="text-xs text-white mt-1">
            Balance: {
              !isConnected ? "Connect wallet" :
              balanceLoading ? `Loading ${betToken}...` :
              balanceError ? `Error loading ${betToken} balance` :
              balance !== null ? `${balance.toFixed(4)} ${betToken}` :
              `0.0000 ${betToken}`
            }
          </div>
        </div>
      )}
      <div className="mb-4 flex gap-4">
        {gameState === "idle" ? (
          // Initial roll buttons
          mode === "onchain" ? (
            <Transaction
              calls={createBetTransaction()}
              onSuccess={handleOnchainSuccess}
              onError={handleOnchainError}
            >
              <TransactionButton
                disabled={!canBet || isRolling}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                text={`Place Bet + Roll (${betAmount} ${betToken})`}
              />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <Button
              onClick={handleRoll}
              disabled={isRolling}
              variant="primary"
              size="lg"
            >
              {isRolling ? "Rolling..." : "Roll Dice"}
            </Button>
          )
        ) : gameState === "continue" ? (
          // Continue rolling button
          <Button
            onClick={handleContinueRoll}
            disabled={isRolling}
            variant="primary"
            size="lg"
          >
            {isRolling ? "Rolling..." : "Roll Again"}
          </Button>
        ) : (
          // Game finished - new game button
          <Button
            onClick={() => {
              setGameState("idle");
              setResult(null);
              setCurrentDice([1, 1]);
              setAdditionalRolls([]);
            }}
            variant="outline"
            size="lg"
          >
            New Game
          </Button>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        {result && (
          <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-2xl border border-gray-200 backdrop-blur-sm max-w-fit relative overflow-hidden animate-slide-in ${
            result.outcome === "lose" ? "animate-shake" : ""
          }`}>
            {/* Decorative background pattern */}
            <div className={`absolute inset-0 rounded-xl ${
              result.outcome === "win"
                ? "bg-gradient-to-br from-green-50/40 to-emerald-50/40"
                : result.outcome === "lose"
                ? "bg-gradient-to-br from-red-50/40 to-pink-50/40"
                : "bg-gradient-to-br from-blue-50/30 to-purple-50/30"
            }`}></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4 text-center">
                <div className="text-sm font-semibold text-gray-600 mb-2 flex items-center justify-center gap-1">
                  <span>🎲</span> Initial Roll
                </div>
                <div className="text-2xl font-bold font-mono text-gray-800 bg-white/80 px-4 py-2 rounded-xl inline-block shadow-sm border">
                  [{result.initialRoll?.join(", ")}]
                </div>
              </div>

              {additionalRolls.length > 0 && (
                <div className="mb-4 text-center">
                  <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center justify-center gap-1">
                    <span>📈</span> Additional Rolls
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {additionalRolls.map((rollData, idx) => (
                      <div key={idx} className="text-sm font-mono text-gray-700 bg-white/60 px-3 py-1 rounded-lg shadow-sm border">
                        [{rollData.roll.join(", ")}] = {rollData.total}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className={`text-4xl font-extrabold mb-2 transition-all duration-300 ${
                  result.outcome === "win"
                    ? "text-green-600 drop-shadow-lg animate-bounce"
                    : result.outcome === "lose"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}>
                  {result.outcome === "win" ? "🎉 POP! 🎉" : result.outcome === "lose" ? "💥 KRAP! 💥" : "🎲"}
                </div>
                {result.reason && (
                  <div className={`text-sm font-semibold px-4 py-2 rounded-full inline-block shadow-sm ${
                    result.outcome === "win"
                      ? "text-green-700 bg-green-100 border border-green-200"
                      : result.outcome === "lose"
                      ? "text-red-700 bg-red-100 border border-red-200"
                      : "text-blue-700 bg-blue-100 border border-blue-200"
                  }`}>
                    {result.reason}
                  </div>
                )}
              </div>

              {showConfetti && (
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-20">
                  <div className="text-7xl animate-bounce">🎊✨🎊</div>
                </div>
              )}

              {(result.error || txError) && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200 shadow-sm">
                    <span className="text-lg">⚠️</span> {result.error || txError}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        body { background: #166534; }
        .glow { box-shadow: 0 0 20px 5px #ffd700; }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}
