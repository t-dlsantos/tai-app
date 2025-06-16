import { useEffect, useRef, useState } from 'react';
import { useImmer } from 'use-immer';
import { MessageProps } from '~/components/ChatMessage';
import chat from '~/services/chat';
import { Message } from '~/types/Message';

interface UseSoloChatWebSocket {
  chatId: string;
  userId: number;
}

export function useSoloChatWebSocket({ chatId, userId }: UseSoloChatWebSocket) {
  const [messages, setMessages] = useImmer<Message[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  let buffer = '';
  const wsRef = useRef<WebSocket | null>(null);


  function sendMessage(text: string) {
    if (!text.trim()) return;

    setMessages((draft) => [...draft, { role: 'user', content: text.trim(), sender: userId }]);

    wsRef.current?.send(JSON.stringify({ type: 'message', content: text.trim() }));
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://192.168.1.6:8000/ws/solo/${chatId}/${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'stream':
          buffer += data.chunk;

          setMessages((draft) => {
            const last = draft[draft.length - 1];
            
            if (last?.role === 'assistant') {
              last.content += data.chunk;
            } else {
              draft.push({
                id: String(Date.now()),
                role: 'assistant',
                content: data.chunk,
                sender: data.sender,
              });
            }
          });
          break;

        case 'done':
          buffer = '';
          break;

        case 'error':
          setNotification(`Erro: ${data.message}`);
          break;

        default:
          console.warn('Tipo de mensagem desconhecido (modo solo):', data.type);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error (solo):', event);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [chatId, userId]);

  function disconnect() {
    wsRef.current?.close();
  }

  return {
    messages,
    sendMessage,
    notification,
    disconnect,
  };
}
