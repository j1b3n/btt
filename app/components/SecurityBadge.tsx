import { useEffect, useState } from 'react';
import { SecurityStatus, getTokenSecurityStatus } from '../types/security';
import { useSecurityStore } from '../store/securityStore';

interface SecurityBadgeProps {
  address: string;
}

export const SecurityBadge = ({ address }: SecurityBadgeProps) => {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getSecurityStatus, setSecurityStatus } = useSecurityStore();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // First, check the cache
        const cachedStatus = getSecurityStatus(address);
        if (cachedStatus) {
          setStatus(cachedStatus);
          setIsLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const result = await getTokenSecurityStatus(address);
        if (result) {
          setSecurityStatus(address, result);
          setStatus(result);
        }
      } catch (error) {
        console.error('Error checking security status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [address, getSecurityStatus, setSecurityStatus]);

  if (isLoading) {
    return (
      <div className="security-badge">
        <span className="security-badge-label">Security Status:</span>
        <div className="security-badge-status">
          <span className="indicator"></span>
          <span>Checking...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="security-badge">
        <span className="security-badge-label">Security Status:</span>
        <div className="security-badge-status">
          <span className="indicator"></span>
          <span>Unverified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="security-badge">
      <span className="security-badge-label">Security Status:</span>
      <div className="security-badges-container">
        {status.isAICreated && (
          <div className="security-badge-tag ai-created">
            <span>Created by AI</span>
          </div>
        )}
        {status.platform && (
          <a
            href={`${status.platform.url}clanker/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="security-badge-tag platform hover:opacity-80 transition-opacity cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {status.platform.name}
          </a>
        )}
        {status.isPopularVote && (
          <div className="security-badge-tag popular-vote">
            <span>Popular Vote</span>
          </div>
        )}
        {status.isTrusted && (
          <div className="security-badge-tag trusted">
            <span>Trusted by the Community</span>
          </div>
        )}
      </div>
    </div>
  );
};