# Base Token Tracker

Base Token Tracker is a specialized monitoring platform that tracks tokens on the Base network. The platform implements advanced filtering mechanisms and real-time monitoring to help users identify financial opportunities.

## 🚀 Features

### Token Discovery & Filtering
- Real-time monitoring of new token deployments on Base
- Real-time monitoring of Popular Vote Tokens (moderated token list)
- Smart filtering system with 3 differents modes :
  - Safe mode (only verified coins)
  - Discovery mode (all new detected coins)
  - Sniper mode (all new detected coins with trading activity)
- Automatic filtering of known liquidity pool tokens and stablecoins
- Manual filtering options including:
  - Hiding popular vote tokens
  - Hiding tokens with no market cap data
  - Hiding inactive pairs
  - Hiding tokens older than 24 hours
  - Hiding unverified tokens

### Security Features
- Integration with trusted platforms (e.g., CLANKER)
- Security badges indicating:
  - AI-created tokens
  - Popular Vote status
  - Platform verification
  - Community trust status

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

### System Monitoring
- Real-time system logs (optional display)

## 🔄 Active Development

This project is currently in active development. New features and improvements are being added regularly:

### Recent Updates
- Added filtering options and presets
- Added a link to dexscreener token page
- Optimized blockchain and api requests
- Implemented optional system logs display
- Fixed some bugs

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

## 💝 Support Me

If you find Base Token Tracker useful, consider supporting the project:

- **Buy the official $BTT token**: https://clank.fun/t/0xfe5d4cc8fe6a7455ff92ff85c4ca36a27c5396ab
- **Follow on Twitter**: [@j1b3n](https://x.com/j1b3n)
- **Star on GitHub**: Show your support by starring the repository
- **Share with Others**: Help spread the word about Base Token Tracker

Your support helps maintain and improve the platform for everyone!

## 🔗 Links

- **Live Site**: https://btt.ovh/

## 📝 License

Copyright © 2024 Base Token Tracker. All rights reserved.

This is a proprietary application. The source code is provided for transparency but is not licensed for redistribution or self-hosting.
