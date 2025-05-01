import { useState } from 'react';

import EventSource from 'react-native-sse';
import 'react-native-url-polyfill/auto';

import { useImmer } from 'use-immer';

import { ChatContainer } from '~/components/ChatContainer';
import { ChatInput } from '~/components/ChatInput';
import { Container } from '~/components/Container';
import { Header } from '~/components/Header';

import chat from '~/services/chat';

import { Message } from '~/types/Message';

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useImmer<Message[]>([]);
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

      es.addEventListener('message', (event: any) => {
        setMessages(draft => {
          draft[draft.length - 1].loading = false;
        });

        const data = JSON.parse(event.data)
        const finish_reason = data?.finish_reason;
           
        if (finish_reason === "stop") {
          es.close();
        }  else {
          setMessages((draft) => {
            draft[draft.length - 1].content += data.message;
          });
          return;
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
    <Container>
      <Header showBackButton />
      <ChatContainer messages={messages} />
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={submitNewMessage}
      />
    </Container>
  );
}
