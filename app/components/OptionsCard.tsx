'use client';

import { useEffect, useState } from 'react';
import { useLoggerStore } from '../utils/logger';

export const OptionsCard = () => {
  const showLogs = useLoggerStore(state => state.showLogs);
  const setShowLogs = useLoggerStore(state => state.setShowLogs);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="bg-[#1E293B] rounded-lg shadow-lg max-w-2xl mx-auto">
        <div className="p-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLogs"
              checked={showLogs}
              onChange={(e) => setShowLogs(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showLogs" className="ml-2 text-sm text-[#94A3B8]">
              Show System Logs
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};