'use client';

import { useEffect } from 'react';
import { useCityStore } from '@/app/store/useCityStore';

export default function CityProvider({ children }: { children: React.ReactNode }) {
  const fetchCities = useCityStore((state) => state.fetchCities);

  useEffect(() => {
    // Fetch cities when app loads
    fetchCities();
  }, [fetchCities]);

  return <>{children}</>;
}
