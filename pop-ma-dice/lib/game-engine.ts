// Game engine for managing game logic and state

import {
  GameSession,
  GameOutcome,
  GameStatus,
  rollDice,
  determineOutcome,
  GAME_RULES,
} from './game-types';

export class GameEngine {
  /**
   * Create a new game session
   */
  static createGameSession(
    player1Id: string,
    player1Address: `0x${string}`,
    betAmount: bigint,
    mode: 'pvp' | 'pve' = 'pvp'
  ): GameSession {
    return {
      id: this.generateGameId(),
      mode,
      status: 'waiting',
      player1: {
        id: player1Id,
        address: player1Address,
        betAmount,
        rolls: [],
        outcome: null,
      },
      currentRound: 0,
      maxRounds: GAME_RULES.MAX_ROUNDS,
      createdAt: new Date(),
      totalPot: betAmount,
    };
  }

  /**
   * Add second player to game session
   */
  static addPlayer2(
    game: GameSession,
    player2Id: string,
    player2Address: `0x${string}`,
    betAmount: bigint
  ): GameSession {
    return {
      ...game,
      player2: {
        id: player2Id,
        address: player2Address,
        betAmount,
        rolls: [],
        outcome: null,
      },
      status: 'active',
      startedAt: new Date(),
      totalPot: game.player1.betAmount + betAmount,
    };
  }

  /**
   * Execute a round of the game
   */
  static executeRound(game: GameSession): GameSession {
    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const player1Roll = rollDice();
    const player2Roll = game.player2 ? rollDice() : null;

    const player1Outcome = determineOutcome(player1Roll);
    const player2Outcome = player2Roll ? determineOutcome(player2Roll) : null;

    // Update rolls
    game.player1.rolls.push(player1Roll);
    if (game.player2 && player2Roll) {
      game.player2.rolls.push(player2Roll);
    }

    // Determine if game is finished
    let isFinished = false;
    let winner: string | undefined;

    if (game.mode === 'pvp' && game.player2) {
      // PvP: Compare outcomes
      if (player1Outcome && player2Outcome) {
        isFinished = true;
        if (player1Outcome === 'win' && player2Outcome === 'lose') {
          winner = game.player1.id;
        } else if (player1Outcome === 'lose' && player2Outcome === 'win') {
          winner = game.player2.id;
        }
        // Draw if both win or both lose
      }
    } else {
      // PvE: Player vs House
      if (player1Outcome) {
        isFinished = true;
        if (player1Outcome === 'win') {
          winner = game.player1.id;
        }
      }
    }

    // Check if max rounds reached
    if (game.currentRound >= game.maxRounds) {
      isFinished = true;
    }

    return {
      ...game,
      player1: {
        ...game.player1,
        outcome: player1Outcome,
      },
      player2: game.player2
        ? {
            ...game.player2,
            outcome: player2Outcome,
          }
        : undefined,
      currentRound: game.currentRound + 1,
      status: isFinished ? 'finished' : 'active',
      finishedAt: isFinished ? new Date() : undefined,
      winner,
    };
  }

  /**
   * Calculate winnings based on game result
   */
  static calculateWinnings(game: GameSession): {
    player1Winnings: bigint;
    player2Winnings: bigint;
  } {
    if (game.status !== 'finished') {
      return { player1Winnings: BigInt(0), player2Winnings: BigInt(0) };
    }

    const totalPot = game.totalPot;

    if (!game.winner) {
      // Draw - split pot
      const halfPot = totalPot / BigInt(2);
      return {
        player1Winnings: halfPot,
        player2Winnings: halfPot,
      };
    }

    if (game.winner === game.player1.id) {
      return {
        player1Winnings: totalPot,
        player2Winnings: BigInt(0),
      };
    } else {
      return {
        player1Winnings: BigInt(0),
        player2Winnings: totalPot,
      };
    }
  }

  /**
   * Validate bet amount
   */
  static validateBet(amount: bigint): boolean {
    return (
      amount >= GAME_RULES.MIN_BET && amount <= GAME_RULES.MAX_BET
    );
  }

  /**
   * Generate unique game ID
   */
  private static generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

