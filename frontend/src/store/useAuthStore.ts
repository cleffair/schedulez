import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null; // Typed profile from backend can go here
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setInitialized: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (state) => set({ isInitialized: state }),
  logout: () => set({ user: null, profile: null }),
}));
