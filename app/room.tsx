import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import chat from '~/services/chat';
import { useCreateRoom } from '~/hooks/useCreateRoom';

export default function Modal() {
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { theme } = useLocalSearchParams<{ theme : string }>();
  const { 
    createdRoomId, 
    waitingForOthers, 
    isConnected,
    participants,
    error,
    createRoomRequest, 
    shareRoomCode,
    cancelRoom
  } = useCreateRoom();

  async function handleCreateRoom() {
    await createRoomRequest(theme);
  }

  async function handleShareRoom() {
    await shareRoomCode();
  }

  async function handleConnectToRoom() {
    if (!joinRoomCode.trim()) return;
    
    setIsJoining(true);
    try {
      // Verificar se a sala existe antes de conectar
      const roomExists = await chat.checkChatExists(joinRoomCode);
      if (!roomExists) {
        alert('Sala não encontrada. Verifique o código.');
        return;
      }

      router.replace({
        pathname: '/chat/[chat]',
        params: {
          chat: joinRoomCode,
          mode: 'group',
        },
      });
    } catch (error) {
      alert('Erro ao conectar à sala. Verifique o código.');
    } finally {
      setIsJoining(false);
    }
  }

  const getStatusText = () => {
    if (error) return 'Erro de conexão';
    if (!isConnected && waitingForOthers) return 'Conectando...';
    if (waitingForOthers) return 'Aguardando outro participante...';
    return 'Pronto para criar';
  };

  const getStatusColor = () => {
    if (error) return '#ef4444';
    if (!isConnected && waitingForOthers) return '#f59e0b';
    if (waitingForOthers) return '#3b82f6';
    return '#10b981';
  };

  return (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center bg-[#00000040]">
      <Link href={'/(tabs)'} asChild>
        <Pressable />
      </Link>
      <Animated.View
        entering={SlideInDown}
        className="w-5/6 items-center justify-center rounded-lg bg-white p-5">
        
        {/* Tema da sala */}
        <View className="mb-6 w-full items-center">
          <Text className="text-lg font-bold text-gray-800">Tema: {theme}</Text>
        </View>

        {waitingForOthers ? (
          <Animated.View className="w-full items-center justify-center">
            {/* Status Indicator */}
            <View className="mb-4 flex-row items-center gap-2">
              <View 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getStatusColor() }}
              />
              <Text className="text-sm text-gray-600">{getStatusText()}</Text>
            </View>

            {error ? (
              <View className="mb-4 w-full bg-red-50 p-3 rounded-lg">
                <Text className="text-red-600 text-center">{error}</Text>
              </View>
            ) : (
              <>
                {!isConnected && (
                  <View className="mb-4 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text className="text-sm text-gray-600">Conectando...</Text>
                  </View>
                )}

                {isConnected && (
                  <View className="mb-4 items-center">
                    <Text className="text-sm text-gray-600 mb-2">
                      Código da sala:
                    </Text>
                    <Text className="text-lg font-mono font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded">
                      {createdRoomId}
                    </Text>
                  </View>
                )}

                {participants.length > 0 && (
                  <View className="mb-4 items-center">
                    <Text className="text-sm text-gray-600 mb-1">
                      Participantes conectados:
                    </Text>
                    <Text className="text-lg font-bold text-gray-800">
                      {participants.length}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View className="w-full gap-3">
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-lg bg-blue-500 p-3"
                onPress={handleShareRoom}
                disabled={!isConnected}>
                <Ionicons name="share-social" color="white" size={20} />
                <Text className="text-white font-medium">Compartilhar código</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-lg bg-red-500 p-3"
                onPress={cancelRoom}>
                <Ionicons name="close-circle" color="white" size={20} />
                <Text className="text-white font-medium">Cancelar sala</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <>
            <View className="mb-6 w-full gap-3">
              <Text className="text-lg font-bold text-gray-800">Criar Sala</Text>
              <Text className="text-sm text-gray-600 mb-2">
                Crie uma sala para praticar com um amigo
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-lg bg-purple-500 p-3"
                onPress={handleCreateRoom}>
                <Ionicons name="add-circle" color="white" size={20} />
                <Text className="text-white font-medium">Criar sala</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6 w-full gap-3">
              <Text className="text-lg font-bold text-gray-800">Conectar a uma Sala</Text>
              <Text className="text-sm text-gray-600 mb-2">
                Entre com o código fornecido por um amigo
              </Text>
              <TextInput
                onChangeText={setJoinRoomCode}
                value={joinRoomCode}
                placeholder="Cole aqui o código da sala"
                className="w-full rounded-lg bg-gray-100 p-3 text-gray-800"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-lg bg-purple-900 p-3"
                onPress={handleConnectToRoom}
                disabled={!joinRoomCode.trim() || isJoining}>
                {isJoining ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="enter" color="white" size={20} />
                )}
                <Text className="text-white font-medium">
                  {isJoining ? 'Conectando...' : 'Conectar'}
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View className="w-full items-center justify-center">
              <Link href="/(tabs)" className="flex-row items-center gap-2">
                <Ionicons name="arrow-back" color="#6b7280" />
                <Text className="text-sm text-gray-600">Voltar</Text>
              </Link>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}
