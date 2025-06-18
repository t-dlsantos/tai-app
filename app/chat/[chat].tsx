import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, TouchableOpacity, View, Text } from 'react-native';

import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import { LoadingMessage } from '~/components/LoadingMessage';
import { ChatMessage } from '~/components/ChatMessage';
import { ChatStatus } from '~/components/ChatStatus';

import { TextInput } from 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';

import { sendAudio } from '~/services/audio';

import { useLocalSearchParams } from 'expo-router';

import { useAudioRecording } from '~/hooks/useAudioRecording';
import { useChatWebSocket } from '~/hooks/useChatWebSocket';
import { useUserId } from '~/hooks/useUserId';

interface Feedback {
  type: 'loading' | 'typing' | 'error';
  text: string;
}

export default function Chat() {
  const { chat, mode } = useLocalSearchParams<{ chat: string; mode?: 'solo' | 'group' }>();
  const [feedback, setFeedback] = useState<null | Feedback>(null);
  const [input, setInput] = useState('');
  const [bannerVisible, setBannerVisible] = useState(false);
  const chatMode = mode ?? 'solo';
  const flatListRef = useRef<FlatList>(null);
  const userId = useUserId();

  const { 
    messages, 
    sendMessage, 
    notification, 
    chatState,
    isCurrentUserTurn, 
    isThinking,
    isConnected,
    isWaiting,
    isReady,
    participants,
    currentTurn,
    error,
    reconnect
  } = useChatWebSocket({
    chatId: chat!,
    userId,
    mode: chatMode,
  });

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } =
    useAudioRecording();

  function handleSendMessage() {
    if (!isCurrentUserTurn || isThinking) return;
    sendMessage(input);
    setInput('');
  }

  async function handleStartRecording() {
    if (!isCurrentUserTurn || isThinking) return;
    await startRecording();
  }

  async function handleStopRecording() {
    const uri = await stopRecording();

    if (uri) {
      try {
        const result = await sendAudio(uri);
        if (result.transcription) {
          setInput(result.transcription);
        }
      } catch (error) {
        Alert.alert('Erro ao enviar o áudio para o servidor');
      }
    }
  }

  useEffect(() => {
    if (notification) {
      setBannerVisible(true);
      const timer = setTimeout(() => {
        setBannerVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <Container>
      <Header showBackButton />
      
      {/* Chat Status */}
      <ChatStatus
        isConnected={isConnected}
        isWaiting={isWaiting}
        isThinking={isThinking}
        isCurrentUserTurn={isCurrentUserTurn}
        currentTurn={currentTurn}
        participants={participants}
        mode={chatMode}
        error={error}
        onReconnect={reconnect}
      />

      {/* Notification Banner */}
      {bannerVisible && notification && (
        <View
          style={{
            backgroundColor: '#333',
            padding: 8,
            position: 'absolute',
            top: 120,
            alignSelf: 'center',
            borderRadius: 8,
            zIndex: 1,
          }}>
          <Text style={{ color: '#fff' }}>{notification}</Text>
        </View>
      )}

      {/* Chat Messages */}
      <View className="w-full flex-1">
        <FlatList
          data={messages}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ChatMessage message={item} />}
          ListFooterComponent={() => (!isCurrentUserTurn ? <LoadingMessage /> : null)}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Input Area */}
      <View className="mt-2 w-full items-center gap-2 rounded-2xl border-t border-t-gray-300 bg-zinc-200 p-2 dark:bg-[#171731]">
        <TextInput
          className="w-full text-lg text-black dark:text-white"
          value={input}
          onChangeText={setInput}
          multiline={true}
          editable={isCurrentUserTurn && !isThinking && isConnected}
          placeholder={
            !isConnected
              ? 'Conectando...'
              : isThinking
              ? 'A IA está pensando...'
              : isCurrentUserTurn
              ? 'Digite sua mensagem'
              : `${currentTurn} está digitando...`
          }
          placeholderTextColor="gray"
        />
        
        {isRecording ? (
          <View className="w-full flex-row justify-between items-center">
            <TouchableOpacity onPress={cancelRecording}>
              <Ionicons name="close-circle" color="#ef4444" size={28} />
            </TouchableOpacity>
            <Text className="text-gray-600 dark:text-gray-300">
              {`${Math.floor(recordingTime / 60)}:${(recordingTime % 60)
                .toString()
                .padStart(2, '0')}`}
            </Text>
            <TouchableOpacity onPress={handleStopRecording}>
              <Ionicons name="checkmark-circle" color="#10b981" size={28} />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-full flex-row justify-end gap-4">
            <TouchableOpacity 
              onPress={handleStartRecording}
              disabled={!isCurrentUserTurn || isThinking || !isConnected}
            >
              <Ionicons 
                name="mic" 
                color={isCurrentUserTurn && !isThinking && isConnected ? "#6b7280" : "#d1d5db"} 
                size={24} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSendMessage}
              disabled={!isCurrentUserTurn || isThinking || !isConnected || !input.trim()}
            >
              <Ionicons 
                name="send" 
                color={isCurrentUserTurn && !isThinking && isConnected && input.trim() ? "#6b7280" : "#d1d5db"} 
                size={22} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Container>
  );
}
