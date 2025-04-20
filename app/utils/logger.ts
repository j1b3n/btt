'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Log {
  id: string;
  timestamp: number;
  type: 'blockchain' | 'api' | 'system' | 'rpc';
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
  method?: string;
  url?: string;
  blockNumber?: string;
  responseTime?: number;
  rpcEndpoint?: string;
  requestData?: string;
  responseData?: string;
  scanData?: {
    fromBlock?: string;
    toBlock?: string;
    eventType?: string;
    contractAddress?: string;
  };
}

interface LoggerStore {
  logs: Log[];
  showLogs: boolean;
  hidePopularVote: boolean;
  hideNoMarketCapData: boolean;
  hideInactivePairs: boolean;
  hideOlderThan24h: boolean;
  hideUnverified: boolean;
  addLog: (log: Log) => void;
  clearLogs: () => void;
  setShowLogs: (show: boolean) => void;
  setHidePopularVote: (hide: boolean) => void;
  setHideNoMarketCapData: (hide: boolean) => void;
  setHideInactivePairs: (show: boolean) => void;
  setHideOlderThan24h: (hide: boolean) => void;
  setHideUnverified: (hide: boolean) => void;
}

export const useLoggerStore = create<LoggerStore>()(
  persist(
    (set) => ({
      logs: [],
      showLogs: false,
      hidePopularVote: false,
      hideNoMarketCapData: false,
      hideInactivePairs: false,
      hideOlderThan24h: false,
      hideUnverified: false,
      addLog: (log) => {
        // Prevent duplicate logs within a short time window
        set((state) => {
          const recentDuplicate = state.logs.find(
            (existingLog) =>
              existingLog.message === log.message &&
              existingLog.type === log.type &&
              existingLog.status === log.status &&
              (Date.now() - existingLog.timestamp) < 1000 // 1 second window
          );

          if (recentDuplicate) {
            return state;
          }

          return { logs: [log, ...state.logs].slice(0, 1000) };
        });
      },
      clearLogs: () => set({ logs: [] }),
      setShowLogs: (show) => set({ showLogs: show }),
      setHidePopularVote: (hide) => set({ hidePopularVote: hide }),
      setHideNoMarketCapData: (hide) => set({ hideNoMarketCapData: hide }),
      setHideInactivePairs: (show) => set({ hideInactivePairs: show }),
      setHideOlderThan24h: (hide) => set({ hideOlderThan24h: hide }),
      setHideUnverified: (hide) => set({ hideUnverified: hide }),
    }),
    {
      name: 'logger-storage',
    }
  )
);

class Logger {
  private isClient: boolean;
  private startTime: number = 0;
  private lastLogTimestamps: Map<string, number> = new Map();

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  private shouldCreateLog(type: string, message: string, status: string): boolean {
    if (!this.isClient) return false;

    const key = `${type}-${message}-${status}`;
    const now = Date.now();
    const lastTimestamp = this.lastLogTimestamps.get(key) || 0;

    // Prevent duplicate logs within 1 second
    if (now - lastTimestamp < 1000) {
      return false;
    }

    this.lastLogTimestamps.set(key, now);
    return true;
  }

  private createLog(
    type: Log['type'],
    status: Log['status'],
    message: string,
    details?: string,
    extra?: Partial<Log>
  ): Log | null {
    if (!this.shouldCreateLog(type, message, status)) {
      return null;
    }

    const log: Log = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      status,
      message,
      details,
      ...extra,
    };

    useLoggerStore.getState().addLog(log);
    return log;
  }

  startTimer() {
    this.startTime = performance.now();
  }

  getElapsedTime(): number {
    return Math.round(performance.now() - this.startTime);
  }

  blockchain(
    message: string,
    status: Log['status'] = 'success',
    details?: string,
    scanData?: {
      fromBlock?: string;
      toBlock?: string;
      eventType?: string;
      contractAddress?: string;
    }
  ) {
    return this.createLog('blockchain', status, message, details, { scanData });
  }

  api(
    message: string,
    status: Log['status'] = 'success',
    details?: string,
    method?: string,
    url?: string
  ) {
    const responseTime = this.getElapsedTime();
    return this.createLog('api', status, message, details, {
      method,
      url,
      responseTime,
    });
  }

  rpc(
    message: string,
    status: Log['status'] = 'success',
    details?: string,
    rpcEndpoint?: string,
    requestData?: string,
    responseData?: string
  ) {
    const responseTime = this.getElapsedTime();
    return this.createLog('rpc', status, message, details, {
      rpcEndpoint,
      responseTime,
      requestData,
      responseData,
    });
  }

  system(message: string, status: Log['status'] = 'success', details?: string) {
    return this.createLog('system', status, message, details);
  }

  getLogs(): Log[] {
    return useLoggerStore.getState().logs;
  }

  clear() {
    if (!this.isClient) return;
    useLoggerStore.getState().clearLogs();
  }
}

export const logger = new Logger();