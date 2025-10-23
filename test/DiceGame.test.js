const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiceGame Contract", function () {
  let diceGame;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const DiceGame = await ethers.getContractFactory("DiceGame");
    diceGame = await DiceGame.deploy(owner.address);
    await diceGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct owner", async function () {
      expect(await diceGame.owner()).to.equal(owner.address);
    });

    it("Should have native token supported by default", async function () {
      expect(await diceGame.supportedTokens(ethers.ZeroAddress)).to.be.true;
    });

    it("Should have correct platform fee", async function () {
      expect(await diceGame.platformFeePercentage()).to.equal(5);
    });
  });

  describe("Place Bet", function () {
    it("Should place a bet with native ETH", async function () {
      const betAmount = ethers.parseEther("1");
      const tx = await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      expect(tx).to.emit(diceGame, "BetPlaced");

      const gameState = await diceGame.getGameState(0);
      expect(gameState.player).to.equal(player1.address);
      expect(gameState.betAmount).to.equal(betAmount);
    });

    it("Should reject bet with zero amount", async function () {
      await expect(
        diceGame.connect(player1).placeBet(0, ethers.ZeroAddress, { value: 0 })
      ).to.be.revertedWith("Bet amount must be greater than 0");
    });

    it("Should reject unsupported token", async function () {
      const betAmount = ethers.parseEther("1");
      const fakeToken = ethers.ZeroAddress;

      await expect(
        diceGame.connect(player1).placeBet(betAmount, "0x1234567890123456789012345678901234567890")
      ).to.be.revertedWith("Token not supported");
    });

    it("Should update player stats", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      const stats = await diceGame.getPlayerStats(player1.address);
      expect(stats.totalBets).to.equal(betAmount);
    });
  });

  describe("Roll Dice", function () {
    it("Should roll dice for initial roll", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      const tx = await diceGame.connect(player1).rollDice(0);
      expect(tx).to.emit(diceGame, "DiceRolled");

      const gameState = await diceGame.getGameState(0);
      expect(gameState.initialRoll1).to.be.greaterThan(0);
      expect(gameState.initialRoll2).to.be.greaterThan(0);
    });

    it("Should reject roll from non-player", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      await expect(diceGame.connect(player2).rollDice(0)).to.be.revertedWith("Not your game");
    });

    it("Should reject double roll", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      await diceGame.connect(player1).rollDice(0);
      await expect(diceGame.connect(player1).rollDice(0)).to.be.revertedWith("Already rolled");
    });
  });

  describe("Continue Roll", function () {
    it("Should continue rolling", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      await diceGame.connect(player1).rollDice(0);
      const tx = await diceGame.connect(player1).continueRoll(0);
      expect(tx).to.emit(diceGame, "DiceRolled");
    });

    it("Should reject continue roll before initial roll", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      await expect(diceGame.connect(player1).continueRoll(0)).to.be.revertedWith("Must roll first");
    });
  });

  describe("Claim Winnings", function () {
    it("Should reject claim if game not won", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      await diceGame.connect(player1).rollDice(0);

      const gameState = await diceGame.getGameState(0);
      if (!gameState.won) {
        await expect(diceGame.connect(player1).claimWinnings(0)).to.be.revertedWith(
          "Game not won"
        );
      }
    });

    it("Should reject claim from non-player", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      await expect(diceGame.connect(player2).claimWinnings(0)).to.be.revertedWith("Not your game");
    });
  });

  describe("Player Stats", function () {
    it("Should track player stats correctly", async function () {
      const betAmount = ethers.parseEther("1");
      await diceGame.connect(player1).placeBet(betAmount, ethers.ZeroAddress, {
        value: betAmount,
      });

      const stats = await diceGame.getPlayerStats(player1.address);
      expect(stats.totalBets).to.equal(betAmount);
      expect(stats.gamesWon).to.equal(0);
      expect(stats.gamesLost).to.equal(0);
    });
  });

  describe("Token Management", function () {
    it("Should add supported token", async function () {
      const fakeToken = "0x1234567890123456789012345678901234567890";
      await diceGame.connect(owner).addSupportedToken(fakeToken);
      expect(await diceGame.supportedTokens(fakeToken)).to.be.true;
    });

    it("Should remove supported token", async function () {
      const fakeToken = "0x1234567890123456789012345678901234567890";
      await diceGame.connect(owner).addSupportedToken(fakeToken);
      await diceGame.connect(owner).removeSupportedToken(fakeToken);
      expect(await diceGame.supportedTokens(fakeToken)).to.be.false;
    });

    it("Should reject token management from non-owner", async function () {
      const fakeToken = "0x1234567890123456789012345678901234567890";
      await expect(
        diceGame.connect(player1).addSupportedToken(fakeToken)
      ).to.be.revertedWithCustomError(diceGame, "OwnableUnauthorizedAccount");
    });
  });
});

