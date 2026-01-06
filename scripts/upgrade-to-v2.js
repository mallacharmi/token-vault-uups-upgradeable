import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

async function main() {
  const proxyAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const TokenVaultV2 = await ethers.getContractFactory("TokenVaultV2");
  const vault = await upgrades.upgradeProxy(proxyAddress, TokenVaultV2);

  await vault.initializeV2(500);

  console.log("Upgraded to TokenVaultV2 at:", await vault.getAddress());
}

main().catch(console.error);
