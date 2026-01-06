import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

async function main() {
  const proxyAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const TokenVaultV3 = await ethers.getContractFactory("TokenVaultV3");
  const vault = await upgrades.upgradeProxy(proxyAddress, TokenVaultV3);

  await vault.initializeV3(7 * 24 * 60 * 60);

  console.log("Upgraded to TokenVaultV3 at:", await vault.getAddress());
}

main().catch(console.error);
