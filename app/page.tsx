'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { zeroAddress } from 'viem';
import Link from 'next/link';
import { logger } from './utils/logger';

interface DexScreenerData {
  pairs: {
    pairCreatedAt: number;
    baseToken: {
      name: string;
      symbol: string;
      address: string;
      logoURI?: string;
    };
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
}

const FILTERED_SYMBOLS: string[] = [];

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

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [startBlock, setStartBlock] = useState<bigint | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const publicClient = usePublicClient();

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

  const fetchDexScreenerData = async (address: string): Promise<{ pairCreatedAt?: number; logoURI?: string } | undefined> => {
    try {
      logger.api(`Fetching DexScreener data for ${address}`, 'pending');
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
      };
    } catch (error) {
      logger.api(`Error fetching DexScreener data for ${address}`, 'error', error instanceof Error ? error.message : 'Unknown error');
      return undefined;
    }
  };

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
    if (!isInitialized || !publicClient) return;

    const fetchNewTokens = async () => {
      try {
        logger.blockchain('Setting up blockchain event filter', 'pending');
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - BigInt(1000);
        setStartBlock(fromBlock);
        logger.blockchain('Successfully set up event filter', 'success', `From block: ${fromBlock}`);

        const filter = await publicClient.createEventFilter({
          event: {
            anonymous: false,
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
            name: 'Transfer',
            type: 'event',
          },
          fromBlock,
          args: {
            from: zeroAddress,
          },
        });

        publicClient.watchEvent({
          ...filter as any,
          onLogs: async (logs) => {
            for (const log of logs) {
              try {
                if (!startBlock || log.blockNumber <= startBlock) continue;

                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                const blockTimestamp = Number(block.timestamp) * 1000;
                
                const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
                if (blockTimestamp < twoHoursAgo) continue;

                const tokenContract = {
                  address: log.address,
                  abi: [
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
                    {
                      constant: true,
                      inputs: [],
                      name: 'decimals',
                      outputs: [{ name: '', type: 'uint8' }],
                      type: 'function',
                    },
                  ],
                };

                let [name, symbol] = await Promise.all([
                  publicClient.readContract({
                    ...tokenContract,
                    functionName: 'name',
                  }).catch(() => null),
                  publicClient.readContract({
                    ...tokenContract,
                    functionName: 'symbol',
                  }).catch(() => null),
                ]);

                if (symbol && shouldFilterToken(symbol as string)) {
                  console.log(`Filtering out token ${log.address} with symbol ${symbol}`);
                  continue;
                }

                const dexScreenerData = await fetchDexScreenerData(log.address);

                if (!dexScreenerData?.pairCreatedAt) {
                  console.log(`Skipping token ${log.address} without trading pair`);
                  continue;
                }

                const newToken = {
                  address: log.address,
                  name: name as string | null,
                  symbol: symbol as string | null,
                  timestamp: blockTimestamp,
                  pairCreatedAt: dexScreenerData.pairCreatedAt,
                  logoURI: dexScreenerData.logoURI,
                  blockNumber: log.blockNumber,
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
      } catch (error) {
        logger.blockchain('Error setting up event filter', 'error', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    fetchNewTokens();
  }, [publicClient, startBlock, isInitialized]);

  const tokensWithPairs = tokens.filter(token => token.pairCreatedAt);

  return (
    <div>
      <nav className="nav">
        <div className="container nav-content">
          <div className="nav-brand">
            <div className="logo">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="brand-text">
              <h1>Base Token Tracker</h1>
              <p>Tracking tokens with active trading pairs</p>
            </div>
          </div>
          <div className="nav-actions">
            <Link href="/logs" className="btn btn-primary">
              <svg
                style={{ width: '1rem', height: '1rem' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              Logs
            </Link>
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

      <main className="main container">
        {tokensWithPairs.length === 0 ? (
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
              We're actively monitoring the Base network for tokens with active trading pairs. Only tokens with liquidity will appear here.
            </p>
          </div>
        ) : (
          <div className="token-list">
            {tokensWithPairs.map((token) => (
              <Link
                key={token.address}
                href={`/${token.address}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="token-card">
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
                        <code className="token-address">
                          {token.address}
                        </code>
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