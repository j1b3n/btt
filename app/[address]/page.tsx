'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../utils/logger';

interface PairData {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
    logoURI?: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

interface TokenDetails {
  pairs: PairData[];
  tokenSniffer?: {
    score: number;
    url: string;
  };
}

const getTokenLogo = (address: string): string => {
  return `https://dd.dexscreener.com/ds-data/tokens/base/${address}.png`;
};

const LoadingSkeleton = () => (
  <div>
    <nav className="nav">
      <div className="container nav-content">
        <button className="btn btn-primary">
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
    </nav>
    <main className="main container">
      <div className="token-card">
        <div className="token-card-content">
          <div className="token-info">
            <div className="token-icon">
              <div className="token-icon-inner spin"></div>
            </div>
            <div className="token-details">
              <div className="h-6 w-48 bg-[#1E293B] rounded animate-pulse"></div>
              <div className="token-meta mt-2">
                <div className="h-4 w-24 bg-[#1E293B] rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="token-stats-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="token-stat-card">
            <div className="h-4 w-24 bg-[#1E293B] rounded animate-pulse mb-4"></div>
            <div className="h-8 w-32 bg-[#1E293B] rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

const hasDataChanged = (oldData: TokenDetails | null, newData: TokenDetails): boolean => {
  if (!oldData?.pairs?.[0] || !newData?.pairs?.[0]) return false;
  
  const oldPair = oldData.pairs[0];
  const newPair = newData.pairs[0];
  
  return (
    oldPair.priceUsd !== newPair.priceUsd ||
    oldPair.volume.h24 !== newPair.volume.h24 ||
    oldPair.liquidity.usd !== newPair.liquidity.usd ||
    oldPair.marketCap !== newPair.marketCap ||
    oldPair.fdv !== newPair.fdv ||
    oldPair.txns.h24.buys !== newPair.txns.h24.buys ||
    oldPair.txns.h24.sells !== newPair.txns.h24.sells ||
    oldPair.priceChange.m5 !== newPair.priceChange.m5 ||
    oldPair.priceChange.h1 !== newPair.priceChange.h1 ||
    oldPair.priceChange.h6 !== newPair.priceChange.h6 ||
    oldPair.priceChange.h24 !== newPair.priceChange.h24
  );
};

const PriceChangeIndicator = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  return (
    <span className={`token-stat-change ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(2)}%
    </span>
  );
};

export default function TokenDetails({ params }: { params: { address: string } }) {
  const [tokenData, setTokenData] = useState<TokenDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateIndicator, setShowUpdateIndicator] = useState(false);
  const previousDataRef = useRef<TokenDetails | null>(null);
  const router = useRouter();

  const fetchTokenData = async () => {
    try {
      logger.api(`Fetching token data for ${params.address}`, 'pending');
      
      const [dexScreenerResponse, logoURI] = await Promise.all([
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${params.address}`),
        getTokenLogo(params.address),
      ]);

      if (!dexScreenerResponse.ok) {
        throw new Error('Failed to fetch token data');
      }

      const data = await dexScreenerResponse.json();
      
      if (data.pairs && data.pairs.length > 0) {
        data.pairs[0].baseToken.logoURI = logoURI;
      }

      // Check if data has actually changed
      if (hasDataChanged(previousDataRef.current, data)) {
        setShowUpdateIndicator(true);
        setTimeout(() => setShowUpdateIndicator(false), 1000);
      }

