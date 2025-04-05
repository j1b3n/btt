import { useEffect, useState } from 'react';
import { SecurityStatus, getTokenSecurityStatus } from '../types/security';

interface SecurityBadgeProps {
  address: string;
}

export const SecurityBadge = ({ address }: SecurityBadgeProps) => {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await getTokenSecurityStatus(address);
        setStatus(result);
      } catch (error) {
        console.error('Error checking security status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [address]);

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
            className="security-badge-tag platform"
          >
            {status.platform.name}
          </a>
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