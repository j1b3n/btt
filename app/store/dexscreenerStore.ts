import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenCheckData {
  lastChecked: number;
  hasPairs: boolean;
  firstSeen: number;
  checkCount: number;
  lastPriceMovement?: number;
}

interface DexScreenerStore {
  tokenChecks: Record<string, TokenCheckData>;
  updateTokenCheck: (address: string, hasPairs: boolean, hasPriceMovement?: boolean) => void;
  shouldCheckToken: (address: string) => boolean;
  markTokenAsNew: (address: string) => void;
  clearChecks: () => void;
}

const NEW_TOKEN_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const NEW_TOKEN_CHECK_INTERVAL = 5000; // 5 seconds
const ACTIVE_TOKEN_CHECK_INTERVAL = 15000; // 15 seconds
const INACTIVE_TOKEN_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECKS_WITHOUT_MOVEMENT = 3; // Maximum number of checks for new tokens without price movement

export const useDexScreenerStore = create<DexScreenerStore>()(
  persist(
    (set, get) => ({
      tokenChecks: {},
      updateTokenCheck: (address, hasPairs, hasPriceMovement = false) =>
        set((state) => {
          const normalizedAddress = address.toLowerCase();
          const currentCheck = state.tokenChecks[normalizedAddress];
          const now = Date.now();
          
          // If this is a new check, initialize the data
          if (!currentCheck) {
            return {
              tokenChecks: {
                ...state.tokenChecks,
                [normalizedAddress]: {
                  lastChecked: now,
                  hasPairs,
                  firstSeen: now,
                  checkCount: 1,
                  lastPriceMovement: hasPriceMovement ? now : undefined,
                },
              },
            };
          }

          // Update existing check data
          return {
            tokenChecks: {
              ...state.tokenChecks,
              [normalizedAddress]: {
                ...currentCheck,
                lastChecked: now,
                hasPairs,
                checkCount: currentCheck.checkCount + 1,
                lastPriceMovement: hasPriceMovement ? now : currentCheck.lastPriceMovement,
              },
            },
          };
        }),
      shouldCheckToken: (address) => {
        const check = get().tokenChecks[address.toLowerCase()];
        if (!check) return true;

        const now = Date.now();
        const timeSinceFirstSeen = now - check.firstSeen;
        const timeSinceLastCheck = now - check.lastChecked;

        // Always check tokens that haven't been checked in a while
        if (timeSinceLastCheck >= INACTIVE_TOKEN_CHECK_INTERVAL) {
          return true;
        }

        // If token is new (less than 2 minutes old)
        if (timeSinceFirstSeen < NEW_TOKEN_TIMEOUT) {
          // If no price movement after 3 checks, continue checking less frequently
          if (!check.lastPriceMovement && check.checkCount >= MAX_CHECKS_WITHOUT_MOVEMENT) {
            return timeSinceLastCheck >= INACTIVE_TOKEN_CHECK_INTERVAL;
          }
          return timeSinceLastCheck >= NEW_TOKEN_CHECK_INTERVAL;
        }

        // For tokens with active trading
        if (check.hasPairs || check.lastPriceMovement) {
          return timeSinceLastCheck >= ACTIVE_TOKEN_CHECK_INTERVAL;
        }

        // For inactive tokens
        return timeSinceLastCheck >= INACTIVE_TOKEN_CHECK_INTERVAL;
      },
      markTokenAsNew: (address) =>
        set((state) => {
          const now = Date.now();
          return {
            tokenChecks: {
              ...state.tokenChecks,
              [address.toLowerCase()]: {
                lastChecked: now,
                hasPairs: false,
                firstSeen: now,
                checkCount: 0,
              },
            },
          };
        }),
      clearChecks: () => set({ tokenChecks: {} }),
    }),
    {
      name: 'dexscreener-storage',
    }
  )
);