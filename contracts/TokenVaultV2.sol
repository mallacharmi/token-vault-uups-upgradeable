// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./TokenVaultV1.sol";

contract TokenVaultV2 is TokenVaultV1 {
    // ========== ROLES ==========
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ========== V2 STORAGE ==========
    uint256 internal yieldRate;          // basis points
    bool internal depositsPaused;

    mapping(address => uint256) internal lastClaimTime;
    mapping(address => uint256) internal pendingYield;

    uint256 internal v2StartTime;         // baseline for old users

    // V1 gap was 50, we added 5 vars → 45 left
    uint256[45] private __gapV2;

    // ========== REINITIALIZER ==========
    function initializeV2(uint256 _yieldRate) external reinitializer(2) {
        yieldRate = _yieldRate;
        v2StartTime = block.timestamp;

        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // ========== YIELD ==========
    function setYieldRate(uint256 _yieldRate)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        yieldRate = _yieldRate;
    }

    function getYieldRate() external view returns (uint256) {
        return yieldRate;
    }

    function getUserYield(address user)
        public
        view
        returns (uint256)
    {
        uint256 balance = balances[user];
        if (balance == 0) return 0;

        uint256 lastTime = lastClaimTime[user];

        // Users who existed before V2 upgrade
        if (lastTime == 0) {
            lastTime = v2StartTime;
        }

        uint256 timeElapsed = block.timestamp - lastTime;

        return
            (balance * yieldRate * timeElapsed) /
            (365 days * 10000);
    }

    function claimYield() external returns (uint256) {
        uint256 yieldAmount = getUserYield(msg.sender);
        require(yieldAmount > 0, "No yield available");

        lastClaimTime[msg.sender] = block.timestamp;
        pendingYield[msg.sender] += yieldAmount;

        return yieldAmount;
    }

    // ========== PAUSE ==========
    function pauseDeposits() external onlyRole(PAUSER_ROLE) {
        depositsPaused = true;
    }

    function unpauseDeposits() external onlyRole(PAUSER_ROLE) {
        depositsPaused = false;
    }

    function isDepositsPaused() external view returns (bool) {
        return depositsPaused;
    }

    // ========== OVERRIDE DEPOSIT ==========
    function deposit(uint256 amount) public override {
        require(!depositsPaused, "Deposits paused");

        super.deposit(amount);

        if (lastClaimTime[msg.sender] == 0) {
            lastClaimTime[msg.sender] = block.timestamp;
        }
    }

    // 🔑 MUST be virtual because V3 overrides this
    function getImplementationVersion()
        external
        pure
        virtual
        override
        returns (string memory)
    {
        return "V2";
    }
}
