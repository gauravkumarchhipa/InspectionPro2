import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userSession = await AsyncStorage.getItem('user_session');
      if (!userSession) {
        // No session found, redirect to login
        router.replace('/login');
      } else {
        const session = JSON.parse(userSession);
        if (!session.isAuthenticated) {
          router.replace('/login');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/login');
    }
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
