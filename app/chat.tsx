import { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import { useImmer } from 'use-immer';

import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import { LoadingMessage } from '~/components/LoadingMessage';
import { ChatMessage } from '~/components/ChatMessage';

import chat from '~/services/chat';

import { Message } from '~/types/Message';
import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';


interface Feedback {
  type: 'loading' | 'typing' | 'error';
  text: string;
}

export default function Chat() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<null | Feedback>(null);

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

      <View className="min-h-8 w-full flex-row items-center rounded-2xl bg-zinc-200 p-2 dark:bg-zinc-900">
        <TextInput
          className="flex-1 text-black text-lg"
          value={input}
          onChangeText={setInput}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="gray"
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" color="gray" size={18} />
        </TouchableOpacity>
      </View>
    </Container>
  );
}
