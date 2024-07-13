const hre = require('hardhat');

async function main() {
  const GameMarketplace = await hre.ethers.getContractFactory('GameMarketplace');
  const marketplace = await GameMarketplace.deploy();

  await marketplace.waitForDeployment();

  console.log('GameMarketplace deployed to:', marketplace.target);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
