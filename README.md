# ⚡ StacksBet Arena

**Decentralized Prediction Markets on Stacks**

Built with **Reown AppKit** for the Stacks Builder Challenge #3

![StacksBet Arena](https://img.shields.io/badge/Stacks-Reown_AppKit-8B5CF6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📋 Overview

StacksBet Arena is a decentralized prediction market platform where users can:

- **Create Markets** - Launch prediction markets on any topic
- **Place Bets** - Bet YES or NO on market outcomes
- **Earn Rewards** - Win payouts when your predictions are correct
- **Build Reputation** - Climb the leaderboard

### Key Features

✅ Binary YES/NO betting with dynamic odds  
✅ Oracle-based market resolution  
✅ Community-created markets  
✅ Leaderboard & achievements  
✅ Reown AppKit integration  

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- Clarinet
- A Stacks wallet (Leather, Xverse, etc.)
- Reown Project ID (get one at https://cloud.reown.com)

### Smart Contract Deployment

```bash
# Navigate to the project root
cd stacksbet-arena

# Check contract syntax
clarinet check

# Test the contract
clarinet test

# Deploy to testnet
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Deploy to mainnet
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Update Reown Project ID in src/App.jsx
# const REOWN_PROJECT_ID = 'YOUR_REOWN_PROJECT_ID'

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
stacksbet-arena/
├── contracts/
│   └── stacksbet-arena.clar    # Main Clarity smart contract
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── MarketList.jsx
│   │   │   ├── CreateMarket.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Footer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Clarinet.toml
└── README.md
```

## 🔧 Configuration

After deploying the smart contract, update the contract address in `frontend/src/App.jsx`:

```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
const CONTRACT_NAME = 'stacksbet-arena'

// Also update your Reown Project ID
const REOWN_PROJECT_ID = 'YOUR_REOWN_PROJECT_ID'
```

## 📜 Smart Contract Functions

### User Functions

| Function | Description |
|----------|-------------|
| `create-market` | Create a new prediction market |
| `place-bet` | Place a bet on YES or NO outcome |
| `claim-winnings` | Claim winnings after market resolution |
| `cancel-market` | Cancel market (creator only, before bets) |

### Admin/Oracle Functions

| Function | Description |
|----------|-------------|
| `resolve-market` | Resolve market with final outcome |
| `add-oracle` | Add a trusted oracle address |
| `remove-oracle` | Remove an oracle |
| `emergency-close` | Emergency close a market |

## 💰 Fee Structure

| Fee Type | Amount | Recipient |
|----------|--------|-----------|
| Platform Fee | 2% | Protocol treasury |
| Creator Fee | 0.5% | Market creator |
| Liquidity Fee | 0.5% | Liquidity providers |

## 🎮 How It Works

1. **Create a Market**: Define a question, set the end time, and provide initial liquidity
2. **Place Bets**: Choose YES or NO and specify your bet amount
3. **Market Resolution**: Oracles resolve the market after the resolution time
4. **Claim Winnings**: Winners can claim their share of the losing pool

## 📊 Outcome Types

- `OUTCOME-YES (1)` - The prediction came true
- `OUTCOME-NO (2)` - The prediction did not come true
- `OUTCOME-INVALID (3)` - Market was cancelled/invalid (refunds issued)



---

## 📦 @stacks/connect & @stacks/transactions Integration

This project uses official Stacks JavaScript libraries for blockchain interaction.

### @stacks/connect Usage

Handles wallet authentication and transaction signing via `openContractCall`:

- **CreateMarket.jsx** - Creates prediction markets with STX post conditions
- **MarketList.jsx** - Places bets on markets with user signing
- **App.jsx** - Wallet connection flow

### @stacks/transactions Usage

Handles Clarity values, post conditions, and read-only calls:

| Import | Purpose |
|--------|---------|
| `uintCV`, `stringUtf8CV`, `stringAsciiCV` | Clarity value types |
| `PostConditionMode`, `FungibleConditionCode` | Transaction safety |
| `makeStandardSTXPostCondition` | Limit STX transfers |
| `callReadOnlyFunction`, `cvToJSON` | Query contract state |

### Integration Files

| File | Libraries Used |
|------|----------------|
| `src/components/CreateMarket.jsx` | @stacks/connect, @stacks/transactions |
| `src/components/MarketList.jsx` | @stacks/connect, @stacks/transactions |
| `src/lib/contract.js` | @stacks/transactions |
| `src/lib/stacks.js` | @stacks/transactions |
| `src/lib/hiro.js` | @stacks/transactions |
| `frontend/create-market.js` | @stacks/transactions |
| `frontend/place-bet.js` | @stacks/transactions |

## 🔗 Links

- **GitHub**: [github.com/AdekunleBamz](https://github.com/AdekunleBamz)
- **Twitter**: [@hrh_mckay](https://twitter.com/hrh_mckay)
- **Farcaster**: [@Bamzzz](https://warpcast.com/bamzzz)
- **Reown**: [reown.com](https://reown.com)

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ⚡ for Stacks Builder Challenge #3
