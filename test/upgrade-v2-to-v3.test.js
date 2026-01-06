import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

describe("Upgrade V2 to V3", function () {
  let token;
  let vaultV1;
  let vaultV2;
  let vaultV3;
  let admin;
  let user;
  let other;

  beforeEach(async function () {
    [admin, user, other] = await ethers.getSigners();

    // Deploy Mock ERC20
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();
    await token.waitForDeployment();

    await token.mint(user.address, ethers.parseEther("1000"));

    // Deploy V1
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

    // Upgrade to V3
    const TokenVaultV3 = await ethers.getContractFactory("TokenVaultV3");
    vaultV3 = await upgrades.upgradeProxy(
      await vaultV2.getAddress(),
      TokenVaultV3
    );
    await vaultV3.initializeV3(7 * 24 * 60 * 60); // 7 days delay
  });

  it("should preserve all V2 state after upgrade", async function () {
    expect(await vaultV3.balanceOf(user.address)).to.equal(
      ethers.parseEther("95")
    );
    expect(await vaultV3.getYieldRate()).to.equal(500n);
  });

  it("should allow setting withdrawal delay", async function () {
    await vaultV3.connect(admin).setWithdrawalDelay(3 * 24 * 60 * 60);
    expect(await vaultV3.getWithdrawalDelay()).to.equal(
      3n * 24n * 60n * 60n
    );
  });

  it("should handle withdrawal requests correctly", async function () {
    await vaultV3.connect(user).requestWithdrawal(ethers.parseEther("50"));

    const req = await vaultV3.getWithdrawalRequest(user.address);
    expect(req.amount).to.equal(ethers.parseEther("50"));
  });

  it("should enforce withdrawal delay", async function () {
    await vaultV3.connect(user).requestWithdrawal(ethers.parseEther("50"));

    await expect(
      vaultV3.connect(user).executeWithdrawal()
    ).to.be.reverted;
  });

  it("should allow emergency withdrawals", async function () {
    const before = await token.balanceOf(user.address);

    await vaultV3.connect(user).emergencyWithdraw();

    const after = await token.balanceOf(user.address);

    expect(after - before).to.equal(ethers.parseEther("95"));
  });

  it("should prevent premature withdrawal execution", async function () {
    await vaultV3.connect(user).requestWithdrawal(ethers.parseEther("50"));

    await expect(
      vaultV3.connect(user).executeWithdrawal()
    ).to.be.reverted;
  });

  /* =======================
     🔥 ADDITIONAL TESTS
     (Coverage Boosters)
     ======================= */

  it("should revert executeWithdrawal if no request exists", async function () {
    await expect(
      vaultV3.connect(other).executeWithdrawal()
    ).to.be.reverted;
  });

  it("should revert emergencyWithdraw if user has no balance", async function () {
    await expect(
      vaultV3.connect(other).emergencyWithdraw()
    ).to.be.reverted;
  });

  it("should overwrite previous withdrawal request", async function () {
    await vaultV3.connect(user).requestWithdrawal(ethers.parseEther("40"));
    await vaultV3.connect(user).requestWithdrawal(ethers.parseEther("20"));

    const req = await vaultV3.getWithdrawalRequest(user.address);
    expect(req.amount).to.equal(ethers.parseEther("20"));
  });

  it("should allow withdrawal execution after delay", async function () {
    await vaultV3.connect(user).requestWithdrawal(ethers.parseEther("30"));

    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const before = await token.balanceOf(user.address);
    await vaultV3.connect(user).executeWithdrawal();
    const after = await token.balanceOf(user.address);

    expect(after).to.be.gt(before);
  });
});
