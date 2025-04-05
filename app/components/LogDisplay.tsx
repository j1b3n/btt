'use client';

import { useEffect, useState } from 'react';
import { useLoggerStore } from '../utils/logger';

export const LogDisplay = () => {
  const logs = useLoggerStore(state => state.logs);
  const showLogs = useLoggerStore(state => state.showLogs);
  const [latestLog, setLatestLog] = useState(logs[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      setLatestLog(logs[0]);
    }
  }, [logs]);

  if (!mounted || !showLogs || !latestLog) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-[#10B981]';
      case 'error':
        return 'text-[#EF4444]';
      case 'pending':
        return 'text-[#8B5CF6]';
      default:
        return 'text-[#94A3B8]';
    }
  };

  return (
    <div className="py-2">
      <div className="container mx-auto px-4">
        <div className="bg-[#1E293B] rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center justify-center px-3 py-2">
            <div className="flex items-center text-xs">
              <span className={`${getStatusColor(latestLog.status)}`}>{latestLog.message}</span>
              {latestLog.details && (
                <span className="text-[#94A3B8] ml-2">({latestLog.details})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};