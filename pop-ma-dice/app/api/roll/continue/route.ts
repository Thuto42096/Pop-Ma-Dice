import { NextResponse } from "next/server";

function rollDice() {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

export async function GET() {
  const roll = rollDice();
  const total = roll[0] + roll[1];
  let outcome = "";
  let reason = "";
  let gameState = "";

  if (total === 5) {
    outcome = "win";
    reason = "rolled 5";
    gameState = "finished";
  } else if (total === 7) {
    outcome = "lose";
    reason = "rolled 7";
    gameState = "finished";
  } else {
    // Game continues
    outcome = "";
    reason = `rolled ${total} - roll again to get 5 (win) or 7 (lose)`;
    gameState = "continue";
  }

  return NextResponse.json({
    roll,
    total,
    outcome,
    reason,
    gameState,
  });
}
