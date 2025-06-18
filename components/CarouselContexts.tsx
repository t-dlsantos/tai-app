import { View, Text, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { contexts } from '~/constants/contexts';
import { CarouselItem } from './CarouselItem';
import { useState } from 'react';
import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import chat from '~/services/chat';

export function CarouselContexts() {
  const scrollOffsetValue = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreatingSolo, setIsCreatingSolo] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  async function handleSoloPractice() {
    if (isCreatingSolo) return;
    
    setIsCreatingSolo(true);
    try {
      const { id } = await chat.createChat(contexts[currentIndex].text);
      router.replace({
        pathname: '/chat/[chat]',
        params: { chat: id, mode: 'solo' },
      });
    } catch (err) {
      console.error('Erro ao criar chat:', err);
      alert('Erro ao criar prática solo. Tente novamente.');
    } finally {
      setIsCreatingSolo(false);
    }
  }

  function handleGroupPractice() {
    if (isCreatingGroup) return;
    
    setIsCreatingGroup(true);
    try {
      router.push({
        pathname: '/room',
        params: {
          theme: contexts[currentIndex].text,
        },
      });
    } catch (err) {
      console.error('Erro ao navegar para sala:', err);
      alert('Erro ao abrir sala. Tente novamente.');
    } finally {
      setIsCreatingGroup(false);
    }
  }

  return (
    <View className="w-full items-center justify-center rounded-xl border border-gray-200 bg-slate-900 p-8 dark:border-gray-800">
      <View className="h-48 flex-row items-center">
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
          <Text className="text-2xl font-bold text-white">{contexts[currentIndex].title}</Text>
          <Text className="mt-2 text-base text-gray-400 dark:text-gray-300">
            {contexts[currentIndex].description}
          </Text>
        </View>
      </View>
      
      <View className="w-full gap-3 mt-6">
        <TouchableOpacity
          className="bg-violet-500 h-12 w-full flex-row items-center justify-center gap-2 rounded-lg"
          onPress={handleSoloPractice}
          disabled={isCreatingSolo || isCreatingGroup}>
          {isCreatingSolo ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="person" color="white" size={20} />
          )}
          <Text className="font-medium text-zinc-100">
            {isCreatingSolo ? 'Criando...' : 'Praticar sozinho'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-violet-600 h-12 w-full flex-row items-center justify-center gap-2 rounded-lg"
          onPress={handleGroupPractice}
          disabled={isCreatingSolo || isCreatingGroup}>
          {isCreatingGroup ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="people" color="white" size={24} />
          )}
          <Text className="font-medium text-zinc-100">
            {isCreatingGroup ? 'Abrindo...' : 'Praticar com um amigo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
