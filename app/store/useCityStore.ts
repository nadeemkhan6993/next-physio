import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CityOption {
  value: string;
  label: string;
}

interface CityStore {
  cities: CityOption[];
  isLoading: boolean;
  error: string | null;
  fetchCities: () => Promise<void>;
  clearError: () => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set, get) => ({
      cities: [],
      isLoading: false,
      error: null,

      fetchCities: async () => {
        // Don't fetch if already loaded
        if (get().cities.length > 0) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/cities');
          const data = await response.json();

          if (data.success) {
            set({ cities: data.data, isLoading: false });
          } else {
            set({ error: data.error || 'Failed to load cities', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to load cities', isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'city-storage',
      partialize: (state) => ({ cities: state.cities }),
    }
  )
);
