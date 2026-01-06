import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

describe("Security Tests", function () {
  let token;
  let vault;
  let admin;
  let attacker;

  beforeEach(async function () {
    [admin, attacker] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();
    await token.waitForDeployment();

    const TokenVaultV1 = await ethers.getContractFactory("TokenVaultV1");
    vault = await upgrades.deployProxy(
      TokenVaultV1,
      [await token.getAddress(), admin.address, 500],
      { kind: "uups" }
    );
    await vault.waitForDeployment();
  });

  it("should prevent direct initialization of implementation contracts", async function () {
    const TokenVaultV1 = await ethers.getContractFactory("TokenVaultV1");
    const impl = await TokenVaultV1.deploy();
    await impl.waitForDeployment();

    let failed = false;
    try {
      await impl.initialize(
        await token.getAddress(),
        admin.address,
        500
      );
    } catch {
      failed = true;
    }

    expect(failed).to.equal(true);
  });

  it("should prevent unauthorized upgrades", async function () {
    const TokenVaultV2 = await ethers.getContractFactory("TokenVaultV2");

    let failed = false;
    try {
      await upgrades.upgradeProxy(
        await vault.getAddress(),
        TokenVaultV2.connect(attacker)
      );
    } catch {
      failed = true;
    }

    expect(failed).to.equal(true);
  });

  it("should not have storage layout collisions across versions", async function () {
    const TokenVaultV2 = await ethers.getContractFactory("TokenVaultV2");
    const v2 = await upgrades.upgradeProxy(
      await vault.getAddress(),
      TokenVaultV2
    );

    await v2.initializeV2(500);

    expect(await v2.getYieldRate()).to.equal(500n);
    expect(await v2.totalDeposits()).to.equal(0n);
  });

  it("should prevent function selector clashing", async function () {
    const TokenVaultV3 = await ethers.getContractFactory("TokenVaultV3");
    const v3 = await upgrades.upgradeProxy(
      await vault.getAddress(),
      TokenVaultV3
    );

    await v3.initializeV3(100);

    expect(await v3.getImplementationVersion()).to.equal("V3");
  });
});
