import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { contexts } from '~/constants/contexts';
import { CarouselItem } from './CarouselItem';
import { useState } from 'react';
import { router } from 'expo-router';

export function CarouselContexts() {
  const scrollOffsetValue = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View className="items-center justify-center border p-4 rounded-xl border-gray-200 dark:border-gray-800">
      <View className="flex-row justify-center items-center">
        <Carousel
          loop={true}
          width={180}
          height={160}
          snapEnabled={true}
          pagingEnabled={true}
          autoPlay={true}
          autoPlayInterval={5000}
          data={contexts}
          defaultScrollOffsetValue={scrollOffsetValue}
          onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
            'worklet';
            g.enabled(false);
          }}
          onSnapToItem={(index) => setCurrentIndex(index)}
          renderItem={({ item, index }) => <CarouselItem context={item} key={index} />}
        />
        <View className="mt-16 w-44 justify-center px-4">
          <Text className="text-2xl font-bold text-black dark:text-white">
            {contexts[currentIndex].title}
          </Text>
          <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
            {contexts[currentIndex].description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="mt-12 h-16 w-full items-center justify-center rounded-lg bg-[#16162E]"
        onPress={() => router.replace('/chat')}>
        <Text className="text-lg font-bold text-zinc-100 ">Praticar este tema</Text>
      </TouchableOpacity>
    </View>
  );
}
