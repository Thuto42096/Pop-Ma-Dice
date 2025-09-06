import { NextResponse } from "next/server";

function rollDice() {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

const POP_COMBOS = [
  [5, 2],
  [2, 5],
  [4, 3],
  [3, 4],
  [6, 1],
  [1, 6],
  [6, 5],
  [5, 6],
];
const KRAP_COMBOS = [
  [2, 1],
  [1, 2],
  [1, 1],
  [6, 6],
];

export async function GET() {
  const initialRoll = rollDice();
  let outcome = "";
  let reason = "";
  let gameState = "";

  // Check for Pop (win)
  if (POP_COMBOS.some(([a, b]) => a === initialRoll[0] && b === initialRoll[1])) {
    outcome = "win";
    reason = "pop";
    gameState = "finished";
  } else if (KRAP_COMBOS.some(([a, b]) => a === initialRoll[0] && b === initialRoll[1])) {
    outcome = "lose";
    reason = "krap";
    gameState = "finished";
  } else {
    // Game continues - user needs to roll again
    outcome = "";
    reason = "roll again to get 5 (win) or 7 (lose)";
    gameState = "continue";
  }

  return NextResponse.json({
    initialRoll,
    outcome,
    reason,
    gameState,
    rolls: [], // No additional rolls yet
  });
}