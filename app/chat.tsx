  import { useEffect, useState } from 'react';
  import { Alert, FlatList, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';

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
        setFeedback({type: "error", text: "Houve um erro"})
      }
    }

    async function record() {
      await audioRecorder.prepareToRecordAsync();
      setIsRecording(true);
      audioRecorder.record();
    }
    
    async function stopRecording() {
      setIsRecording(false);
      await audioRecorder.stop();
      setAudioURI(audioRecorder.uri);
    }

    function listen() {
      setIsListening(true)
      player.replace(audioURI);
      player.play();
    }
    
    function stopListening() {
      setIsListening(false);
      player.pause();
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
        style={{ flex: 1, width: '100%' }}
      >
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
        <View className="min-h-8 w-full flex-row items-center mb-2 rounded-2xl bg-zinc-200 p-2 dark:bg-zinc-900">
          <TextInput
            className="flex-1 text-black text-lg"
            value={input}
            onChangeText={setInput}
            multiline={true}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="gray"
          />
          <View className="gap-4 flex-row">
            <TouchableOpacity onPress={isRecording ? stopRecording : record}>
              <Ionicons name="mic" color={isRecording ? "red" : "gray"} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={isListening ? stopListening : listen}>
              <Ionicons name="play" color={isListening ? "red" : "gray"} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons name="send" color="gray" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
  }