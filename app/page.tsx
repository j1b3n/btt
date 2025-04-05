'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zeroAddress } from 'viem';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import Link from 'next/link';
import { logger } from './utils/logger';
import { SecurityBadge } from './components/SecurityBadge';
import { LogDisplay } from './components/LogDisplay';
import { OptionsCard } from './components/OptionsCard';
import { POPULAR_VOTE_TOKENS } from './types/security';
import { formatNumber } from './utils/format';

interface DexScreenerData {
  pairs: {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      name: string;
      symbol: string;
      address: string;
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
  }[];
}

interface Token {
  address: string;
  name: string | null;
  symbol: string | null;
  timestamp: number;
  pairCreatedAt?: number;
  blockNumber: bigint;
  logoURI?: string;
  priceChange?: {
    m5: number;
    h1: number;
  };
  marketCap?: number;
  lastUpdated?: number;
  isPopularVote?: boolean;
  firstSeen?: number;
}

const FILTERED_SYMBOLS = [
  'BSWAP-LP',
  'STKD-UNI-V2',
  'cbETH',
  'USD+',
  'DAI',
  'sUSDe',
  'USDe',
  'UNI-V2',
  'oUSDT',
  'WETH',
  'USDC',
  'cbBTC',
  'USDbC',
  'EURC',
  'tBTC',
  'aBasWETH',
  'axlUSDC',
  'flETH',
  'mwETH',
  'WBTC',
  'rsETH'
];

const UPDATE_INTERVAL = 30000;
const UPDATE_THRESHOLD = 20000;

const shouldFilterToken = (symbol: string): boolean => {
  if (FILTERED_SYMBOLS.includes(symbol)) return true;
  if (symbol.includes('/')) return true;
  return false;
};

const serializeTokens = (tokens: Token[]) => {
  return tokens.map(token => ({
    ...token,
    blockNumber: token.blockNumber.toString(),
  }));
};

const deserializeTokens = (tokens: any[]): Token[] => {
  return tokens.map(token => ({
    ...token,
    blockNumber: BigInt(token.blockNumber),
  }));
};

const getTokenLogo = (address: string): string => {
  return `https://dd.dexscreener.com/ds-data/tokens/base/${address}.png`;
};

const getTokenBanner = (address: string): string => {
  return `https://dd.dexscreener.com/ds-data/tokens/base/${address}/header.png`;
};

