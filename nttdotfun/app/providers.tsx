'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider, fallback } from 'wagmi';
import { base } from 'wagmi/chains';
import type { ReactNode } from 'react';

const rpcUrls = [
  'https://mainnet.base.org',
  'https://base.publicnode.com',
  'https://base.meowrpc.com',
  'https://base.drpc.org',
  'https://1rpc.io/base'
];

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback(
      rpcUrls.map(url => 
        http(url, {
          timeout: 30_000,
          batch: {
            batchSize: 1024,
            wait: 16,
          },
          retryCount: 3,
          retryDelay: 1000,
          fetchOptions: {
            cache: 'no-store',
          },
        })
      )
    ),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}