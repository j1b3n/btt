'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import Link from 'next/link';
import { logger, useLoggerStore } from './utils/logger';
import { SecurityBadge } from './components/SecurityBadge';
import { LogDisplay } from './components/LogDisplay';
import { OptionsCard } from './components/OptionsCard';
import { POPULAR_VOTE_TOKENS } from './types/security';
import { formatNumber } from './utils/format';
import { useTokenContractStore } from './store/tokenContractStore';
import { useDexScreenerStore } from './store/dexscreenerStore';
import { useSecurityStore } from './store/securityStore';
import { getTokenSecurityStatus } from './types/security';

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
  'rsETH',
  'USDA',
  'mwUSDC',
  'ezETH',
  'weETH',
  'snxUSD',
  'sUSDz'
];

const UPDATE_INTERVAL = 15000;
const UPDATE_THRESHOLD = 13000;
const MAX_CONCURRENT_REQUESTS = 5;
const POPULAR_VOTE_CHECK_INTERVAL = 30000;

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

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [startBlock, setStartBlock] = useState<bigint | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousDataRef = useRef<Token[]>([]);
  const hidePopularVote = useLoggerStore(state => state.hidePopularVote);
  const hideNoMarketCapData = useLoggerStore(state => state.hideNoMarketCapData);
  const hideInactivePairs = useLoggerStore(state => state.hideInactivePairs);
  const hideOlderThan24h = useLoggerStore(state => state.hideOlderThan24h);
  const hideUnverified = useLoggerStore(state => state.hideUnverified);
  const publicClient = usePublicClient();
  const { addContract, hasContract, getContract } = useTokenContractStore();
  const { updateTokenCheck, shouldCheckToken, markTokenAsNew } = useDexScreenerStore();
  const { removeSecurityStatus, getSecurityStatus, setSecurityStatus } = useSecurityStore();

  const updateTokensQueue = useRef<string[]>([]);
  const isUpdating = useRef(false);

  const processUpdateQueue = async () => {
    if (isUpdating.current || updateTokensQueue.current.length === 0) return;

    isUpdating.current = true;
    const batch = updateTokensQueue.current.splice(0, MAX_CONCURRENT_REQUESTS);
    
    try {
      const updates = await Promise.all(
        batch.map(address => {
          const token = tokens.find(t => t.address === address);
          return token ? updateTokenData(token) : null;
        })
      );

      setTokens(prevTokens => {
        const tokenMap = new Map(prevTokens.map(t => [t.address, t]));
        updates.forEach(token => {
          if (token) {
            const existing = tokenMap.get(token.address);
            if (existing) {
              tokenMap.set(token.address, {
                ...token,
                firstSeen: existing.firstSeen,
              });
            }
          }
        });
        return Array.from(tokenMap.values());
      });
    } catch (error) {
      console.error('Error processing update queue:', error);
    } finally {
      isUpdating.current = false;
      if (updateTokensQueue.current.length > 0) {
        setTimeout(processUpdateQueue, 1000);
      }
    }
  };

  useEffect(() => {
    if (!tokens.length) return;

    const queueTokenUpdates = () => {
      const now = Date.now();
      const tokensToUpdate = tokens.filter(token => 
        !token.lastUpdated || now - token.lastUpdated > UPDATE_THRESHOLD
      );

      updateTokensQueue.current = Array.from(
        new Set([...updateTokensQueue.current, ...tokensToUpdate.map(t => t.address)])
      );

      processUpdateQueue();
    };

    queueTokenUpdates();
    const interval = setInterval(queueTokenUpdates, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [tokens]);

  useEffect(() => {
    if (!isInitialized || !publicClient) return;

    const checkPopularVoteTokens = async () => {
      for (const address of POPULAR_VOTE_TOKENS) {
        try {
          let name: string;
          let symbol: string;

          const cachedContract = getContract(address);
          if (cachedContract) {
            name = cachedContract.name;
            symbol = cachedContract.symbol;
          } else {
            const tokenAbi = [
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

            try {
              const [nameResult, symbolResult] = await Promise.all([
                publicClient.readContract({
                  address: address as `0x${string}`,
                  abi: tokenAbi,
                  functionName: 'name',
                }) as Promise<string>,
                publicClient.readContract({
                  address: address as `0x${string}`,
                  abi: tokenAbi,
                  functionName: 'symbol',
                }) as Promise<string>,
              ]);

              name = nameResult;
              symbol = symbolResult;

              addContract(address, {
                name,
                symbol,
                timestamp: Date.now(),
              });
            } catch (error) {
              logger.blockchain(
                'Failed to read popular vote token contract',
                'error',
                `Address: ${address}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
              continue;
            }
          }

          if (shouldCheckToken(address)) {
            const data = await fetchTokenData(address);
            
            if (data?.pairCreatedAt && data.priceChange) {
              setTokens(prevTokens => {
                const existingToken = prevTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
                const newToken = {
                  address,
                  name,
                  symbol,
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

              logger.blockchain(
                'Popular vote token updated',
                'success',
                `Name: ${name}, Symbol: ${symbol}, Address: ${address}`
              );
            }
          }

          const securityStatus = await getTokenSecurityStatus(address);
          if (securityStatus) {
            setSecurityStatus(address, securityStatus);
          }
        } catch (error) {
          logger.blockchain(
            'Error processing popular vote token',
            'error',
            `Address: ${address}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    };

    checkPopularVoteTokens();
    const interval = setInterval(checkPopularVoteTokens, POPULAR_VOTE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isInitialized, publicClient]);

  const fetchTokenData = async (address: string): Promise<{ 
    pairCreatedAt?: number; 
    logoURI?: string; 
    priceChange?: { m5: number; h1: number };
    marketCap?: number;
  } | undefined> => {
    if (!shouldCheckToken(address)) {
      return undefined;
    }

    try {
      logger.api(`Fetching token data for ${address}`, 'pending');
      
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      
      if (!response.ok) {
        updateTokenCheck(address, false, false);
        logger.api(`DexScreener API error for ${address}`, 'error', `Status: ${response.status}`);
        return undefined;
      }
      
      const data = await response.json();
      const hasPairs = data.pairs && data.pairs.length > 0;
      const hasPriceMovement = hasPairs && (
        Math.abs(data.pairs[0].priceChange.m5) > 0 ||
        Math.abs(data.pairs[0].priceChange.h1) > 0
      );
      
      updateTokenCheck(address, hasPairs, hasPriceMovement);

      if (!hasPairs) {
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
      updateTokenCheck(address, false, false);
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
    if (!isInitialized || !publicClient) return;

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

                logger.blockchain('Processing potential new token', 'pending', `Address: ${log.address}`);

                let name: string;
                let symbol: string;

                const cachedContract = getContract(log.address);
                if (cachedContract) {
                  name = cachedContract.name;
                  symbol = cachedContract.symbol;
                  logger.blockchain(
                    'Using cached token contract data',
                    'success',
                    `Name: ${name}, Symbol: ${symbol}`
                  );
                } else {
                  const tokenAbi = [
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

                  try {
                    const [nameResult, symbolResult] = await Promise.all([
                      publicClient.readContract({
                        address: log.address as `0x${string}`,
                        abi: tokenAbi,
                        functionName: 'name',
                      }) as Promise<string>,
                      publicClient.readContract({
                        address: log.address as `0x${string}`,
                        abi: tokenAbi,
                        functionName: 'symbol',
                      }) as Promise<string>,
                    ]);

                    name = nameResult;
                    symbol = symbolResult;

                    addContract(log.address, {
                      name,
                      symbol,
                      timestamp: blockTimestamp,
                    });

                    logger.blockchain(
                      'Token contract read successful',
                      'success',
                      `Name: ${name}, Symbol: ${symbol}`
                    );
                  } catch (error) {
                    logger.blockchain(
                      'Failed to read token contract',
                      'error',
                      `Address: ${log.address}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                    );
                    continue;
                  }
                }

                if (!name || !symbol || shouldFilterToken(symbol)) {
                  logger.blockchain(
                    'Token filtered out',
                    'pending',
                    `Address: ${log.address}, Symbol: ${symbol}, Reason: ${!name ? 'No name' : !symbol ? 'No symbol' : 'Filtered symbol'}`
                  );
                  continue;
                }

                markTokenAsNew(log.address);
                removeSecurityStatus(log.address);
                
                const securityStatus = await getTokenSecurityStatus(log.address);
                if (securityStatus) {
                  setSecurityStatus(log.address, securityStatus);
                }
                
                const data = await fetchTokenData(log.address);

                const newToken = {
                  address: log.address,
                  name,
                  symbol,
                  timestamp: blockTimestamp,
                  pairCreatedAt: data?.pairCreatedAt,
                  logoURI: data?.logoURI,
                  priceChange: data?.priceChange,
                  marketCap: data?.marketCap,
                  lastUpdated: Date.now(),
                  blockNumber: log.blockNumber,
                  firstSeen: Date.now(),
                };

                logger.blockchain(
                  'New token detected',
                  'success',
                  `Name: ${name}, Symbol: ${symbol}, Address: ${log.address}`
                );

                setTokens((prev) => {
                  if (prev.some(token => token.address === newToken.address)) {
                    return prev;
                  }
                  return [newToken, ...prev];
                });
              } catch (error) {
                logger.blockchain(
                  'Error processing token',
                  'error',
                  error instanceof Error ? error.message : 'Unknown error'
                );
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
  }, [startBlock, isInitialized, publicClient]);

  const formatCreationTime = (token: Token) => {
    if (token.pairCreatedAt) {
      return `Created ${formatDistanceToNow(token.pairCreatedAt, { addSuffix: true })}`;
    }
    return `Created ${formatDistanceToNow(token.timestamp, { addSuffix: true })}`;
  };

  const tokensToDisplay = tokens.filter(token => {
    if (hidePopularVote && token.isPopularVote) {
      return false;
    }
    if (hideNoMarketCapData && !token.marketCap) {
      return false;
    }
    if (hideInactivePairs && (token.priceChange?.h1 === 0 || token.priceChange?.h1 === undefined)) {
      return false;
    }
    if (hideOlderThan24h) {
      const tokenTimestamp = token.pairCreatedAt || token.timestamp;
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      if (tokenTimestamp < twentyFourHoursAgo) {
        return false;
      }
    }
    if (hideUnverified) {
      const securityStatus = getSecurityStatus(token.address);
      if (!securityStatus) {
        return false;
      }
    }
    return true;
  });

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
              🚀🚀🚀🚀🚀
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
                        <div className="flex items-center gap-2">
                          <h3>{token.name || 'Unknown Token'}</h3>
                          <a
                            href={`https://dexscreener.com/base/${token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 20 20">
                              <path fill="currentColor" d="M10.002.999c4.97-.004 8.998 4.028 9 8.998 0 4.972-4.024 9.007-8.995 9.007-4.972 0-9.008-4.028-9.006-9C1.004 5.037 5.034 1.002 10.002 1m-.203 14.58c-.286-.97-.561-1.943-.967-2.874-.323-.742-.752-1.38-1.534-1.711-.213-.09-.407-.224-.61-.34-.05-.028-.113-.046-.12-.121.032-.077.109-.1.171-.136.336-.199.664-.414 1.014-.583.278-.134.35-.336.345-.613-.003-.174-.048-.252-.24-.267a1.73 1.73 0 0 1-1.005-.407c-.55-.468-.686-1.12-.395-1.835.039-.093.134-.195.058-.293-.216-.274-.448-.536-.666-.795-.094.032-.115.094-.14.145-.298.588-.483  1.21-.506 1.871-.031.884.009 1.769-.04 2.654a10.6 10.6 0 0 1-.928 3.861c-.024.052-.07.1-.021.214l1.44-1.15 1.167 1.883 1.234-1.138 1.932 3.123c.113-.061.145-.149.19-.223q.827-1.34 1.653-2.681c.136-.222.148-.223.344-.041.142.133.281.27.423.403.19.178.382.353.566.523.106-.044.133-.117.172-.18.304-.49.612-.979.909-1.474.094-.157.174-.17.313-.053.326.275.662.54.995.808.09.072.174.156.32.206-.055-.136-.093-.241-.138-.343a10.5 10.5 0 0 1-.888-4.166c-.007-.652.008-1.305-.004-1.957a4.8 4.8 0 0 0-.484-2.062c-.041-.084-.07-.184-.193-.218-.182.215-.357.44-.552.645-.122.128-.144.242-.067.4.16.334.221.69.133 1.05-.176.722-.695 1.07-1.383 1.216-.36.077-.347.075-.35.44-.003.204.082.31.25.402.368.202.728.418 1.09.631.067.04.157.06.18.183-.278.16-.552.346-.849.48-.62.28-.999.772-1.284  1.359q-.103.212-.196.43c-.432 1-.702 2.054-1.015 3.093-.024.08-.028.171-.114.236-.117-.181-.137-.379-.21-.595m.304-12.708q-.258.016-.515.036a4.65 4.65 0 0 0-2.776 1.196c-.322.289-.406.305-.78.086-.104-.06-.197-.138-.296-.205-.04-.027-.077-.081-.14-.023.02.137.1.247.174.357.832 1.242 1.95 2.163 3.243 2.888.119.067.22.054.336-.01.44-.246.887-.244 1.328 0 .117.065.219.07.337.006 1.313-.725 2.433-1.665 3.268-2.923.059-.088.14-.176.12-.299-.1-.043-.147.032-.203.073a2 2 0 0 1-.43.241c-.17.07-.304.053-.444-.086a4.6 4.6 0 0 0-1.032-.753c-.67-.368-1.396-.526-2.19-.584m-.977 5.653c-.197.41-.232.85-.224 1.293.004.217-.064.35-.257.448-.14.07-.3.129-.408.295 1.07.661 1.382 1.783 1.778 2.866.384-1.098.72-2.204 1.765-2.867a.63.63 0 0 0-.313-.246c-.285-.119-.382-.32-.36-.622.03-.392-.014-.782-.197-1.137-.184-.356-.423-.675-.866-.698-.432-.024-.672.274-.88.6-.008.012-.015.026-.038.068m-1.117-.421c.202-.008.417.033.577-.128.001-.06-.026-.087-.057-.106-.384-.23-.771-.455-1.133-.72-.1-.074-.179-.044-.223.077a.45.45 0 0 0-.002.327c.138.37.434.508.838.55m4.86-.725c-.026-.12.017-.368-.2-.244-.377.214-.724.48-1.105.69-.052.03-.104.07-.089.142.015.07.078.09.136.102.341.073.672.058.969-.15a.61.61 0 0 0 .289-.54"></path>
                            </svg>
                          </a>
                        </div>
                        <div className="token-meta">
                          <span className="token-symbol">
                            {token.symbol || 'Unknown'}
                          </span>
                          <span className="token-time">
                            {formatCreationTime(token)}
                          </span>
                        </div>
                        {token.marketCap && (
                          <div className="token-market-cap">
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