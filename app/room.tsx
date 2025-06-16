import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import chat from '~/services/chat';
import { useCreateRoom } from '~/hooks/useCreateRoom';

export default function Modal() {
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const { theme } = useLocalSearchParams<{ theme : string }>();
  const { createdRoomId, waitingForOthers, createRoomRequest, shareRoomCode } = useCreateRoom();

  async function handleCreateRoom() {
    await createRoomRequest(theme);
  }

  async function handleShareRoom() {
    await shareRoomCode();
  }

  function handleConnectToRoom() {
    if (!joinRoomCode.trim()) return;

    router.replace({
      pathname: '/chat/[chat]',
      params: {
        chat: joinRoomCode,
        mode: 'group',
      },
    });
  }

  return (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center bg-[#00000040]">
      <Link href={'/(tabs)'} asChild>
        <Pressable />
      </Link>
      <Animated.View
        entering={SlideInDown}
        className="w-5/6 items-center justify-center rounded-lg bg-white p-5">
        {waitingForOthers ? (
          <Animated.View className="items-center justify-center">
            <Text>Esperando por outro participante...</Text>
            <ActivityIndicator />
            <TouchableOpacity
              className="mt-4 flex-row items-center justify-center gap-2 rounded-lg bg-purple-500 p-3"
              onPress={handleShareRoom}>
              <Text className="text-white">Compartilhar o código</Text>
              <Ionicons name="share-social" color="white" size={24} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <Animated.View className="mb-6 w-full gap-3">
              <Text className="text-lg font-bold">Criar Sala</Text>
              <TouchableOpacity
                className="mt-2 items-center rounded-lg bg-purple-500 p-2 px-6"
                onPress={handleCreateRoom}>
                <Text className="text-white">Criar</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View className="mb-6 w-full gap-3">
              <Text className="text-lg font-bold">Conectar a uma Sala</Text>
              <TextInput
                onChangeText={setJoinRoomCode}
                value={joinRoomCode}
                placeholder="Cole aqui o código da sala"
                className="w-full rounded bg-gray-100 p-2"
              />
              <TouchableOpacity
                className="mt-2 items-center rounded-lg bg-purple-900 p-2 px-6"
                onPress={handleConnectToRoom}>
                <Text className="text-white">Conectar</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View className="w-full items-center justify-center">
              <Link href="/(tabs)" className="flex-row items-center gap-2">
                <Ionicons name="arrow-back" />
                <Text className="text-sm">Voltar</Text>
              </Link>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}
