'use client';

import { useEffect, useState } from 'react';
import { useLoggerStore } from '../utils/logger';
import Link from 'next/link';

export const OptionsCard = () => {
  const showLogs = useLoggerStore(state => state.showLogs);
  const hidePopularVote = useLoggerStore(state => state.hidePopularVote);
  const hideNoMarketCapData = useLoggerStore(state => state.hideNoMarketCapData);
  const hideInactivePairs = useLoggerStore(state => state.hideInactivePairs);
  const hideOlderThan24h = useLoggerStore(state => state.hideOlderThan24h);
  const hideUnverified = useLoggerStore(state => state.hideUnverified);
  const setShowLogs = useLoggerStore(state => state.setShowLogs);
  const setHidePopularVote = useLoggerStore(state => state.setHidePopularVote);
  const setHideNoMarketCapData = useLoggerStore(state => state.setHideNoMarketCapData);
  const setHideInactivePairs = useLoggerStore(state => state.setHideInactivePairs);
  const setHideOlderThan24h = useLoggerStore(state => state.setHideOlderThan24h);
  const setHideUnverified = useLoggerStore(state => state.setHideUnverified);
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowLogs(true);
  }, [setShowLogs]);

  const resetToDefaults = () => {
    setShowLogs(false);
    setHidePopularVote(false);
    setHideNoMarketCapData(true);
    setHideInactivePairs(true);
    setHideOlderThan24h(false);
    setHideUnverified(false);
  };

  const setSniperMode = () => {
    setShowLogs(false);
    setHidePopularVote(true);
    setHideNoMarketCapData(true);
    setHideInactivePairs(true);
    setHideOlderThan24h(true);
    setHideUnverified(false);
  };

  const setSafeMode = () => {
    setShowLogs(false);
    setHidePopularVote(false);
    setHideNoMarketCapData(false);
    setHideInactivePairs(false);
    setHideOlderThan24h(false);
    setHideUnverified(true);
  };

  const setDiscoveryMode = () => {
    setShowLogs(false);
    setHidePopularVote(true);
    setHideNoMarketCapData(false);
    setHideInactivePairs(false);
    setHideOlderThan24h(true);
    setHideUnverified(false);
  };

  const getActiveMode = () => {
    const activeFilters = [
      hidePopularVote,
      hideNoMarketCapData,
      hideInactivePairs,
      hideOlderThan24h,
      hideUnverified
    ].filter(Boolean).length;

    // Return null if more than the exact filters for any mode are active
    if (activeFilters > 4) {
      return null;
    }

    // Check for exact matches of each mode
    if (hidePopularVote && hideNoMarketCapData && hideInactivePairs && hideOlderThan24h && !hideUnverified) {
      return 'Sniper mode';
    }
    if (!hidePopularVote && !hideNoMarketCapData && !hideInactivePairs && !hideOlderThan24h && hideUnverified) {
      return 'Safe mode';
    }
    if (hidePopularVote && !hideNoMarketCapData && !hideInactivePairs && hideOlderThan24h && !hideUnverified) {
      return 'Discovery mode';
    }
    return null;
  };

  if (!mounted) return null;

  const activeFilters = [
    hidePopularVote && 'Popular Vote',
    hideNoMarketCapData && 'No Market Cap',
    hideInactivePairs && 'Inactive Pairs',
    hideOlderThan24h && '24h+',
    hideUnverified && 'Unverified'
  ].filter(Boolean);

  const activeMode = getActiveMode();

  return (
    <div className="container mx-auto px-4 py-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full transition-all duration-300 ease-in-out ${
          isExpanded ? 'mb-2' : ''
        }`}
      >
        <div className="bg-[#1E293B] rounded-lg shadow-lg overflow-hidden hover:bg-[#2D3B4F] transition-colors">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-sm font-medium text-[#94A3B8]">Options</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSniperMode();
                  }}
                  style={{
                    background: 'var(--sniper-mode-bg)',
                    border: '1px solid var(--sniper-mode-border)',
                    color: 'var(--sniper-mode-text)'
                  }}
                  className="text-xs font-medium px-3 py-1 rounded-md hover:bg-[rgba(236,72,153,0.2)] transition-all duration-200"
                >
                  Sniper mode
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSafeMode();
                  }}
                  style={{
                    background: 'var(--cool-mode-bg)',
                    border: '1px solid var(--cool-mode-border)',
                    color: 'var(--cool-mode-text)'
                  }}
                  className="text-xs font-medium px-3 py-1 rounded-md hover:bg-[rgba(45,212,191,0.2)] transition-all duration-200"
                >
                  Safe mode
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDiscoveryMode();
                  }}
                  style={{
                    background: 'var(--discovery-mode-bg)',
                    border: '1px solid var(--discovery-mode-border)',
                    color: 'var(--discovery-mode-text)'
                  }}
                  className="text-xs font-medium px-3 py-1 rounded-md hover:bg-[rgba(168,85,247,0.2)] transition-all duration-200"
                >
                  Discovery mode
                </button>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs text-[#64748B] bg-[#2D3B4F] px-2 py-1 rounded-full">
                    {activeMode ? `${activeMode} is active` : `${activeFilters.length} active`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out transform ${
          isExpanded 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none absolute'
        }`}
      >
        <div className="bg-[#1E293B] rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="space-y-4">
              <div className="bg-[#2D3B4F] rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showLogs}
                        onChange={(e) => setShowLogs(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[#4B5563] rounded peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] transition-all duration-200 flex items-center justify-center">
                        {showLogs && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                      Show System Logs
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={hidePopularVote}
                        onChange={(e) => setHidePopularVote(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[#4B5563] rounded peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] transition-all duration-200 flex items-center justify-center">
                        {hidePopularVote && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                      Hide Popular Vote
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={hideNoMarketCapData}
                        onChange={(e) => setHideNoMarketCapData(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[#4B5563] rounded peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] transition-all duration-200 flex items-center justify-center">
                        {hideNoMarketCapData && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                      Hide No Market Cap
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={hideInactivePairs}
                        onChange={(e) => setHideInactivePairs(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[#4B5563] rounded peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] transition-all duration-200 flex items-center justify-center">
                        {hideInactivePairs && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                      Hide Inactive Pairs
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={hideOlderThan24h}
                        onChange={(e) => setHideOlderThan24h(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[#4B5563] rounded peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] transition-all duration-200 flex items-center justify-center">
                        {hideOlderThan24h && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                      Hide Tokens Older Than 24h
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={hideUnverified}
                        onChange={(e) => setHideUnverified(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[#4B5563] rounded peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] transition-all duration-200 flex items-center justify-center">
                        {hideUnverified && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                      Hide Unverified
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/logs"
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                  View Logs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};