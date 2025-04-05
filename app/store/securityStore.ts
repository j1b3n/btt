import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SecurityStatus } from '../types/security';

interface SecurityStore {
  securityStatuses: Record<string, SecurityStatus>;
  setSecurityStatus: (address: string, status: SecurityStatus) => void;
  getSecurityStatus: (address: string) => SecurityStatus | null;
  clearSecurityStatuses: () => void;
}

export const useSecurityStore = create<SecurityStore>()(
  persist(
    (set, get) => ({
      securityStatuses: {},
      setSecurityStatus: (address, status) =>
        set((state) => ({
          securityStatuses: {
            ...state.securityStatuses,
            [address.toLowerCase()]: status,
          },
        })),
      getSecurityStatus: (address) => {
        const state = get();
        return state.securityStatuses[address.toLowerCase()] || null;
      },
      clearSecurityStatuses: () => set({ securityStatuses: {} }),
    }),
    {
      name: 'security-status-storage',
    }
  )
);