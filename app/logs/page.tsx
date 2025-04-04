'use client';

import { useRouter } from 'next/navigation';
import { logger } from '../utils/logger';

export default function LogsPage() {
  const router = useRouter();
  const logs = logger.getLogs();

  const getStatusColor = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return 'text-[var(--success)]';
      case 'error':
        return 'text-[var(--error)]';
      case 'pending':
        return 'text-[var(--text-secondary)]';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div>
      <nav className="nav">
        <div className="container nav-content">
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <main className="main container">
        <div className="token-card">
          <div className="token-card-content">
            <h1 className="text-2xl font-bold mb-4">System Logs</h1>
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[var(--nav-bg)] p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${getStatusColor(log.status)}`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-[var(--text-secondary)] text-sm">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-[var(--text-primary)]">{log.message}</p>
                  {log.details && (
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                      {log.details}
                    </p>
                  )}
                  {log.responseTime && (
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                      Response time: {log.responseTime}ms
                    </p>
                  )}
                  {log.blockNumber && (
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                      Block: {log.blockNumber}
                    </p>
                  )}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  No logs available
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}