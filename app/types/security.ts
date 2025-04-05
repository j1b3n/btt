export interface SecurityStatus {
  isAICreated: boolean;
  platform?: {
    name: string;
    url: string;
  };
  isTrusted: boolean;
}

export const TRUSTED_PLATFORMS = {
  CLANKER: {
    name: 'CLANKER',
    url: 'https://www.clanker.world/'
  },
  CLIZA: {
    name: 'CLIZA.ai',
    url: 'https://cliza.ai/'
  }
} as const;

const checkClankerToken = async (address: string): Promise<boolean> => {
  try {
    // Use our API route instead of direct request
    const response = await fetch(`/api/verify-clanker?address=${address}`);
    if (!response.ok) {
      throw new Error('Failed to verify token');
    }
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking CLANKER token:', error);
    return false;
  }
};

export const getTokenSecurityStatus = async (address: string): Promise<SecurityStatus | null> => {
  try {
    const isClankerToken = await checkClankerToken(address);
    
    if (isClankerToken) {
      return {
        isAICreated: true,
        platform: TRUSTED_PLATFORMS.CLANKER,
        isTrusted: true
      };
    }

    // For now, return null for non-CLANKER tokens
    // This will be expanded when we add CLIZA verification
    return null;
  } catch (error) {
    console.error('Error getting token security status:', error);
    return null;
  }
};