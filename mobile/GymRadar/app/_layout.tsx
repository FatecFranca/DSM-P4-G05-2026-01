import React, { useEffect } from 'react';
import { Slot, useRouter, usePathname, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { GymProvider } from '../src/context/GymContext';

function Gate() {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key || loading) return;

    const publicRoutes = new Set(['/login', '/signup']);
    const isPublic = publicRoutes.has(pathname);

    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    } else if (isAuthenticated && isPublic) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, pathname, router, navState?.key]);

  if (loading || !navState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GymProvider>
          <Gate />
        </GymProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}