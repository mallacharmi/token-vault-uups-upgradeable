import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

async function main() {
  const [admin] = await ethers.getSigners();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy();
  await token.waitForDeployment();

  console.log("MockERC20 deployed to:", await token.getAddress());

  const TokenVaultV1 = await ethers.getContractFactory("TokenVaultV1");
  const vault = await upgrades.deployProxy(
    TokenVaultV1,
    [await token.getAddress(), admin.address, 500],
    { kind: "uups" }
  );

  await vault.waitForDeployment();
  console.log("TokenVaultV1 proxy deployed to:", await vault.getAddress());
}

main().catch(console.error);
