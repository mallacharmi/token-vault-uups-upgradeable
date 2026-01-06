// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenVaultV1 is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable
{
    // ========== ROLES ==========
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // ========== STORAGE (V1) ==========
    IERC20 internal token;
    uint256 internal depositFee; // basis points
    uint256 internal _totalDeposits;
    mapping(address => uint256) internal balances;

    // Storage gap for future upgrades
    uint256[50] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ========== INITIALIZER ==========
    function initialize(
        address _token,
        address _admin,
        uint256 _depositFee
    ) external initializer {
        require(_token != address(0), "Invalid token");
        require(_admin != address(0), "Invalid admin");

        __AccessControl_init();
        __UUPSUpgradeable_init();

        token = IERC20(_token);
        depositFee = _depositFee;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
    }

    // ========== CORE LOGIC ==========
    function deposit(uint256 amount) public virtual {
        require(amount > 0, "Amount must be > 0");

        uint256 fee = (amount * depositFee) / 10000;
        uint256 credited = amount - fee;

        token.transferFrom(msg.sender, address(this), amount);

        balances[msg.sender] += credited;
        _totalDeposits += credited;
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        _totalDeposits -= amount;

        token.transfer(msg.sender, amount);
    }

    // ========== VIEWS ==========
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }

    function totalDeposits() external view returns (uint256) {
        return _totalDeposits;
    }

    function getDepositFee() external view returns (uint256) {
        return depositFee;
    }

    function getImplementationVersion()
        external
        pure
        virtual
        returns (string memory)
    {
        return "V1";
    }

    // ========== UUPS ==========
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}
