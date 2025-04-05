# Base Token Tracker

Base Token Tracker is a specialized monitoring platform that tracks tokens on the Base network with active trading pairs. The platform implements advanced filtering mechanisms and real-time monitoring to help users identify financial opportunities.

## 🚀 Features

### Token Discovery & Filtering
- Real-time monitoring of new token deployments on Base
- Smart filtering system that only displays tokens with:
  - Active trading pairs and real liquidity
  - Price movement in the last hour
  - Legitimate trading patterns
- Automatic filtering of known liquidity pool tokens and stablecoins

### Token Information
Each token page displays comprehensive information:
- Token name, symbol, and creation time
- Current price in USD
- Market capitalization
- 24-hour trading volume
- Buy/Sell transaction counts
- Price changes (5m, 1h, 6h, 24h)
- Liquidity metrics
- DEX information
- Contract address
All data are actualised every ~30 seconds

### Security Features
- Integration with trusted platforms (e.g., CLANKER)
- Security badges indicating:
  - AI-created tokens
  - Platform verification
  - Community trust status

### System Monitoring
- Real-time system logs (optional display)
- API and blockchain interaction monitoring

## 🔄 Active Development

This project is currently in active development. New features and improvements are being added regularly:

### Recent Updates
- Added security verification system with CLANKER integration
- Implemented optional system logs display
- Enhanced token filtering based on price movement
- Improved UI/UX with security badges

### Upcoming Features
- Additional platform integrations (e.g., CLIZA.ai)
- Enhanced security verification
- Advanced filtering options

## 🛠 Technical Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **State Management**: 
  - Zustand for global state
  - React Query for API data
- **Blockchain Integration**:
  - wagmi v2
  - viem for Ethereum interactions
- **Styling**: Tailwind CSS
- **Data Sources**:
  - Base Network blockchain data
  - DexScreener API
  - Platform-specific APIs (CLANKER, etc.)

## ⚠️ Disclaimer

- This platform is for informational purposes only
- Listing of a token does not constitute an endorsement
- Always conduct your own research before trading
- Past performance does not guarantee future results
- Trading cryptocurrencies involves substantial risk

## 🔗 Links

- **Live Site**: https://btt.ovh/
- **Twitter**: https://x.com/j1b3n

## 📝 License

Copyright © 2024 Base Token Tracker. All rights reserved.

This is a proprietary application. The source code is provided for transparency but is not licensed for redistribution or self-hosting.
