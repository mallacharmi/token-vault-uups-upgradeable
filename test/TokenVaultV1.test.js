import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, upgrades } = hardhat;

describe("TokenVaultV1", function () {
  let token;
  let vault;
  let admin;
  let user;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();
    await token.waitForDeployment();

    await token.mint(user.address, ethers.parseEther("1000"));

    const TokenVaultV1 = await ethers.getContractFactory("TokenVaultV1");
    vault = await upgrades.deployProxy(
      TokenVaultV1,
      [await token.getAddress(), admin.address, 500],
      { kind: "uups" }
    );
    await vault.waitForDeployment();

    await token
      .connect(user)
      .approve(await vault.getAddress(), ethers.parseEther("1000"));
  });

  it("should initialize with correct parameters", async function () {
    expect(await vault.getDepositFee()).to.equal(500n);
    expect(await vault.totalDeposits()).to.equal(0n);
  });

  it("should allow deposits and update balances", async function () {
    await vault.connect(user).deposit(ethers.parseEther("100"));
    expect(await vault.balanceOf(user.address)).to.be.gt(0n);
  });

  it("should deduct deposit fee correctly", async function () {
    await vault.connect(user).deposit(ethers.parseEther("100"));
    expect(await vault.balanceOf(user.address)).to.equal(
      ethers.parseEther("95")
    );
  });

  it("should allow withdrawals and update balances", async function () {
    await vault.connect(user).deposit(ethers.parseEther("100"));
    await vault.connect(user).withdraw(ethers.parseEther("50"));

    expect(await vault.balanceOf(user.address)).to.equal(
      ethers.parseEther("45")
    );
  });

  it("should prevent withdrawal of more than balance", async function () {
    await vault.connect(user).deposit(ethers.parseEther("100"));

    let failed = false;
    try {
      await vault.connect(user).withdraw(ethers.parseEther("200"));
    } catch (e) {
      failed = true;
    }
    expect(failed).to.equal(true);
  });

  it("should prevent reinitialization", async function () {
    let failed = false;
    try {
      await vault.initialize(
        await token.getAddress(),
        admin.address,
        100
      );
    } catch (e) {
      failed = true;
    }
    expect(failed).to.equal(true);
  });
});
