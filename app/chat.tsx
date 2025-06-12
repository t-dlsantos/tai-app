import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';

import { useImmer } from 'use-immer';

import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import { LoadingMessage } from '~/components/LoadingMessage';
import { ChatMessage } from '~/components/ChatMessage';

import chat from '~/services/chat';

import { Message } from '~/types/Message';

import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { useAudioRecorder, RecordingPresets, useAudioPlayer, AudioModule } from 'expo-audio';
import { sendAudio } from '~/services/audio';

interface Feedback {
  type: 'loading' | 'typing' | 'error';
  text: string;
}

export default function Chat() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<null | Feedback>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();

  async function sendMessage() {
    const inputText = input.trim();
    if (!inputText) return;

    setMessages((draft) => [...draft, { role: 'user', content: inputText }]);
    setInput('');
    setFeedback({ type: 'loading', text: '' });

    let chatIdOrNew = chatId;

    try {
      if (!chatId) {
        const { id } = await chat.createChat();
        setChatId(id);
        chatIdOrNew = id;
      }

      if (!chatIdOrNew) {
        throw new Error('Failed to create or get chat ID');
      }

      setMessages((draft) => [
        ...draft,
        { role: 'assistant', content: '', loading: true, error: false },
      ]);

      await chat.sendMessage(chatIdOrNew, inputText, {
        onChunk: (chunk) => {
          setMessages((draft) => {
            draft[draft.length - 1].content += chunk;
          });
        },
      });

      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
      });

      setFeedback(null);
    } catch (err) {
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
      setFeedback({ type: 'error', text: 'Houve um erro' });
    }
  }

  async function record() {
    await audioRecorder.prepareToRecordAsync();
    setIsRecording(true);
    setRecordingTime(0);
    audioRecorder.record();

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }

  async function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecordingTime(0);
    setIsRecording(false);
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    setAudioURI(uri);

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

  async function cancelRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecordingTime(0);
    setIsRecording(false);
    await audioRecorder.stop();
    setAudioURI(null);
  }

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}>
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
        <View className="mb-2 gap-2 w-full items-center rounded-2xl bg-zinc-200 p-2 dark:bg-[#171731]">
          <TextInput
            className="w-full text-lg text-black dark:text-white"
            value={input}
            onChangeText={setInput}
            multiline={true}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="gray"
          />
          {isRecording ? (
            <View className="w-full flex-row justify-between">
              <TouchableOpacity onPress={cancelRecording}>
                <Ionicons name="close-circle" color="gray" size={28} />
              </TouchableOpacity>
              <Text className="text-">{`${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`}</Text>
              <TouchableOpacity onPress={stopRecording}>
                <Ionicons name="checkmark-circle" color="gray" size={28} />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-full flex-row justify-end gap-4">
              <TouchableOpacity onPress={isRecording ? stopRecording : record}>
                <Ionicons name="mic" color="gray" size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendMessage}>
                <Ionicons name="send" color="gray" size={22} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
