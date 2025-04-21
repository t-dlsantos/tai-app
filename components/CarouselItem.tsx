import { View, Image, Text } from 'react-native';

import { ContextItem } from '~/types/ContextItem';

export function CarouselItem({ context } : { context: ContextItem }) {
    return(
        <View className='relative items-center justify-center'>
            <View className='absolute'>
                {[...Array(3)].map((_, index) => (
                    <Text className='text-8xl text-black font-bold dark:text-white' key={index}>
                        {context.title}
                    </Text>
                ))}
            </View>
            <Image source={context.imageSource} 
            />
        </View>
    );
}