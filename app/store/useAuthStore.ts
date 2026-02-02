import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  email: string;
  role: 'admin' | 'patient' | 'physiotherapist';
  
  // Physiotherapist fields
  dob?: string;
  practicingSince?: string;
  degrees?: string[];
  specialities?: string[];
  citiesAvailable?: string[];
  clinicAddresses?: string[];
  
  // Patient fields
  age?: number;
  city?: string;
  
  // Common fields
  mobileNumber?: string;
  gender?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
