import { View, Text, Image } from 'react-native';

import Logo from 'assets/logo.png';

export function Hero() {
  return (
    <View className="relative h-52 w-full flex-row items-center overflow-hidden rounded-lg bg-[#987BE6] p-2">
      <View
        className="absolute right-0 top-0 h-60 w-60 rounded-full bg-[#B9A0FF]"
        style={{
          transform: [{ scale: 1.5 }],
          right: -30,
          top: -30,
        }}
      />
      <View
        className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#987BE6]"
        style={{
          transform: [{ scale: 1.5 }],
          right: -20,
          top: -20,
        }}
      />
      <Text className="z-10 text-3xl font-bold text-white">Aprenda com{'\n'}situações reais</Text>
      <Image source={Logo} className="z-10 justify-self-end" />
    </View>
  );
}
