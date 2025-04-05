'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../utils/logger';
import { SecurityBadge } from '../components/SecurityBadge';
import { getTokenSecurityStatus } from '../types/security';

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

const getTokenBanner = (address: string): string => {
  return `https://dd.dexscreener.com/ds-data/tokens/base/${address}/header.png`;
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
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const previousDataRef = useRef<TokenDetails | null>(null);
  const router = useRouter();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      const status = await getTokenSecurityStatus(params.address);
      setSecurityStatus(status);
    };
    fetchSecurityStatus();
  }, [params.address]);

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
          {mainPair.baseToken.logoURI && (
            <div className="token-banner">
              <img
                src={getTokenBanner(mainPair.baseToken.address)}
                alt={`${mainPair.baseToken.symbol} banner`}
                className="token-banner-image"
              />
            </div>
          )}
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
                <SecurityBadge address={mainPair.baseToken.address} />
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
          {mainPair.baseToken.logoURI && (
            <div className="token-banner">
              <img
                src={getTokenBanner(mainPair.baseToken.address)}
                alt={`${mainPair.baseToken.symbol} banner`}
                className="token-banner-image"
              />
            </div>
          )}
          <div className="token-card-content">
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Contract Address
            </h3>
            <div className="contract-info">
              <code 
                className="token-address" 
                onClick={() => copyToClipboard(mainPair.baseToken.address)}
                title="Click to copy"
              >
                {mainPair.baseToken.address}
              </code>
              <div className="contract-actions">
                {showCopiedMessage && (
                  <span className="copied-message">Copied!</span>
                )}
                <a
                  href={`https://basescan.org/token/${mainPair.baseToken.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basescan-link"
                  title="View on BaseScan"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM9 14H11V16H9V14ZM10.61 4.04C8.55 3.74 6.73 5.01 6.18 6.83C6 7.41 6.44 8 7.05 8H7.25C7.66 8 7.99 7.71 8.13 7.33C8.45 6.44 9.4 5.83 10.43 6.05C11.38 6.25 12.08 7.18 12 8.15C11.9 9.49 10.38 9.78 9.55 11.03C9.55 11.04 9.54 11.04 9.54 11.05C9.53 11.07 9.52 11.08 9.51 11.1C9.42 11.25 9.33 11.42 9.26 11.6C9.25 11.63 9.23 11.65 9.22 11.68C9.21 11.7 9.21 11.72 9.2 11.75C9.08 12.09 9 12.5 9 13H11C11 12.58 11.11 12.23 11.28 11.93C11.3 11.9 11.31 11.87 11.33 11.84C11.41 11.7 11.51 11.57 11.61 11.45C11.62 11.44 11.63 11.42 11.64 11.41C11.74 11.29 11.85 11.18 11.97 11.07C12.93 10.16 14.23 9.42 13.96 7.51C13.72 5.77 12.35 4.3 10.61 4.04Z" fill="currentColor"/>
                  </svg>
                </a>
                {securityStatus?.platform?.name === 'CLANKER' && (
                  <a
                    href={`${securityStatus.platform.url}clanker/${mainPair.baseToken.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clanker-link"
                    title="View on CLANKER"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM11 5H9V7H11V5ZM11 9H9V15H11V9Z" fill="currentColor"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}