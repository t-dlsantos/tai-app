import { useState } from 'react';
import { Alert, FlatList, TouchableOpacity, View, Text } from 'react-native';

import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import { LoadingMessage } from '~/components/LoadingMessage';
import { ChatMessage } from '~/components/ChatMessage';

import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { sendAudio } from '~/services/audio';

import { useLocalSearchParams } from 'expo-router';

import { useChatWebSocket } from '~/hooks/useChatWebSocket';
import { useAudioRecording } from '~/hooks/useAudioRecording';

interface Feedback {
  type: 'loading' | 'typing' | 'error';
  text: string;
}

export default function Chat() {
  const { chat } = useLocalSearchParams<{ chat: string }>();
  const [userId] = useState(() => Date.now());
  const [feedback, setFeedback] = useState<null | Feedback>(null);
  const [input, setInput] = useState('');

  const { messages, currentTurn, isMyTurn, sendMessage } = useChatWebSocket({
    chatId: chat!,
    userId,
  });

  const { isRecording, audioURI, recordingTime, startRecording, stopRecording, cancelRecording } =
    useAudioRecording();

  function handleSendMessage() {
    sendMessage(input);
    setInput('');
  }

  async function handleStartRecording() {
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

  return (
    <Container>
      <Header showBackButton />
      <View className="w-full flex-1">
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ChatMessage message={item} />}
          ListFooterComponent={() => (feedback?.type === 'loading' ? <LoadingMessage /> : null)}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View className="mb-2 w-full items-center gap-2 rounded-2xl bg-zinc-200 p-2 dark:bg-[#171731]">
        <TextInput
          className="w-full text-lg text-black dark:text-white"
          value={input}
          onChangeText={setInput}
          multiline={true}
          editable={isMyTurn}
          placeholder={isMyTurn ? 'Digite sua mensagem...' : `É a vez de: ${currentTurn}`}
          placeholderTextColor="gray"
        />
        {isRecording ? (
          <View className="w-full flex-row justify-between">
            <TouchableOpacity onPress={cancelRecording}>
              <Ionicons name="close-circle" color="gray" size={28} />
            </TouchableOpacity>
            <Text className="text-">{`${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`}</Text>
            <TouchableOpacity onPress={handleStopRecording}>
              <Ionicons name="checkmark-circle" color="gray" size={28} />
            </TouchableOpacity>
          </View>
        ) : (
          isMyTurn && (
            <View className="w-full flex-row justify-end gap-4">
              <TouchableOpacity onPress={handleStartRecording}>
                <Ionicons name="mic" color="gray" size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendMessage}>
                <Ionicons name="send" color="gray" size={22} />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </Container>
  );
}
