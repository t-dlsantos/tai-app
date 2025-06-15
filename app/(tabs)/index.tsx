import { useState } from 'react';
import { View, Text } from 'react-native';

import { CarouselContexts } from '~/components/CarouselContexts';
import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import { Hero } from '~/components/Hero';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  
  return (
    <Container>
      <Header />
      <View className="mb-7 gap-1 self-start">
        <Text className="text-3xl font-bold dark:text-white">Bem vindo!</Text>
        <Text className="text-base font-medium text-gray-600">
          A uma nova maneira de aprender inglês
        </Text>
      </View>
      <Hero />
      <View className="mt-5 w-full">
        <Text className="mb-5 text-xl font-semibold dark:text-white">Onde quer praticar hoje?</Text>
        <CarouselContexts onPracticeWithFriend={() => setModalVisible(true)}/>
      </View>
    </Container>
  );
}
