# Base Token Tracker

<p align="center">
  <img src="https://raw.githubusercontent.com/j1b3n/btt/main/public/logo.png" alt="Base Token Tracker Logo" width="150"/>
</p>

**Base Token Tracker (BTT)** is a powerful monitoring platform designed to provide real-time insights into tokens on the Base network. It helps users identify potential opportunities and stay informed in the fast-paced crypto market through advanced filtering, continuous monitoring, and comprehensive data.

---

## 📱 Progressive Web App (PWA)

Base Token Tracker is available as a Progressive Web App, offering a seamless, app-like experience directly from your browser.

### Installation
- **Desktop**: Click the install icon in your browser's address bar.
- **Mobile**: Use "Add to Home Screen" from your browser menu (e.g., Safari on iOS, Chrome on Android).

### PWA Features
- 🚀 **Fast Loading**: Cached resources for instant startup.
- 📱 **Native Feel**: Full-screen experience without browser UI.
- 🔄 **Offline Support**: Basic functionality works without internet.
- 📊 **Background Sync**: Data syncs when connection is restored.

### Technical Implementation
- Service Worker for caching and offline functionality.
- Web App Manifest for installation and app metadata.
- Responsive design optimized for all screen sizes.
- Network-first strategy for real-time data, cache-first for static assets.

---

## 🌟 Features

BTT offers a comprehensive suite of features to enhance your token tracking experience:

### Token Discovery & Filtering
*   **Real-time Monitoring**: Detects new token deployments and significant on-chain activities on the Base network as they happen.
*   **Popular Vote Tokens**: Monitors a curated list of community-voted tokens with a history of positive performance.
*   **Smart Filtering Modes**:
    *   **Safe Mode**: Focuses on verified tokens for a more secure tracking experience.
    *   **Sniper Mode**: Highlights new tokens with active trading, ideal for quick identification of emerging trends.
*   **Automated Filtering**: Automatically filters out known liquidity pool tokens and stablecoins to reduce noise.
*   **Forgotten Tokens**: Allows users to permanently hide unwanted tokens from the main list. These tokens remain hidden even after refreshing the application or browser, but can be easily restored from a dedicated "Forgotten Tokens" section.

### Security & Verification
*   **Platform Integrations**: Integrates with trusted platforms like CLANKER for enhanced token verification.
*   **Security Badges**: Provides visual cues for:
    *   AI-created tokens
    *   Popular Vote status
    *   Platform verification (e.g., CLANKER)
    *   Community trust level

### Comprehensive Token Information
Each token's dedicated page provides in-depth data:
*   Token name, symbol, and creation time
*   Current price in USD
*   Market capitalization (FDV)
*   24-hour trading volume
*   Detailed buy/sell transaction counts (5m, 1h, 24h)
*   Price changes across multiple timeframes (5m, 1h, 6h, 24h)
*   Liquidity metrics
*   Associated Decentralized Exchange (DEX) information
*   Direct links to the contract address on BaseScan and DexScreener

### System Monitoring
*   **Real-time System Logs**: An optional display provides insights into the application's background processes and API calls.
*   **Token Monitor**: Provides detailed status for the market data retrieval process, including update frequency and currently monitored tokens.

### 💎 Premium Features (for $BTT Token Holders)
Unlock advanced capabilities by holding $BTT tokens:
*   **Add Custom Tokens to Favorites**: Manually add any Base network token to your personal favorites list by its contract address, even if it's not automatically detected.
*   **Monitor Favorite Tokens**: Instantly add any token from your favorites list to the active monitoring queue, ensuring you get real-time updates.

---

## 🛠️ Tech Stack

Base Token Tracker is built with modern and robust technologies:

*   **Framework**: Next.js 14 (React)
*   **Language**: TypeScript
*   **State Management**: Zustand (for global state) & React Query (for API data fetching and caching)
*   **Blockchain Integration**: wagmi v2 & viem (for Ethereum interactions)
*   **Styling**: Custom CSS modules
*   **Data Sources**:
    *   Base Network blockchain data
    *   DexScreener API
    *   Platform-specific APIs (CLANKER)

---

## 🚧 Project Status & Active Development

This project is currently in **active development** (Alpha stage). New features, optimizations, and improvements are being added regularly. While efforts are made to ensure stability, you may encounter bugs or incomplete features.

### Recent Updates
*   Separated the app into two distinct modes for a better experience ('Known tokens' and 'New tokens').
*   Implemented advanced filtering options and presets.
*   Added direct links to DexScreener token pages.
*   Added DexScreener chart and live transactions on the token page.
*   Optimized blockchain and API request handling.
*   Introduced an optional system logs display.
*   Added an optional token monitor display to enhance understanding of market data retrieval.
*   **NEW**: Implemented premium feature to add custom tokens to favorites.
*   **NEW**: Implemented premium feature to actively monitor tokens from favorites.
*   Fixed various bugs and improved UI/UX.

### Upcoming Features
*   Portfolio page: display your holdings and add them to the monitoring system.
*   Additional platform integrations.
*   Enhanced security verification mechanisms.
*   More advanced filtering and notification options.
*   **Coming Soon**: Light Mode for UI customization.
*   **Coming Soon**: IPFS Storage for decentralized favorite token management.

---

## ⚠️ Disclaimer

*   This platform is for informational purposes only and should not be considered financial advice.
*   The listing or monitoring of a token does not constitute an endorsement or recommendation.
*   Always conduct your own thorough research (DYOR) before making any trading or investment decisions.
*   Trading cryptocurrencies involves substantial risk, and past performance is not indicative of future results.

---

## 💖 Support the Project

If you find Base Token Tracker useful and appreciate the work, consider supporting the project:

*   **Buy the official $BTT token**: [https://clank.fun/t/0xfe5d4cc8fe6a7455ff92ff85c4ca36a27c5396ab](https://clank.fun/t/0xfe5d4cc8fe6a7455ff92ff85c4ca36a27c5396ab)
*   **Follow on Twitter**: Stay updated with the latest news and developments by following [@j1b3n](https://x.com/j1b3n)
*   **Star on GitHub**: Show your appreciation by starring this repository!
*   **Share with Others**: Help grow the community by sharing BTT with fellow Base enthusiasts.

Your support helps maintain and improve the platform for everyone!

---

## 🔗 Links

*   **Live Site**: [https://btt.ovh/](https://btt.ovh/)

---

## 📄 License

Copyright © 2025 Base Token Tracker. All rights reserved.
