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
import { ChatMessage, MessageProps } from '~/components/ChatMessage';

import { Message } from '~/types/Message';

import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { useAudioRecorder, RecordingPresets, useAudioPlayer, AudioModule } from 'expo-audio';

import { sendAudio } from '~/services/audio';
import chatService from '~/services/chat';
import { useLocalSearchParams } from 'expo-router';

interface Feedback {
  type: 'loading' | 'typing' | 'error';
  text: string;
}

export default function Chat() {
  const [chatId, setChatId] = useState<string | null>(null);
  const { chat } = useLocalSearchParams<{ chat: string }>();

  const [messages, setMessages] = useImmer<MessageProps[]>([]);
  const [input, setInput] = useState('');
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<null | Feedback>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [userId] = useState(() => Date.now());

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const isMyTurn = currentTurn === userId;

  async function sendMessage() {
    const inputText = input.trim();
    if (!inputText) return;

    setMessages((draft) => [...draft, { role: 'user', content: inputText }]);
    setInput('');

    wsRef.current?.send(inputText);
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

  useEffect(() => {
    const ws = new WebSocket(`ws://192.168.1.6:8000/ws/${chat}/${userId}`);
    wsRef.current = ws;
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log(data);

      if (data.type === 'message') {
        setMessages((draft) => [
          ...draft,
          { role: data.role, content: data.message, sender: data.sender },
        ]);
      } else if (data.type === 'turn') {
        setCurrentTurn(data.current_turn);
      }
    };

    ws.onerror = (event) => {
      console.log(event);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%', height: '100%' }}>
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
            placeholder={isMyTurn ? "Digite sua mensagem..." : `É a vez de: ${currentTurn}`}
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
            isMyTurn && (
              <View className="w-full flex-row justify-end gap-4">
                <TouchableOpacity onPress={isRecording ? stopRecording : record}>
                  <Ionicons name="mic" color="gray" size={24} />
                </TouchableOpacity>
                <TouchableOpacity onPress={sendMessage}>
                  <Ionicons name="send" color="gray" size={22} />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
