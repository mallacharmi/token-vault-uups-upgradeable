import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

describe("Upgrade V1 to V2", function () {
  let token;
  let vaultV1;
  let vaultV2;
  let admin;
  let user;
  let other;

  beforeEach(async function () {
    [admin, user, other] = await ethers.getSigners();

    // Deploy mock token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();
    await token.waitForDeployment();

    await token.mint(user.address, ethers.parseEther("1000"));

    // Deploy V1 proxy
    const TokenVaultV1 = await ethers.getContractFactory("TokenVaultV1");
    vaultV1 = await upgrades.deployProxy(
      TokenVaultV1,
      [await token.getAddress(), admin.address, 500],
      { kind: "uups" }
    );
    await vaultV1.waitForDeployment();

    await token
      .connect(user)
      .approve(await vaultV1.getAddress(), ethers.parseEther("1000"));

    await vaultV1.connect(user).deposit(ethers.parseEther("100"));

    // Upgrade to V2
    const TokenVaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vaultV2 = await upgrades.upgradeProxy(
      await vaultV1.getAddress(),
      TokenVaultV2
    );

    await vaultV2.initializeV2(500); // 5% yield
  });

  it("should preserve user balances after upgrade", async function () {
    expect(await vaultV2.balanceOf(user.address)).to.equal(
      ethers.parseEther("95")
    );
  });

  it("should preserve total deposits after upgrade", async function () {
    expect(await vaultV2.totalDeposits()).to.equal(
      ethers.parseEther("95")
    );
  });

  it("should maintain admin access control after upgrade", async function () {
    const role = await vaultV2.DEFAULT_ADMIN_ROLE();
    expect(await vaultV2.hasRole(role, admin.address)).to.equal(true);
  });

  it("should allow setting yield rate in V2", async function () {
    await vaultV2.connect(admin).setYieldRate(1000);
    expect(await vaultV2.getYieldRate()).to.equal(1000n);
  });

  it("should calculate yield correctly", async function () {
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const yieldAmount = await vaultV2.getUserYield(user.address);
    expect(yieldAmount).to.be.gt(0n);
  });

  it("should prevent non-admin from setting yield rate", async function () {
    await expect(
      vaultV2.connect(user).setYieldRate(200)
    ).to.be.reverted;
  });

  it("should allow pausing deposits in V2", async function () {
    await vaultV2.connect(admin).pauseDeposits();
    expect(await vaultV2.isDepositsPaused()).to.equal(true);
  });

  /* =======================
     🔥 COVERAGE BOOST TESTS
     ======================= */

  it("should revert deposit when deposits are paused", async function () {
    await vaultV2.connect(admin).pauseDeposits();

    await expect(
      vaultV2.connect(user).deposit(ethers.parseEther("10"))
    ).to.be.revertedWith("Deposits paused");
  });

  it("should allow deposit after unpausing deposits", async function () {
    await vaultV2.connect(admin).pauseDeposits();
    await vaultV2.connect(admin).unpauseDeposits();

    await vaultV2.connect(user).deposit(ethers.parseEther("10"));

    expect(await vaultV2.balanceOf(user.address)).to.be.gt(
      ethers.parseEther("95")
    );
  });

  it("should return zero yield for user with no balance", async function () {
    const yieldValue = await vaultV2.getUserYield(other.address);
    expect(yieldValue).to.equal(0n);
  });

  it("should revert claimYield when user has no yield", async function () {
    await expect(
      vaultV2.connect(other).claimYield()
    ).to.be.revertedWith("No yield available");
  });
});
