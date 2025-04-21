import '../global.css';
import { useEffect } from 'react';

import { Inter_900Black, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';

import * as SplashScreen from 'expo-splash-screen';

import { Stack } from 'expo-router';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    Inter_900Black,
    Inter_700Bold
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
    <GestureHandlerRootView>
      <StatusBar style='auto' />  
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}