# 🚀 TokenVault – Production-Grade UUPS Upgradeable Smart Contract System

A **production-ready upgradeable smart contract system** built using the **UUPS (Universal Upgradeable Proxy Standard)** pattern with OpenZeppelin libraries.

This project demonstrates **secure upgradeability**, **storage layout preservation**, **role-based access control**, and **safe state migration across multiple contract versions (V1 → V2 → V3)**.

---

## 📌 Features Overview

### 🔹 TokenVault V1
- ERC20 token deposits & withdrawals
- Configurable deposit fee (basis points)
- Per-user balance tracking
- Total deposits tracking
- Secure initialization using OpenZeppelin `Initializable`
- UUPS upgrade authorization

### 🔹 TokenVault V2 (Upgradeable)
- Yield generation (APR-based, non-compounding)
- Deposit pause / unpause functionality
- Role-based access control (`PAUSER_ROLE`)
- Safe state migration from V1

### 🔹 TokenVault V3 (Upgradeable)
- Withdrawal delay mechanism
- Withdrawal request & execution flow
- Emergency withdrawals
- Full state preservation from V2

---

## 🧱 Architecture & Design

- **Upgradeable Pattern:** UUPS Proxy (OpenZeppelin)
- **Security Measures:**
  - `_disableInitializers()` on implementation contracts
  - `initializer` / `reinitializer` modifiers
  - Strict upgrade authorization
- **Storage Layout Strategy:**
  - State variables are only appended
  - Reserved storage gaps prevent collisions
- **Access Control Roles:**
  - `DEFAULT_ADMIN_ROLE`
  - `UPGRADER_ROLE`
  - `PAUSER_ROLE`

---

## 📁 Project Structure

```
contracts/
 ├── TokenVaultV1.sol
 ├── TokenVaultV2.sol
 ├── TokenVaultV3.sol
 └── mocks/
     └── MockERC20.sol

test/
 ├── TokenVaultV1.test.js
 ├── upgrade-v1-to-v2.test.js
 ├── upgrade-v2-to-v3.test.js
 └── security.test.js

scripts/
 ├── deploy-v1.js
 ├── upgrade-to-v2.js
 └── upgrade-to-v3.js

hardhat.config.js
package.json
submission.yml
README.md
```

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/mallacharmi/token-vault-uups-upgradeable.git
cd token-vault-uups-upgradeable
npm install
```

---

## 🔨 Compile Contracts

```bash
npx hardhat compile
```

---

## 🧪 Run Tests

```bash
npx hardhat test
```

---

## 📊 Test Coverage (≥ 90%)

```bash
npx hardhat coverage
```

### ✅ Coverage Summary

| Metric       | Coverage |
|-------------|----------|
| Statements  | 94% |
| Functions   | 93% |
| Lines       | 93% |

✔ Meets and exceeds the **90% minimum coverage requirement**

---

## 🚀 Deployment & Upgrade Flow

### ▶ Deploy V1 (Proxy)

```bash
npx hardhat run scripts/deploy-v1.js --network localhost
```

### 🔁 Upgrade to V2

```bash
npx hardhat run scripts/upgrade-to-v2.js --network localhost
```

### 🔁 Upgrade to V3

```bash
npx hardhat run scripts/upgrade-to-v3.js --network localhost
```

✔ Same proxy address maintained  
✔ Implementation upgraded safely  
✔ State preserved across all versions

---

## 🔐 Security Considerations

- Direct initialization of implementation contracts is blocked
- Unauthorized upgrades are prevented
- Storage layout collisions are avoided
- Function selector clashes are tested
- Role-based access control enforced at every stage

---

## 📌 Design Decisions & Limitations

- Yield is **non-compounding** by design
- Emergency withdrawal bypasses delay for safety
- Only one pending withdrawal per user
- Security prioritized over micro gas optimizations

---

## ✅ Conclusion

This project demonstrates a **production-grade, upgradeable smart contract system** suitable for real-world DeFi protocols and enterprise blockchain applications.

All required functionality, tests, security checks, and coverage requirements have been fully implemented and verified.

---

## 👩‍💻 Author

**Malla Charmi**  
Backend & Blockchain Developer
