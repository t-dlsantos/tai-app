import { View } from 'react-native';

import { Tabs } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  
  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            borderColor: colorScheme === "dark" ? "#22273B" : '#dfdfdf',
            backgroundColor: colorScheme === "dark" ? "#040A18" : '#FFF',
            borderTopWidth: 0.8,
          },
          tabBarActiveTintColor: colorScheme === "dark" ? 'white' : "black"
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="decide"
          options={{
            title: 'Decide',
            tabBarIcon: ({ color }) => <MaterialIcons name="lightbulb" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
