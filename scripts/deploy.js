const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎲 Deploying Pop Ma Dice Smart Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Get network info
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log(`🌐 Network: ${network} (Chain ID: ${chainId})\n`);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Deploy contract
  console.log("⏳ Deploying DiceGame contract...");
  const DiceGame = await hre.ethers.getContractFactory("DiceGame");
  const diceGame = await DiceGame.deploy(deployer.address);
  await diceGame.waitForDeployment();

  const contractAddress = await diceGame.getAddress();
  console.log(`✅ DiceGame deployed to: ${contractAddress}\n`);

  // Save deployment info
  const deploymentInfo = {
    network,
    chainId,
    contractAddress,
    deployerAddress: deployer.address,
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
    deploymentTime: new Date().toISOString(),
    transactionHash: diceGame.deploymentTransaction().hash,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentFile}\n`);

  // Verify contract on Etherscan (if not on hardhat)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("⏳ Waiting for block confirmations before verification...");
    await diceGame.deploymentTransaction().wait(5);

    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Contract verified on Etherscan!\n");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified on Etherscan!\n");
      } else {
        console.log("⚠️  Verification failed. You can verify manually later.\n");
        console.log(`Manual verification command:`);
        console.log(`npx hardhat verify --network ${network} ${contractAddress} ${deployer.address}\n`);
      }
    }
  }

  // Display next steps
  console.log("🎉 Deployment complete!\n");
  console.log("📋 Next steps:");
  console.log(`1. Update your .env file with:`);
  console.log(`   NEXT_PUBLIC_DICE_GAME_CONTRACT=${contractAddress}`);
  console.log(`\n2. Test the contract on testnet before mainnet deployment`);
  console.log(`\n3. For mainnet deployment, run:`);
  console.log(`   npx hardhat run scripts/deploy.js --network baseMainnet\n`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

