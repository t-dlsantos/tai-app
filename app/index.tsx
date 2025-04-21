import { useColorScheme } from 'nativewind';

import { View, Button } from 'react-native';

import { CarouselContexts } from '~/components/CarouselContexts';

export default function Home() {
  const { toggleColorScheme } = useColorScheme();

  return (
    <View className='flex-1 justify-center dark:bg-black'>
      <CarouselContexts />
      <Button title='Toggle' onPress={toggleColorScheme}/>
    </View>
  );
}