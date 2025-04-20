import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenContractData {
  name: string;
  symbol: string;
  timestamp: number;
}

interface TokenContractStore {
  contracts: Record<string, TokenContractData>;
  addContract: (address: string, data: TokenContractData) => void;
  getContract: (address: string) => TokenContractData | null;
  hasContract: (address: string) => boolean;
  clearContracts: () => void;
}

export const useTokenContractStore = create<TokenContractStore>()(
  persist(
    (set, get) => ({
      contracts: {},
      addContract: (address, data) =>
        set((state) => ({
          contracts: {
            ...state.contracts,
            [address.toLowerCase()]: data,
          },
        })),
      getContract: (address) => {
        const state = get();
        return state.contracts[address.toLowerCase()] || null;
      },
      hasContract: (address) => {
        const state = get();
        return !!state.contracts[address.toLowerCase()];
      },
      clearContracts: () => set({ contracts: {} }),
    }),
    {
      name: 'token-contract-storage',
    }
  )
);