import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as GymAPI from '../api/gym';
import { useAuth } from './AuthContext';

type GymState = { current: number; capacity: number; name?: string };
type GymContextType = {
  gym: GymState;
  loading: boolean;
  refresh: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  sendTemperature: (celsius: number) => Promise<void>;
};

const GymContext = createContext<GymContextType>({} as any);

export const GymProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [gym, setGym] = useState<GymState>({ current: 0, capacity: 50, name: undefined });
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSimName, setLastSimName] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { current, capacity, name } = await GymAPI.getOccupancy();
      setGym({
        current: typeof current === 'number' ? current : 0,
        capacity: typeof capacity === 'number' && capacity > 0 ? capacity : 50,
        name: typeof name === 'string' ? name : gym.name,
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, gym.name]);

  const checkIn = useCallback(async () => {
    if (!isAuthenticated) throw new Error('You must be logged in to check in.');
    const name = `sim-${Math.random().toString(36).slice(2, 8)}`;
    const email = `${name}@sim.local`;
    const phone = `+5551${Math.floor(10000000 + Math.random() * 89999999)}`;
    setLastSimName(name);
    await GymAPI.addClient(name, email, phone);
    await refresh();
  }, [isAuthenticated, refresh]);

  const checkOut = useCallback(async () => {
    if (!isAuthenticated) throw new Error('You must be logged in to check out.');
    const name = lastSimName ?? `sim-${Math.random().toString(36).slice(2, 8)}`;
    await GymAPI.checkoutClient(name);
    await refresh();
  }, [isAuthenticated, lastSimName, refresh]);

  const sendTemperature = useCallback(async (_celsius: number) => {
    return;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      const id = setInterval(refresh, 8000);
      return () => clearInterval(id);
    }
  }, [isAuthenticated, refresh]);

  const value = useMemo(
    () => ({ gym, loading, refresh, checkIn, checkOut, sendTemperature }),
    [gym, loading, refresh, checkIn, checkOut, sendTemperature]
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
};

export const useGym = () => useContext(GymContext);