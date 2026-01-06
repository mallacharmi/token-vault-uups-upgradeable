// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./TokenVaultV2.sol";

contract TokenVaultV3 is TokenVaultV2 {
    // ========== V3 STORAGE ==========
    uint256 internal withdrawalDelay;

    mapping(address => uint256) internal withdrawalAmount;
    mapping(address => uint256) internal withdrawalRequestTime;

    // V2 gap was 45, we add 3 vars → 42 left
    uint256[42] private __gapV3;

    // ========== REINITIALIZER ==========
    function initializeV3(uint256 _delaySeconds) external reinitializer(3) {
        withdrawalDelay = _delaySeconds;
    }

    // ========== WITHDRAWAL DELAY ==========
    function setWithdrawalDelay(uint256 _delaySeconds)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        withdrawalDelay = _delaySeconds;
    }

    function getWithdrawalDelay() external view returns (uint256) {
        return withdrawalDelay;
    }

    function requestWithdrawal(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        withdrawalAmount[msg.sender] = amount;
        withdrawalRequestTime[msg.sender] = block.timestamp;
    }

    function executeWithdrawal() external returns (uint256) {
        uint256 amount = withdrawalAmount[msg.sender];
        require(amount > 0, "No pending withdrawal");

        uint256 requestTime = withdrawalRequestTime[msg.sender];
        require(
            block.timestamp >= requestTime + withdrawalDelay,
            "Withdrawal delay not met"
        );

        withdrawalAmount[msg.sender] = 0;
        withdrawalRequestTime[msg.sender] = 0;

        balances[msg.sender] -= amount;
        _totalDeposits -= amount;

        token.transfer(msg.sender, amount);

        return amount;
    }

    function emergencyWithdraw() external returns (uint256) {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Nothing to withdraw");

        balances[msg.sender] = 0;
        _totalDeposits -= balance;

        withdrawalAmount[msg.sender] = 0;
        withdrawalRequestTime[msg.sender] = 0;

        token.transfer(msg.sender, balance);

        return balance;
    }

    function getWithdrawalRequest(address user)
        external
        view
        returns (uint256 amount, uint256 requestTime)
    {
        return (
            withdrawalAmount[user],
            withdrawalRequestTime[user]
        );
    }

    function getImplementationVersion()
        external
        pure
        override
        returns (string memory)
    {
        return "V3";
    }
}
