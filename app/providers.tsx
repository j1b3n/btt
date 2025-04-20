'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider, fallback } from 'wagmi';
import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import type { ReactNode } from 'react';
import { logger } from './utils/logger';

const rpcUrls = [
  'https://base.publicnode.com',
  'https://mainnet.base.org',
  'https://base.drpc.org'
];

const getBaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (e) {
    return url;
  }
};

const createTransport = (url: string, isPrimary = false) => 
  http(url, {
    timeout: 20000,
    retryCount: isPrimary ? 3 : 2,
    retryDelay: 1000,
    batch: {
      batchSize: 512,
      wait: 16,
    },
    fetchOptions: {
      cache: 'no-store',
    }
  });

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback(
      rpcUrls.map((url, index) => createTransport(url, index === 0))
    ),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.code === -32016) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5000,
      gcTime: 10000,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{ 
            appearance: { 
              mode: 'auto',
            }
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}