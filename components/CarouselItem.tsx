import { View, Image, Text } from 'react-native';

import { ContextItem } from '~/types/ContextItem';

export function CarouselItem({ context }: { context: ContextItem }) {
  return (
    <View className="relative h-full items-center justify-center">
      <View className="absolute">
        {[...Array(3)].map((_, index) => (
          <Text
            className="text-[36px] font-bold leading-[1.1] text-white dark:text-white"
            key={index}>
            {context.text}
          </Text>
        ))}
      </View>
      <Image
        source={context.imageSource}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
