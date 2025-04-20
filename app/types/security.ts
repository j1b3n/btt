import { logger } from '../utils/logger';

export interface SecurityStatus {
  isAICreated: boolean;
  platform?: {
    name: string;
    url: string;
  };
  isTrusted: boolean;
  isPopularVote?: boolean;
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

// List of trusted token addresses (lowercase)
export const TRUSTED_TOKENS = [
  '0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf',
  '0xfa980ced6895ac314e7de34ef1bfae90a5add21b',
  '0x712f43b21cf3e1b189c27678c0f551c08c01d150',
  '0x6985884c4392d348587b19cb9eaaf157f13271cd'
];

// List of popular vote token addresses (lowercase)
export const POPULAR_VOTE_TOKENS = [
  '0x1bc0c42215582d5a085795f4badbac3ff36d1bcb',
  '0x2f6c17fa9f9bc3600346ab4e48c0701e1d5962ae',
  '0x22af33fe49fd1fa80c7149773dde5890d3c76f3b',
  '0x3ec2156d4c0a9cbdab4a016633b7bcf6a8d68ea2',
  '0x20dd04c17afd5c9a8b3f2cdacaa8ee7907385bef',
  '0x06f71fb90f84b35302d132322a3c90e4477333b0',
  '0x3c8cd0db9a01efa063a7760267b822a129bc7dca',
  '0x2d57c47bc5d2432feeedf2c9150162a9862d3ccf',
  '0x0fd7a301b51d0a83fcaf6718628174d527b373b6',
  '0x1d008f50fb828ef9debbbeae1b71fffe929bf317',
  '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4',
  '0x768be13e1680b5ebe0024c42c896e3db59ec0149',
  '0x9a26f5433671751c3276a065f57e5a02d2817973',
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
  '0x6921b130d297cc43754afba22e5eac0fbf8db75b',
  '0x2e2cc4dfce60257f091980631e75f5c436b71c87',
  '0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf',
  '0x532f27101965dd16442e59d40670faf5ebb142e4',
  '0x98d0baa52b2d063e780de12f615f963fe8537553',
  '0x2da56acb9ea78330f947bd57c54119debda7af71',
  '0xb33ff54b9f7242ef1593d2c9bcd8f9df46c77935',
  '0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825',
  '0xe3086852a4b125803c815a158249ae468a3254ca',
  '0x731814e491571a2e9ee3c5b1f7f3b962ee8f4870',
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
  '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
  '0x8c9037d1ef5c6d1f6816278c7aaf5491d24cd527',
  '0x712f43b21cf3e1b189c27678c0f551c08c01d150',
  '0xfb42da273158b0f642f59f2ba7cc1d5457481677',
  '0x02d4f76656c2b4f58430e91f8ac74896c9281cb9',
  '0x1dd2d631c92b1acdfcdd51a0f7145a50130050c4'
];

// In-memory cache for CLANKER verification results
const clankerVerificationCache: Record<string, boolean> = {};

const checkClankerToken = async (address: string): Promise<boolean> => {
  const normalizedAddress = address.toLowerCase();
  
  // Check cache first
  if (normalizedAddress in clankerVerificationCache) {
    return clankerVerificationCache[normalizedAddress];
  }

  try {
    logger.api(`Checking CLANKER verification for ${address}`, 'pending');
    const response = await fetch(`/api/verify-clanker?address=${address}`);
    
    if (!response.ok) {
      const error = `API error: ${response.status}`;
      logger.api(`CLANKER verification failed for ${address}`, 'error', error);
      throw new Error(error);
    }
    
    const data = await response.json();
    
    // Cache the result
    clankerVerificationCache[normalizedAddress] = data.exists;
    
    logger.api(
      `CLANKER verification completed for ${address}`,
      'success',
      `Result: ${data.exists ? 'Verified' : 'Not found'}`
    );
    return data.exists;
  } catch (error) {
    // Cache negative result on error
    clankerVerificationCache[normalizedAddress] = false;
    
    logger.api(
      `CLANKER verification error for ${address}`,
      'error',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return false;
  }
};

export const getTokenSecurityStatus = async (address: string): Promise<SecurityStatus | null> => {
  try {
    const normalizedAddress = address.toLowerCase();
    
    // Check if token is in popular vote list
    const isPopularVote = POPULAR_VOTE_TOKENS.includes(normalizedAddress);
    
    // Check if token is in trusted list or is a popular vote token
    const isTrusted = TRUSTED_TOKENS.includes(normalizedAddress) || isPopularVote;
    
    // Check if it's a CLANKER token
    const isClankerToken = await checkClankerToken(address);
    
    if (isClankerToken) {
      return {
        isAICreated: true,
        platform: TRUSTED_PLATFORMS.CLANKER,
        isTrusted: true,
        isPopularVote
      };
    }

    // If token is trusted or popular vote
    if (isTrusted) {
      return {
        isAICreated: false,
        isTrusted: true,
        isPopularVote
      };
    }

    // For now, return null for non-CLANKER and non-trusted tokens
    // This will be expanded when we add CLIZA verification
    return null;
  } catch (error) {
    logger.api(
      `Error getting security status for ${address}`,
      'error',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
};