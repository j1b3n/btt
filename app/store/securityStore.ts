import { create } from 'zustand';
import { SecurityStatus } from '../types/security';

interface SecurityStore {
  securityStatuses: Record<string, SecurityStatus>;
  setSecurityStatus: (address: string, status: SecurityStatus) => void;
  getSecurityStatus: (address: string) => SecurityStatus | null;
  removeSecurityStatus: (address: string) => void;
  clearSecurityStatuses: () => void;
}

export const useSecurityStore = create<SecurityStore>()((set, get) => ({
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
  removeSecurityStatus: (address) =>
    set((state) => {
      const { [address.toLowerCase()]: removed, ...rest } = state.securityStatuses;
      return { securityStatuses: rest };
    }),
  clearSecurityStatuses: () => set({ securityStatuses: {} }),
}));