      previousDataRef.current = data;
      setTokenData(data);
      logger.api(`Successfully fetched token data for ${params.address}`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      logger.api(`Error fetching token data for ${params.address}`, 'error', errorMessage);
    }
  };

  useEffect(() => {
    fetchTokenData();
    const interval = setInterval(fetchTokenData, 10000);
    return () => clearInterval(interval);
  }, [params.address]);

  if (!tokenData) {
    return <LoadingSkeleton />;
  }

  if (error || !tokenData.pairs || tokenData.pairs.length === 0) {
    return (
      <div>
        <nav className="nav">
          <div className="container nav-content">
            <button
              onClick={() => router.back()}
              className="btn btn-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </nav>
        <main className="main container">
          <div className="token-card">
            <div className="token-card-content">
              <h2 className="text-xl">No data available</h2>
              <p className="token-time">
                {error || 'This token has no trading activity yet.'}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const mainPair = tokenData.pairs[0];

  return (
    <div>
      <nav className="nav">
        <div className="container nav-content">
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          {showUpdateIndicator && (
            <div className="data-updated">Data updated</div>
          )}
        </div>
      </nav>

      <main className="main container">
        <div className="token-card">
          <div className="token-card-content">
            <div className="token-info">
              <div className="token-icon" style={{ width: '4rem', height: '4rem' }}>
                {mainPair.baseToken.logoURI ? (
                  <img
                    src={mainPair.baseToken.logoURI}
                    alt={`${mainPair.baseToken.symbol} logo`}
                    className="token-logo"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`token-icon-inner ${mainPair.baseToken.logoURI ? 'hidden' : ''}`}>
                  {mainPair.baseToken.symbol.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="token-details">
                <h1 className="text-2xl font-bold">{mainPair.baseToken.name}</h1>
                <div className="token-meta">
                  <span className="token-symbol">
                    {mainPair.baseToken.symbol}
                  </span>
                  <span className="token-time">
                    Created {formatDistanceToNow(mainPair.pairCreatedAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="token-stats-grid">
          <div className="token-stat-card">
            <h3>Price USD</h3>
            <p className="token-stat-value">
              ${parseFloat(mainPair.priceUsd).toFixed(12)}
            </p>
          </div>

          <div className="token-stat-card">
            <h3>Market Cap</h3>
            <p className="token-stat-value">
              ${mainPair.marketCap?.toLocaleString() ?? 'N/A'}
            </p>
          </div>

          <div className="token-stat-card">
            <h3>FDV</h3>
            <p className="token-stat-value">
              ${mainPair.fdv.toLocaleString()}
            </p>
          </div>

          <div className="token-stat-card">
            <h3>24h Volume</h3>
            <p className="token-stat-value">
              ${mainPair.volume.h24.toLocaleString()}
            </p>
          </div>

          <div className="token-stat-card">
            <h3>Price Change</h3>
            <div className="token-price-changes">
              <div className="price-change-row">
                <span>5m:</span>
                <PriceChangeIndicator value={mainPair.priceChange.m5} />
              </div>
              <div className="price-change-row">
                <span>1h:</span>
                <PriceChangeIndicator value={mainPair.priceChange.h1} />
              </div>
              <div className="price-change-row">
                <span>6h:</span>
                <PriceChangeIndicator value={mainPair.priceChange.h6} />
              </div>
              <div className="price-change-row">
                <span>24h:</span>
                <PriceChangeIndicator value={mainPair.priceChange.h24} />
              </div>
            </div>
          </div>

          <div className="token-stat-card">
            <h3>Liquidity</h3>
            <p className="token-stat-value">
              ${mainPair.liquidity.usd.toLocaleString()}
            </p>
          </div>

          <div className="token-stat-card">
            <h3>24h Transactions</h3>
            <div className="token-txn-stats">
              <div className="token-txn-stat">
                <p className="token-stat-value positive">{mainPair.txns.h24.buys}</p>
                <span>Buys</span>
              </div>
              <div className="token-txn-stat">
                <p className="token-stat-value negative">{mainPair.txns.h24.sells}</p>
                <span>Sells</span>
              </div>
            </div>
          </div>

          <div className="token-stat-card">
            <h3>DEX</h3>
            <p className="token-stat-value capitalize">
              {mainPair.dexId}
            </p>
          </div>
        </div>

        <div className="token-card" style={{ marginTop: '1.5rem' }}>
          <div className="token-card-content">
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Contract Address
            </h3>
            <code className="token-address" style={{ padding: '1rem', background: 'var(--nav-bg)', borderRadius: '0.5rem', display: 'block' }}>
              {mainPair.baseToken.address}
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}