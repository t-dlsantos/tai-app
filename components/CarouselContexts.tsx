import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { contexts } from '~/constants/contexts';
import { CarouselItem } from './CarouselItem';
import { useState } from 'react';
import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPracticeWithFriend: () => void;
}

export function CarouselContexts({ onPracticeWithFriend } : Props) {
  const scrollOffsetValue = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <View className="items-center justify-center border p-8 rounded-xl bg-slate-900 w-full border-gray-200 dark:border-gray-800">
      <View className="flex-row h-48 items-center">
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
          <Text className="text-2xl font-bold text-white">
            {contexts[currentIndex].title}
          </Text>
          <Text className="mt-2 text-base text-gray-400 dark:text-gray-300">
            {contexts[currentIndex].description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="mt-2 h-12 w-full items-center flex-row gap-2 justify-center rounded-lg bg-violet-5 00"
        onPress={() => router.replace('/chat')}>
        <Ionicons name='person' color="white" size={20}/>
        <Text className="font-regular text-zinc-100 ">Praticar sozinho</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="h-12 w-full items-center flex-row gap-2 justify-center rounded-lg bg-violet-5 00"
        onPress={() => router.push('/room')}>
        <Ionicons name='people' color="white" size={24}/>
        <Text className="font-regular text-zinc-100 ">Praticar com um amigo</Text>
      </TouchableOpacity>
    </View>
  );
}
