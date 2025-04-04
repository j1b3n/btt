'use client';

import { create } from 'zustand';

export interface Log {
  id: string;
  timestamp: number;
  type: 'blockchain' | 'api' | 'system';
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
  method?: string;
  url?: string;
  blockNumber?: string;
  responseTime?: number;
}

interface LoggerStore {
  logs: Log[];
  addLog: (log: Log) => void;
  clearLogs: () => void;
}

const useLoggerStore = create<LoggerStore>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 1000) })),
  clearLogs: () => set({ logs: [] }),
}));

class Logger {
  private isClient: boolean;
  private startTime: number = 0;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  private createLog(
    type: Log['type'],
    status: Log['status'],
    message: string,
    details?: string,
    extra?: Partial<Log>
  ): Log | null {
    if (!this.isClient) return null;

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
    blockNumber?: string
  ) {
    return this.createLog('blockchain', status, message, details, { blockNumber });
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