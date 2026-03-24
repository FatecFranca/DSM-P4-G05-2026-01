import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthAPI from '../api/auth';
import { setAuthToken } from '../api/client';

type AuthContextType = {
  token: string | null;
  user: { username: string } | null;
  isAuthenticated: boolean;
  loading: boolean; // NEW
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [hydrated, setHydrated] = useState(false); // true after reading AsyncStorage

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedUser = await AsyncStorage.getItem('auth_user');
      if (savedToken) {
        setToken(savedToken);
        setAuthToken(savedToken); // attach token to client on app start
      }
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch {}
      }
      setHydrated(true);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const { token } = await AuthAPI.login(username, password);
    setToken(token);
    setAuthToken(token); // attach for subsequent calls
    setUser({ username });
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify({ username }));
  };

  const signup = async (username: string, password: string) => {
    const { token } = await AuthAPI.signup(username, password);
    setToken(token);
    setAuthToken(token);
    setUser({ username });
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify({ username }));
  };

  const logout = async () => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token && hydrated,
      loading: !hydrated, 
      login,
      signup,
      logout,
    }),
    [token, user, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);