const PriceChangeIndicator = ({ value }: { value: number | undefined }) => {
  if (value === undefined || isNaN(value)) {
    return <span className="token-stat-change">NaN%</span>;
  }
  const isPositive = value >= 0;
  return (
    <span className={`token-stat-change ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(2)}%
    </span>
  );
};

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const tokenABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [startBlock, setStartBlock] = useState<bigint | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousDataRef = useRef<Token[]>([]);

  const fetchTokenData = async (address: string): Promise<{ 
    pairCreatedAt?: number; 
    logoURI?: string; 
    priceChange?: { m5: number; h1: number };
    marketCap?: number;
  } | undefined> => {
    try {
      logger.api(`Fetching token data for ${address}`, 'pending');
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      
      if (!response.ok) {
        logger.api(`DexScreener API error for ${address}`, 'error', `Status: ${response.status}`);
        return undefined;
      }
      
      const data: DexScreenerData = await response.json();
      if (!data.pairs || data.pairs.length === 0) {
        logger.api(`No pairs found for ${address}`, 'error');
        return undefined;
      }
      
      const logoURI = getTokenLogo(address);
      logger.api(`Successfully fetched data for ${address}`, 'success');
      
      return {
        pairCreatedAt: data.pairs[0].pairCreatedAt,
        logoURI,
        priceChange: {
          m5: data.pairs[0].priceChange.m5,
          h1: data.pairs[0].priceChange.h1,
        },
        marketCap: data.pairs[0].marketCap,
      };
    } catch (error) {
      logger.api(`Error fetching token data for ${address}`, 'error', error instanceof Error ? error.message : 'Unknown error');
      return undefined;
    }
  };

  const updateTokenData = async (token: Token): Promise<Token> => {
    const data = await fetchTokenData(token.address);
    if (!data) return token;

    return {
      ...token,
      pairCreatedAt: data.pairCreatedAt,
      logoURI: data.logoURI,
      priceChange: data.priceChange,
      marketCap: data.marketCap,
      lastUpdated: Date.now(),
    };
  };

  useEffect(() => {
    if (!tokens.length) return;

    const updateTokens = async () => {
      const now = Date.now();
      const tokensToUpdate = tokens.filter(token => 
        !token.lastUpdated || now - token.lastUpdated > UPDATE_THRESHOLD
      );

      if (!tokensToUpdate.length) return;

      const updatedTokens = await Promise.all(tokensToUpdate.map(updateTokenData));

      setTokens(prevTokens => {
        const tokenMap = new Map(prevTokens.map(t => [t.address, t]));
        updatedTokens.forEach(token => {
          const existing = tokenMap.get(token.address);
          if (existing) {
            tokenMap.set(token.address, {
              ...token,
              firstSeen: existing.firstSeen,
            });
          }
        });
        return Array.from(tokenMap.values());
      });
    };

    updateTokens();
    const interval = setInterval(updateTokens, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [tokens]);

  const fetchPopularVoteTokens = async () => {
    for (const address of POPULAR_VOTE_TOKENS) {
      try {
        const [nameResult, symbolResult] = await Promise.all([
          publicClient.readContract({
            address: address as `0x${string}`,
            abi: tokenABI,
            functionName: 'name',
          }) as Promise<string>,
          publicClient.readContract({
            address: address as `0x${string}`,
            abi: tokenABI,
            functionName: 'symbol',
          }) as Promise<string>,
        ]);

        const data = await fetchTokenData(address);
        
        if (data?.pairCreatedAt && data.priceChange) {
          setTokens(prevTokens => {
            const existingToken = prevTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
            const newToken: Token = {
              address,
              name: nameResult,
              symbol: symbolResult,
              timestamp: existingToken?.timestamp || Date.now(),
              pairCreatedAt: data.pairCreatedAt,
              logoURI: data.logoURI,
              priceChange: data.priceChange,
              marketCap: data.marketCap,
              lastUpdated: Date.now(),
              blockNumber: BigInt(0),
              isPopularVote: true,
              firstSeen: existingToken?.firstSeen || Date.now(),
            };

            if (existingToken) {
              return prevTokens.map(t => 
                t.address.toLowerCase() === address.toLowerCase() ? newToken : t
              );
            }
            return [...prevTokens, newToken];
          });
        }
      } catch (error) {
        console.error(`Error fetching popular vote token ${address}:`, error);
      }
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchPopularVoteTokens();
    const interval = setInterval(fetchPopularVoteTokens, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isInitialized]);

  useEffect(() => {
    const cachedTokens = localStorage.getItem('baseTokens');
    if (cachedTokens) {
      try {
        const parsedTokens = deserializeTokens(JSON.parse(cachedTokens));
        setTokens(parsedTokens);
      } catch (error) {
        console.error('Error loading cached tokens:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && tokens.length > 0) {
      localStorage.setItem('baseTokens', JSON.stringify(serializeTokens(tokens)));
    }
  }, [tokens, isInitialized]);

  useEffect(() => {
    setIsActive(tokens.length > 0);
  }, [tokens]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    localStorage.removeItem('baseTokens');
    setTokens([]);
    setStartBlock(null);
    setIsInitialized(false);
    setTimeout(() => {
      setIsInitialized(true);
      setIsRefreshing(false);
    }, 100);
  };

  useEffect(() => {
    if (!isInitialized) return;

    const fetchNewTokens = async () => {
      try {
        logger.blockchain('Setting up blockchain event filter', 'pending');
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - BigInt(1000);
        setStartBlock(fromBlock);
        logger.blockchain('Successfully set up event filter', 'success', `From block: ${fromBlock}`);

        const transferEvent = {
          anonymous: false,
          inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
          ],
          name: 'Transfer',
          type: 'event',
        } as const;

        const unwatch = publicClient.watchEvent({
          event: transferEvent,
          args: {
            from: zeroAddress,
          },
          onLogs: async (logs) => {
            for (const log of logs) {
              try {
                if (!startBlock || log.blockNumber <= startBlock) continue;

                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                const blockTimestamp = Number(block.timestamp) * 1000;
                
                const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
                if (blockTimestamp < twoHoursAgo) continue;

                let name: string | null = null;
                let symbol: string | null = null;

                try {
                  name = (await publicClient.readContract({
                    address: log.address,
                    abi: tokenABI,
                    functionName: 'name',
                  })) as string;
                } catch (error) {
                  console.warn(`Failed to fetch name for token ${log.address}:`, error);
                  continue;
                }

                try {
                  symbol = (await publicClient.readContract({
                    address: log.address,
                    abi: tokenABI,
                    functionName: 'symbol',
                  })) as string;
                } catch (error) {
                  console.warn(`Failed to fetch symbol for token ${log.address}:`, error);
                  continue;
                }

                if (!name || !symbol || shouldFilterToken(symbol)) {
                  console.log(`Filtering out token ${log.address} with symbol ${symbol}`);
                  continue;
                }

                const data = await fetchTokenData(log.address);

                if (!data?.pairCreatedAt) {
                  console.log(`Skipping token ${log.address} without trading pair`);
                  continue;
                }

                const newToken = {
                  address: log.address,
                  name,
                  symbol,
                  timestamp: blockTimestamp,
                  pairCreatedAt: data.pairCreatedAt,
                  logoURI: data.logoURI,
                  priceChange: data.priceChange,
                  marketCap: data.marketCap,
                  lastUpdated: Date.now(),
                  blockNumber: log.blockNumber,
                  firstSeen: Date.now(),
                };

                setTokens((prev) => {
                  if (prev.some(token => token.address === newToken.address)) {
                    return prev;
                  }
                  return [newToken, ...prev];
                });
              } catch (error) {
                console.error('Error processing token:', error);
              }
            }
          },
        });

        return () => {
          unwatch();
        };
      } catch (error) {
        logger.blockchain('Error setting up event filter', 'error', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    fetchNewTokens();
  }, [startBlock, isInitialized]);

  const tokensToDisplay = tokens.filter(token => 
    token.pairCreatedAt && 
    token.priceChange?.h1 !== 0 && 
    token.priceChange?.h1 !== undefined
  );

  tokensToDisplay.sort((a, b) => (b.firstSeen || 0) - (a.firstSeen || 0));

  return (
    <div>
      <div className="warning-banner">
        This project is currently in alpha. You may encounter some bugs. New features and improvements are actively being developed.
      </div>
      <nav className="nav">
        <div className="container nav-content">
          <div className="nav-brand">
            <div className="logo">
              <img 
                src="https://raw.githubusercontent.com/j1b3n/btt/main/public/logo.png" 
                alt="BTT Logo"
                className="logo-image"
              />
            </div>
            <div className="brand-text">
              <h1>Base Token Tracker</h1>
              <p>Tracking tokens with active trading pairs</p>
            </div>
          </div>
          <div className="nav-actions">
            <a
              href="https://github.com/j1b3n/btt"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              title="View on GitHub"
            >
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-primary"
            >
              <svg
                className={isRefreshing ? 'spin' : ''}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: '1rem', height: '1rem' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
              <span className="status-indicator"></span>
              <span className="status-text">
                {isActive ? 'Active' : 'Scanning'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <OptionsCard />
      <LogDisplay />

      <main className="main container">
        {tokensToDisplay.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <div className="empty-state-icon-inner">
                <svg style={{ width: '3rem', height: '3rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h2>Scanning for New Tokens</h2>
            <p>
              We're actively monitoring the Base network for tokens with active trading pairs. Only tokens with liquidity and price movement will appear here.
            </p>
          </div>
        ) : (
          <div className="token-list">
            {tokensToDisplay.map((token) => (
              <Link
                key={token.address}
                href={`/${token.address}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="token-card">
                  {token.logoURI && (
                    <div className="token-banner">
                      <img
                        src={getTokenBanner(token.address)}
                        alt={`${token.symbol} banner`}
                        className="token-banner-image"
                      />
                    </div>
                  )}
                  <div className="token-card-content">
                    <div className="token-info">
                      <div className="token-icon">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={`${token.symbol} logo`}
                            className="token-logo"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`token-icon-inner ${token.logoURI ? 'hidden' : ''}`}>
                          {token.symbol ? token.symbol.slice(0, 2).toUpperCase() : '??'}
                        </div>
                      </div>
                      <div className="token-details">
                        <h3>{token.name || 'Unknown Token'}</h3>
                        <div className="token-meta">
                          <span className="token-symbol">
                            {token.symbol || 'Unknown'}
                          </span>
                          <span className="token-time">
                            Created {formatDistanceToNow(token.pairCreatedAt!, { addSuffix: true })}
                          </span>
                        </div>
                        {token.marketCap && (
                          <div 
                            className="token-market-cap"
                            style={{
                              '--banner-image': `url(${getTokenBanner(token.address)})`,
                            } as React.CSSProperties}
                          >
                            <span className="market-cap-value">{formatNumber(token.marketCap)}</span>
                            <span className="market-cap-label">Market Cap</span>
                          </div>
                        )}
                        <SecurityBadge address={token.address} />
                        <div className="token-price-changes">
                          <div className="price-change-row">
                            <span>5m:</span>
                            <PriceChangeIndicator value={token.priceChange?.m5} />
                          </div>
                          <div className="price-change-row">
                            <span>1h:</span>
                            <PriceChangeIndicator value={token.priceChange?.h1} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}