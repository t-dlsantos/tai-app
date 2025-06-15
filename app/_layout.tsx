import '../global.css';

import { useEffect } from 'react';

import { Inter_900Black, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';

import { SplashScreen, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_900Black,
    Inter_700Bold,
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
      <View className="flex-1 dark:bg-[#040A18]">
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="chat/[chat]"
              options={{ headerShown: false, animation: 'simple_push' }}
            />
            <Stack.Screen
              name="room"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
                headerShown: false,
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
  );
}
