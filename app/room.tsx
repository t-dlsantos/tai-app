import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { Link, router } from 'expo-router';

import { createURL } from 'expo-linking';

import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

import chat from '~/services/chat';

export default function Modal() {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  async function handleCreateRoom() {
    if (roomName.trim() === '') return;
    setWaitingForOthers(true);

    const { id } = await chat.createChat();
    setRoomId(id);

    handleShareRoom(id);
  }

  async function handleShareRoom(roomCode: string) {
    try {
      const deepLink = createURL(`/chat/${roomCode}`);

      await Share.share({
        message: `Vamos praticar inglês? Acessa a sala pelo link: ${deepLink}`,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if(!waitingForOthers || !roomId) return;

    const ws = new WebSocket(`ws://192.168.1.6:8000/ws/${roomId}/1`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Room WebSocket opened");
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'participants' && data.count > 1) {
          ws.close();
          setWaitingForOthers(false);
          router.replace({ pathname: '/chat/[chat]', params: { chat: roomId } });
        }
      } catch (e) {
  
      }
    }

    return () => {
      ws.close();
    };
  }, [waitingForOthers, roomId]);

  return (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center bg-[#00000040]">
      <Link href={'/home'} asChild>
        <Pressable />
      </Link>
      <Animated.View
        entering={SlideInDown}
        className="w-5/6 items-center justify-center rounded-lg bg-white p-5">
        {waitingForOthers ? (
          <Animated.View className="items-center justify-center">
            <Text>Esperando pelos participantes...</Text>
            <ActivityIndicator></ActivityIndicator>
          </Animated.View>
        ) : (
          <Animated.View className="w-full gap-3">
            <Text className="text-lg font-bold">Criar sala</Text>
            <TextInput
              onChangeText={setRoomName}
              value={roomName}
              placeholder="Digite aqui o nome da sala"
              className="w-full bg-gray-100"
            />
            <TouchableOpacity
              className="items-center rounded-lg bg-purple-500 p-2 px-6"
              onPress={handleCreateRoom}>
              <Text className="text-white">Criar</Text>
            </TouchableOpacity>
            <Animated.View className="w-full items-center justify-center">
              <Link href="/home" className='gap-4'>
                <Ionicons name="arrow-back" />
                <Text className="text-sm">Voltar</Text>
              </Link>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
