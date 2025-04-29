import { useState } from 'react';

import { useColorScheme } from 'nativewind';

import { View, Button } from 'react-native';

import { CarouselContexts } from '~/components/CarouselContexts';
import { Logo } from '~/components/Logo';

export default function Home() {
  const { toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 w-full justify-center items-center dark:bg-black">
      <Logo />
      <CarouselContexts />
      <Button title='change' onPress={toggleColorScheme}/>
    </View>
  );
}
