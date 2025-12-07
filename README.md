# Base Token Tracker (BTT)

<p align="center">
  <img src="https://raw.githubusercontent.com/j1b3n/btt/main/public/logo.png" alt="Base Token Tracker Logo" width="150"/>
</p>

<p align="center">
  <a href="https://btt.ovh"><img src="https://img.shields.io/badge/Live-btt.ovh-blue?style=for-the-badge" alt="Live Site"/></a>
  <a href="https://github.com/j1b3n/btt"><img src="https://img.shields.io/badge/Version-0.5.0--alpha-orange?style=for-the-badge" alt="Version"/></a>
  <a href="https://twitter.com/j1b3n"><img src="https://img.shields.io/twitter/follow/j1b3n?style=for-the-badge&logo=x&color=1DA1F2" alt="Twitter"/></a>
</p>

<p align="center">
  <strong>Real-time token tracker for Base network. Track prices, monitor new token launches, manage portfolios.</strong>
</p>

---

**Base Token Tracker (BTT)** is a powerful monitoring platform designed to provide real-time insights into tokens on the Base network. It helps users identify potential opportunities and stay informed in the fast-paced crypto market through continuous monitoring and comprehensive data.

---

## 🚀 Quick Start

1. **Visit**: [https://btt.ovh](https://btt.ovh)
2. **Choose Mode**:
   - **Known Tokens**: Monitor your favorite tokens and portfolio
   - **New Tokens**: Detect new tokens in real-time via tokens mint monitoring
3. **Track**: Add tokens to monitoring, track prices and volume changes, analyze trends
4. **Install**: Add to home screen for PWA experience

**No wallet connection required for basic features!**

---

## 📱 Progressive Web App (PWA)

Base Token Tracker is available as a Progressive Web App, offering a seamless, app-like experience directly from your browser.

### Installation
- **Desktop**: Click the install icon in your browser's address bar.
- **Mobile**: Use "Add to Home Screen" from your browser menu (e.g., Safari on iOS, Chrome on Android).

### PWA Features
- 🚀 **Fast Loading**: Cached resources for instant startup.
- 📱 **Native Feel**: Full-screen experience without browser UI.
- 📊 **Background Sync**: Data syncs when connection is restored.


---

## 🌟 Features

BTT offers a comprehensive suite of features to enhance your token tracking experience:

### Token Monitoring
*   **Real-time Monitoring**: Continuous market data updates and trusted platforms check.
*   **Dual Tracking Modes**:
    *   **Known Tokens Mode**: Monitor your curated list of favorite tokens with real-time updates.
    *   **New Tokens Mode**: Automatically detects and stages new token mints, promoting them when trading activity begins.
*   **Flexible Sorting**: Sort by market cap, price changes (5m, 1h, 6h, 24h), creation date, or detection time.
*   **Forgotten Tokens**: Permanently hide unwanted tokens.

### Security & Verification
*   **Multi-Platform Verification**:
    *   **Clanker.world** integration for Clanker token verification
    *   **Zora.co** verification for Zora tokens
    *   **Clank.fun** for Virtual token verification and enhanced metadata
*   **Security Badges**: Visual indicators for:
    *   Platform-verified tokens (Clanker, Zora, Virtual)
    *   Popular Vote status

### Portfolio Management
*   **Portfolio Tracking**: Monitor your token portfolio with real-time valuations.
*   **Quick Monitoring**: Add portfolio tokens to active monitoring with one click.

### Comprehensive Token Information
Each token's dedicated page provides in-depth data:
*   EXCLUSIVE FEATURE: instantly switch different trading pairs from your token (up to 30) for full page data update including chart and realtime trades, preview essential pairs infos in the "Trading Pairs" dropdown menu
*   Token name, symbol, and creation time
*   Current price in USD
*   Market capitalization
*   24-hour trading volume and liquidity metrics
*   Detailed buy/sell transaction counts (5m, 1h, 24h)
*   Price changes across multiple timeframes (5m, 1h, 6h, 24h)
*   Associated Decentralized Exchange (DEX) information
*   Direct links to the contract address on BaseScan and DexScreener
*   Interactive charts and live transaction feeds

### 💎 Premium Features (for $BTT Token Holders)
Unlock advanced capabilities by holding $BTT tokens:
*   **Add Favorite Tokens**: Instantly add any token to your favorites list and send them to monitor at anytime.
*   **Add Custom Tokens to Favorites**: Manually add any Base network token to your personal favorites list by its contract address.

---

## 🛠️ Tech Stack

Base Token Tracker is built with modern and robust technologies:

*   **Framework**: Next.js 14 (React) with App Router
*   **Language**: TypeScript
*   **State Management**: Zustand (for global state) & React Query (for API data fetching and caching)
*   **Blockchain Integration**: wagmi v2 & viem (for Ethereum interactions)
*   **Web3 Tools**: OnchainKit by Coinbase
*   **Styling**: Custom CSS modules with dark/light mode support
*   **Analytics**: Vercel Analytics & Speed Insights
*   **Data Sources**:
    *   **Base Network** - Blockchain data and on-chain events
    *   **DexScreener** - Market data, prices, trading pairs, and liquidity
    *   **CoinGecko** - ETH price data
    *   **GeckoTerminal** - Token prices and trading information
    *   **Coinbase CDP** - Wallet balances and portfolio data
    *   **Clanker.world** - Clanker token verification and identification
    *   **Zora.co** - Zora token verification and identification
    *   **Virtuals.io** - Virtuals tokens mapping
    *   **Clank.fun** - Logos, banners, market data, and Virtual token verification

---

## 🚧 Project Status & Active Development

This project is currently in **active development** (Alpha 0.5.0). New features, optimizations, and improvements are being added regularly. While efforts are made to ensure stability, you may encounter bugs or incomplete features.

### Recent Updates (Alpha 0.5.0)
*   **NEW**: Multi-platform token verification (Clanker, Zora, Virtuals integrations)
*   **NEW**: Portfolio page with wallet integration and holdings display
*   **NEW**: New Tokens Mode rebuilded with improved UX and performance
*   **NEW**: Responsive design optimized for mobile devices
*   **NEW**: Token page improved with pairs instant switching and more data 
*   Performance optimizations and caching improvements

### Upcoming Features
*   IPFS storage for decentralized favorite token management
*   Light mode theme option
*   More detection modes
*   Enhanced portfolio analytics and performance tracking
*   In-app token swap


---

## ❓ FAQ

**Q: Do I need to connect a wallet to use BTT?**
A: No, basic features (token tracking, price monitoring) work without wallet connection. Premium features and portfolio viewing require wallet connection or $BTT token holding.

**Q: How often is data updated?**
A: Real-time for new token detection and blockchain events. Market data (prices, volume, liquidity) refreshes every 30-60 seconds depending on the token.

**Q: Is my data stored on servers?**
A: No! All your preferences, favorites, and settings are stored locally in your browser using localStorage. We don't collect or store personal data on our servers. Your privacy is guaranteed.

**Q: Which tokens are monitored?**
A: In "New Tokens" mode, BTT detects tokens mint events on Base network, which are ofter tokens creations but not only. In "Known Tokens" mode, it tracks your manually added favorites and portfolio tokens, and you can also activate the "Popular Tokens" detection which is a curated list of popular tokens with historical positive performance and community trust.

**Q: How do I get $BTT tokens for premium features?**
A: Choose whether to buy it on uniswap, clanker.world or clank.fun, you can find the links in the "Premium" section of the app.

**Q: What is the staging system?**
A: New tokens are first added to a staging area where they're monitored for trading activity. Once a pair is created and trading begins, they're promoted to the main tracking list.

**Q: Can I track tokens from other blockchains?**
A: Currently, BTT only supports Base network tokens. We currently have no plans to expand to other chains.


---

## ⚠️ Disclaimer

*   **NOT FINANCIAL ADVICE**: This platform is for informational and educational purposes only. Nothing on BTT constitutes financial advice, investment advice, trading advice, or any other sort of advice.
*   **USE AT YOUR OWN RISK**: Cryptocurrency trading involves substantial risk of loss. You should never invest money that you cannot afford to lose. Always do your own research (DYOR) before making any investment decisions.
*   **NO WARRANTIES**: This application is provided "as is" without any warranties, express or implied. We do not guarantee the accuracy, completeness, or timeliness of any information displayed.
*   **THIRD-PARTY DATA**: Token prices, market data, and security information are sourced from third-party providers. We are not responsible for errors or inaccuracies in this data.
*   **NO ENDORSEMENT**: The listing or monitoring of a token does not constitute an endorsement or recommendation by Base Token Tracker.
*   **SECURITY RISKS**: While we implement security measures, no system is 100% secure. Always verify token information from multiple sources before trading, and never share your private keys or seed phrases.
*   **PAST PERFORMANCE**: Past performance is not indicative of future results. All investments carry risk.

---

## 💖 Support the Project

If you find Base Token Tracker useful and appreciate the work, consider supporting the project:

*   **Buy the official $BTT token**: [Clank.fun - $BTT Token](https://clank.fun/t/0xfe5d4cc8fe6a7455ff92ff85c4ca36a27c5396ab)
*   **Follow on Twitter/X**: Stay updated with the latest news and developments by following [@j1b3n](https://x.com/j1b3n)
*   **Share with Others**: Help grow the community by sharing BTT with fellow Base enthusiasts

Your support helps maintain and improve the platform for everyone! 🚀

---

## 🔗 Links

*   **Live Application**: [https://btt.ovh](https://btt.ovh)
*   **Twitter/X**: [@j1b3n](https://x.com/j1b3n)

---

## 📄 License

Copyright © 2025 Base Token Tracker. All rights reserved.

---

<p align="center">
  Made with ❤️ for the Base community
</p>

<p align="center">
  <sub>Real-time token tracker for Base network. Track prices, monitor new token launches, manage portfolios.</sub>
</p>
