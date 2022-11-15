const {ethers} = require("hardhat");

async function main() {
  const whitelistContract = await ethers.getContractFactory("Whitelist");
  const deployedWhitelist = await whitelistContract.deploy(10);
  await deployedWhitelist.deployed();

  console.log("Whitelist contract address: ", deployedWhitelist.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })