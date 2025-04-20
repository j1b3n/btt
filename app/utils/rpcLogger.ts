import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogType = 'blockchain' | 'api' | 'system' | 'rpc' | 'contract' | 'event' | 'transaction';

export interface RPCLog {
  id: string;
  timestamp: number;
  type: LogType;
  method?: string;
  url?: string;
  status: 'success' | 'error' | 'timeout';
  duration?: number;
  error?: string;
  requestBody?: string;
  responseBody?: string;
  details: {
    contractAddress?: string;
    functionName?: string;
    args?: any;
    eventName?: string;
    fromBlock?: string;
    toBlock?: string;
    transactionHash?: string;
  };
  description: string;
}

interface RPCLoggerStore {
  logs: RPCLog[];
  maxLogs: number;
  addLog: (log: RPCLog) => void;
  clearLogs: () => void;
  setMaxLogs: (max: number) => void;
}

export const useRPCLoggerStore = create<RPCLoggerStore>()(
  persist(
    (set) => ({
      logs: [],
      maxLogs: 1000,
      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].slice(0, state.maxLogs),
        })),
      clearLogs: () => set({ logs: [] }),
      setMaxLogs: (max) => set({ maxLogs: max }),
    }),
    {
      name: 'rpc-logger-storage',
      partialize: (state) => ({
        logs: state.logs.slice(0, 100), // Only persist last 100 logs
        maxLogs: state.maxLogs,
      }),
    }
  )
);

// Helper function to prevent duplicate logs within a time window
const recentLogs = new Map<string, number>();
const LOG_DEBOUNCE_TIME = 1000; // 1 second

export const shouldLogRPC = (method: string, url: string, status: string): boolean => {
  const key = `${method}-${url}-${status}`;
  const now = Date.now();
  const lastLog = recentLogs.get(key);

  if (lastLog && now - lastLog < LOG_DEBOUNCE_TIME) {
    return false;
  }

  recentLogs.set(key, now);

  // Clean up old entries
  for (const [key, timestamp] of recentLogs.entries()) {
    if (now - timestamp > LOG_DEBOUNCE_TIME) {
      recentLogs.delete(key);
    }
  }

  return true;
};