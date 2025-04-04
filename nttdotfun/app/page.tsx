'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { zeroAddress } from 'viem';

interface Token {
  address: string;
  name: string;
  symbol: string;
  timestamp: number;
}

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const fetchNewTokens = async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = BigInt(Number(latestBlock) - 1000);

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

        publicClient.watchEvent({
          address: undefined,
          event: transferEvent,
          args: {
            from: zeroAddress,
          },
          onLogs: async (logs) => {
            for (const log of logs) {
              try {
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
                  ],
                };

                let name: string;
                let symbol: string;

                try {
                  name = await publicClient.readContract({
                    ...tokenContract,
                    functionName: 'name',
                  }) as string;
                } catch (error) {
                  console.warn(`Failed to fetch name for token ${log.address}:`, error);
                  name = 'Unknown Token';
                }

                try {
                  symbol = await publicClient.readContract({
                    ...tokenContract,
                    functionName: 'symbol',
                  }) as string;
                } catch (error) {
                  console.warn(`Failed to fetch symbol for token ${log.address}:`, error);
                  symbol = '???';
                }

                const newToken = {
                  address: log.address,
                  name,
                  symbol,
                  timestamp: Date.now(),
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
        console.error('Error setting up event filter:', error);
      }
    };

    fetchNewTokens();
  }, [publicClient]);

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      <header className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Base Token Scanner</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="grid gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">New Tokens on Base</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Live monitoring of newly created ERC20 tokens on the Base network.
              </p>
            </div>
            <div className="space-y-4">
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Waiting for new tokens to be created...
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    New tokens will appear here automatically as they are created on Base
                  </p>
                </div>
              ) : (
                tokens.map((token) => (
                  <div
                    key={token.address}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{token.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Symbol: {token.symbol}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(token.timestamp, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <a
                        href={`https://basescan.org/token/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        View on BaseScan →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}