import { useState } from 'react';
import { View, Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import EventSource from 'react-native-sse';
import 'react-native-url-polyfill/auto';

import { useImmer } from 'use-immer';

import { ChatContainer } from '~/components/ChatContainer';
import { ChatInput } from '~/components/ChatInput';
import { Header } from '~/components/Header';

import chat from '~/services/chat';

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useImmer([]);
  const [newMessage, setNewMessage] = useState('');

  const isLoading = messages.length && messages[messages.length - 1].loading;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((draft) => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', sources: [], loading: true },
    ]);
    setNewMessage('');

    let chatIdOrNew = chatId;

    try {
      if (!chatId) {
        const { id } = await chat.createChat();
        setChatId(id);
        chatIdOrNew = id;
      }

      const es = new EventSource(`${apiUrl}/chats/${chatIdOrNew}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ message: trimmedMessage }),
      });

      es.addEventListener('open', (event) => {
        console.log('Open SSE connection.');
      });

      es.addEventListener('message', (event) => {
        console.log(event)
        if (event.data !== '[DONE]') {
          console.log(event.data)
          const data = JSON.parse(event.data);
          setMessages((draft) => {
            draft[draft.length - 1].content += data;
          });
        } else {
          es.close();
        }
      });

      es.addEventListener('error', (event) => {
        if (event.type === 'error') {
          console.error('Connection error:', event.message);
        } else if (event.type === 'exception') {
          console.error('Error:', event.message, event.error);
        }
      });

      es.addEventListener('close', (event) => {
        console.log('Close SSE connection.');
      });
    } catch (err) {
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = false;
      });
    }
  }

  return (
    <SafeAreaView className="w-full flex-1 items-center justify-center p-5 dark:bg-black">
      <Header showBackButton />
      <ChatContainer />
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={submitNewMessage}
      />
    </SafeAreaView>
  );
}
