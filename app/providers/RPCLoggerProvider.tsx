'use client';

import { ReactNode, useEffect } from 'react';
import { useRPCLoggerStore, type LogType, type RPCLog } from '../utils/rpcLogger';
import { parseAbiItem, AbiEvent } from 'viem';

// List of RPC endpoints to monitor
const RPC_ENDPOINTS = [
  'base.org',
  'publicnode.com',
  'meowrpc.com',
  'drpc.org',
  '1rpc.io'
];

const isRPCEndpoint = (url: string): boolean => {
  return RPC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

const getMethodDescription = (method: string, params: any): string => {
  switch (method) {
    case 'eth_call':
      return `Reading data from contract ${params?.to?.slice(0, 8)}...`;
    case 'eth_getCode':
      return `Fetching contract code for ${params?.address?.slice(0, 8)}...`;
    case 'eth_getLogs':
      return 'Fetching blockchain events...';
    case 'eth_blockNumber':
      return 'Getting latest block number...';
    case 'eth_getBalance':
      return `Checking balance for ${params?.address?.slice(0, 8)}...`;
    default:
      return method;
  }
};

const getFunctionName = (data: string): string => {
  // Function signature is the first 4 bytes (8 characters) of the data
  const signature = data.slice(2, 10);
  
  // Common function signatures
  const signatures: Record<string, string> = {
    '06fdde03': 'name()',
    '95d89b41': 'symbol()',
    '313ce567': 'decimals()',
    '18160ddd': 'totalSupply()',
    '70a08231': 'balanceOf(address)',
  };

  return signatures[signature] || 'unknown()';
};

const parseRequestDetails = (body: any): { type: LogType; details: any; description: string } => {
  if (!body || !body.method) {
    return { type: 'rpc', details: {}, description: 'Unknown RPC call' };
  }

  // Handle contract reads
  if (body.method === 'eth_call') {
    try {
      const params = body.params[0];
      const functionName = getFunctionName(params.data);
      const description = `Reading ${functionName} from contract ${params.to}`;
      
      return {
        type: 'contract',
        details: {
          contractAddress: params.to,
          functionName,
          args: params.data,
        },
        description
      };
    } catch (e) {
      return { type: 'rpc', details: {}, description: 'Contract interaction' };
    }
  }

  // Handle event logs
  if (body.method === 'eth_getLogs') {
    try {
      const params = body.params[0];
      const topics = params.topics || [];
      let eventName = '';
      
      if (topics[0]) {
        try {
          const parsedItem = parseAbiItem(topics[0]);
          // Check if the parsed item is an event
          if ('type' in parsedItem && parsedItem.type === 'event') {
            eventName = (parsedItem as AbiEvent).name;
          } else {
            eventName = topics[0];
          }
        } catch {
          eventName = topics[0];
        }
      }

      const description = params.address 
        ? `Monitoring ${eventName || 'events'} from contract ${params.address}`
        : `Monitoring ${eventName || 'blockchain'} events`;

      return {
        type: 'event',
        details: {
          eventName,
          fromBlock: params.fromBlock,
          toBlock: params.toBlock,
        },
        description
      };
    } catch (e) {
      return { type: 'rpc', details: {}, description: 'Event monitoring' };
    }
  }

  // Handle transactions
  if (body.method === 'eth_sendRawTransaction' || body.method === 'eth_getTransactionByHash') {
    const description = body.method === 'eth_sendRawTransaction' 
      ? 'Sending transaction...'
      : `Fetching transaction ${body.params[0]}`;

    return {
      type: 'transaction',
      details: {
        transactionHash: body.params[0],
      },
      description
    };
  }

  return { 
    type: 'rpc', 
    details: {}, 
    description: getMethodDescription(body.method, body.params?.[0]) 
  };
};

export function RPCLoggerProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Override the global fetch function
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = input instanceof Request ? input.url : input.toString();
      
      // Only intercept RPC calls
      if (!isRPCEndpoint(url)) {
        return originalFetch(input, init);
      }

      const startTime = performance.now();
      let requestBody: any;

      try {
        // Parse request body if it exists
        if (init?.body) {
          try {
            requestBody = JSON.parse(init.body.toString());
          } catch (e) {
            requestBody = init.body.toString();
          }
        }

        const { type, details, description } = parseRequestDetails(requestBody);

        const response = await Promise.race([
          originalFetch(input, init),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 30000)
          )
        ]) as Response;

        const duration = performance.now() - startTime;
        
        let responseBody;
        try {
          // Clone the response to read the body without consuming it
          const responseClone = response.clone();
          responseBody = await responseClone.json();
        } catch (e) {
          responseBody = null;
        }

        const log: RPCLog = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type,
          method: requestBody?.method || 'unknown',
          url,
          status: response.ok ? 'success' : 'error',
          duration,
          requestBody: JSON.stringify(requestBody, null, 2),
          responseBody: responseBody ? JSON.stringify(responseBody, null, 2) : undefined,
          details,
          description
        };

        useRPCLoggerStore.getState().addLog(log);
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        const { type, details, description } = parseRequestDetails(requestBody);
        
        const log: RPCLog = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type,
          method: requestBody?.method || 'unknown',
          url,
          status: error instanceof Error && error.message === 'Timeout' ? 'timeout' : 'error',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          requestBody: JSON.stringify(requestBody, null, 2),
          details,
          description
        };

        useRPCLoggerStore.getState().addLog(log);
        throw error;
      }
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}