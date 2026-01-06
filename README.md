# TokenVault UUPS Upgradeable Smart Contract System

## 📌 Overview
This project implements a **production-grade upgradeable smart contract system** using the **UUPS (Universal Upgradeable Proxy Standard)** pattern.

The TokenVault protocol demonstrates how real-world blockchain systems evolve safely over time while preserving user funds and state across upgrades.

The system progresses through **three versions**:
- **V1** – Basic deposit & withdrawal with deposit fee
- **V2** – Yield generation and deposit pause control
- **V3** – Withdrawal delay and emergency withdrawal mechanisms

All upgrades preserve storage layout, user balances, and configuration, following OpenZeppelin and industry best practices.

---

## 🧠 Key Concepts Demonstrated
- UUPS Proxy Pattern
- Upgrade-safe storage layout with gaps
- Secure initializer usage
- Role-based access control
- Cross-version state preservation
- Yield calculation with upgrade migration
- Withdrawal delay & emergency mechanisms
- Production-grade automated testing

---

## 🛠 Tech Stack
- **Solidity** `^0.8.23`
- **Hardhat**
- **OpenZeppelin Contracts Upgradeable**
- **Ethers.js v6**
- **Mocha / Chai**

---

## 📂 Project Structure
```
token-vault-uups/
├── contracts/
│   ├── TokenVaultV1.sol
│   ├── TokenVaultV2.sol
│   ├── TokenVaultV3.sol
│   └── mocks/
│       └── MockERC20.sol
├── test/
│   ├── TokenVaultV1.test.js
│   ├── upgrade-v1-to-v2.test.js
│   ├── upgrade-v2-to-v3.test.js
│   └── security.test.js
├── scripts/
│   ├── deploy-v1.js
│   ├── upgrade-to-v2.js
│   └── upgrade-to-v3.js
├── hardhat.config.js
├── package.json
├── submission.yml
└── README.md
```

---

## 🔐 Contract Versions

### 🔹 TokenVaultV1
- Deposit with configurable fee (basis points)
- Withdraw funds
- Tracks user balances and total deposits
- UUPS upgrade authorization
- Prevents reinitialization

### 🔹 TokenVaultV2
- Adds yield generation (APR in basis points)
- Pause/unpause deposits
- Safe yield migration for existing users
- Tracks last claim time
- Role-based pauser control

### 🔹 TokenVaultV3
- Withdrawal delay mechanism
- Withdrawal request & execution flow
- Emergency withdrawal (bypass delay)
- Ensures single pending withdrawal per user

---

## 🧪 Testing

All required tests are implemented and passing:

### Test Categories
- V1 functionality tests
- V1 → V2 upgrade tests
- V2 → V3 upgrade tests
- Security & invariant tests

### Run all tests
```bash
npx hardhat test
```

✅ **23 tests passing**

---

## 🚀 Deployment & Upgrades

### Deploy V1
```bash
npx hardhat run scripts/deploy-v1.js
```

### Upgrade to V2
```bash
npx hardhat run scripts/upgrade-to-v2.js
```

### Upgrade to V3
```bash
npx hardhat run scripts/upgrade-to-v3.js
```

All upgrades use OpenZeppelin’s Hardhat Upgrades plugin and preserve state.

---

## 🛡 Security Measures
- Initializers disabled on implementation contracts
- Role-based access control (`DEFAULT_ADMIN_ROLE`, `UPGRADER_ROLE`, `PAUSER_ROLE`)
- Storage gaps to prevent layout collisions
- Upgrade authorization restricted
- Safe handling of legacy users during upgrades
- No function selector clashes

---

## 🎥 Demo
A Loom video demo is provided showing:
- All tests passing
- Deployment & upgrade scripts
- Contract upgrade flow explanation
- Security considerations

---

## 👩‍💻 Author
**Malla Charmi**

---

## 📄 License
MIT
