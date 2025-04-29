import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { contexts } from '~/constants/contexts';
import { CarouselItem } from './CarouselItem';
import { Dimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export function CarouselContexts() {
  const scrollOffsetValue = useSharedValue<number>(0);

  const screenWidth = Dimensions.get('window').width;

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View className="items-center justify-center mt-10">
      <Carousel
        loop={true}
        width={screenWidth}
        height={350}
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
      <View className="mt-16 w-72 items-center justify-center px-4">
        <Text className="text-3xl font-bold text-black dark:text-white">
          {contexts[currentIndex].title}
        </Text>
        <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">
          {contexts[currentIndex].description}
        </Text>
        <TouchableOpacity className="h-16 mt-12 w-64 items-center justify-center rounded-lg bg-[#1F2021]" onPress={() => router.replace('/chat')}>
          <Text className="font-bold text-zinc-100 text-lg ">Practice this theme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}