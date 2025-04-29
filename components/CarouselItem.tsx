import { View, Image, Text } from 'react-native';

import { ContextItem } from '~/types/ContextItem';

export function CarouselItem({ context }: { context: ContextItem }) {
  return (
    <View className="relative h-full items-center justify-center">
      <View className="absolute">
        {[...Array(3)].map((_, index) => (
          <Text
            className="text-[100px] font-bold leading-[1.1] text-black dark:text-white"
            key={index}>
            {context.text}
          </Text>
        ))}
      </View>
      <Image source={context.imageSource} />
    </View>
  );
}
