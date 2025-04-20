'use client';

import { useEffect, useState } from 'react';
import { useLoggerStore, type Log } from '../utils/logger';
import Link from 'next/link';

type LogSection = 'blockchain' | 'dexscreener' | 'trusted-platforms';

export default function LogsPage() {
  const logs = useLoggerStore(state => state.logs);
  const clearLogs = useLoggerStore(state => state.clearLogs);
  const [selectedSection, setSelectedSection] = useState<LogSection>('blockchain');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  const getSectionColor = (section: LogSection) => {
    switch (section) {
      case 'blockchain':
        return 'bg-blue-500 border-blue-600';
      case 'dexscreener':
        return 'bg-purple-500 border-purple-600';
      case 'trusted-platforms':
        return 'bg-green-500 border-green-600';
      default:
        return '';
    }
  };

  const getFilteredLogs = () => {
    switch (selectedSection) {
      case 'blockchain':
        return logs.filter(log => log.type === 'blockchain');
      case 'dexscreener':
        return logs.filter(log => log.type === 'api' && !log.message.includes('CLANKER'));
      case 'trusted-platforms':
        return logs.filter(log => log.type === 'api' && log.message.includes('CLANKER'));
      default:
        return [];
    }
  };

  const filteredLogs = getFilteredLogs();

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      clearLogs();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="nav">
        <div className="container nav-content">
          <Link href="/" className="btn btn-primary">
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Section color indicator at the top */}
        <div className={`h-1 w-full rounded-t-lg ${getSectionColor(selectedSection)}`}></div>
        
        <div className="bg-[var(--card-bg)] rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedSection('blockchain')}
                  className={`px-4 py-2 rounded-md transition-colors relative ${
                    selectedSection === 'blockchain'
                      ? 'bg-[var(--primary)] text-white font-medium'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--primary-hover)]'
                  }`}
                >
                  {selectedSection === 'blockchain' && (
                    <span className="absolute left-0 top-0 w-1 h-full bg-blue-500"></span>
                  )}
                  Blockchain Events
                </button>
                <button
                  onClick={() => setSelectedSection('dexscreener')}
                  className={`px-4 py-2 rounded-md transition-colors relative ${
                    selectedSection === 'dexscreener'
                      ? 'bg-[var(--primary)] text-white font-medium'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--primary-hover)]'
                  }`}
                >
                  {selectedSection === 'dexscreener' && (
                    <span className="absolute left-0 top-0 w-1 h-full bg-purple-500"></span>
                  )}
                  DexScreener API
                </button>
                <button
                  onClick={() => setSelectedSection('trusted-platforms')}
                  className={`px-4 py-2 rounded-md transition-colors relative ${
                    selectedSection === 'trusted-platforms'
                      ? 'bg-[var(--primary)] text-white font-medium'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--primary-hover)]'
                  }`}
                >
                  {selectedSection === 'trusted-platforms' && (
                    <span className="absolute left-0 top-0 w-1 h-full bg-green-500"></span>
                  )}
                  Trusted Platforms Check
                </button>
              </div>
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Logs
              </button>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-[var(--nav-bg)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={getStatusColor(log.status)}>{log.message}</span>
                    {log.details && (
                      <span className="text-[#94A3B8]">({log.details})</span>
                    )}
                  </div>
                  <span className="text-[#64748B] text-sm">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                No logs available for this section
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}