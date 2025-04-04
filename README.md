# Base Token Tracker

Base Token Tracker is a real-time monitoring application for tracking new tokens deployed on the Base network. It provides detailed information about tokens with active trading pairs, including price data, market metrics, and trading activity.

## Features

- **Real-time Token Detection**: Monitors the Base network for new token deployments through zero-transfer events
- **Trading Pair Validation**: Only displays tokens with active trading pairs and liquidity
- **Comprehensive Token Data**: Shows detailed information including:
  - Price in USD
  - Market capitalization
  - Fully diluted valuation (FDV)
  - 24-hour trading volume
  - Buy/Sell transaction counts
  - Price changes (5m, 1h, 6h, 24h)
  - Liquidity metrics
- **Token Filtering**: Automatically filters out suspicious tokens and those without trading activity
- **Token Logos**: Integrates with DexScreener for token logos and metadata
- **Dark Mode Support**: Automatically adapts to system preferences
- **Mobile Responsive**: Fully responsive design that works on all device sizes

## Technology Stack

- **Frontend**: Next.js 14 with React 18
- **Blockchain Integration**: wagmi v2 & viem for Base network interaction
- **Data Provider**: DexScreener API for token trading data
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Query & Zustand
- **Development**: TypeScript for type safety
- **Deployment**: Optimized for Netlify edge functions

## Architecture

The application is built with a modern, scalable architecture:

1. **Token Detection**:
   - Monitors Base network for ERC20 token creation events
   - Filters tokens based on trading activity and legitimacy criteria
   - Caches discovered tokens for persistence

2. **Data Integration**:
   - Real-time price and trading data from DexScreener
   - On-chain data verification using Base RPC nodes
   - Automatic retry and fallback mechanisms

3. **User Interface**:
   - Server-side rendered pages for optimal performance
   - Client-side updates for real-time data
   - Progressive enhancement for optimal user experience

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/base-token-tracker.git
cd base-token-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with required environment variables:
```env
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Base Token Tracker
NEXT_PUBLIC_ONCHAINKIT_WALLET_CONFIG=smartWalletOnly
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Deployment

The application is optimized for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `next build`
   - Publish directory: `.next`
3. Add required environment variables in Netlify dashboard
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Base Network](https://base.org) for the L2 infrastructure
- [DexScreener](https://dexscreener.com) for token trading data
- [wagmi](https://wagmi.sh) for blockchain integration tools
- [Next.js](https://nextjs.org) for the React framework