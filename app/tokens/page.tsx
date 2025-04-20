'use client';

import { useEffect, useState } from 'react';
import { TRUSTED_TOKENS, POPULAR_VOTE_TOKENS } from '../types/security';

interface TokenList {
  trusted: string[];
  popularVote: string[];
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenList>({
    trusted: TRUSTED_TOKENS,
    popularVote: POPULAR_VOTE_TOKENS
  });

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Token Lists</h1>
        
        <div className="space-y-8">
          <div className="bg-[var(--card-bg)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trusted Tokens</h2>
              <button
                onClick={() => copyToClipboard(tokens.trusted.join('\n'), 'trusted')}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-hover)] transition-colors"
              >
                {copiedSection === 'trusted' ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="bg-[var(--nav-bg)] p-4 rounded font-mono text-sm">
              {tokens.trusted.map((address, index) => (
                <div key={address} className="mb-2 last:mb-0">
                  {address}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Popular Vote Tokens</h2>
              <button
                onClick={() => copyToClipboard(tokens.popularVote.join('\n'), 'popularVote')}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-hover)] transition-colors"
              >
                {copiedSection === 'popularVote' ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="bg-[var(--nav-bg)] p-4 rounded font-mono text-sm">
              {tokens.popularVote.map((address, index) => (
                <div key={address} className="mb-2 last:mb-0">
                  {address}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}