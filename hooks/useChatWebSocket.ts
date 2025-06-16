import { useEffect, useRef, useState } from 'react';
import { MessageProps } from '~/components/ChatMessage';
import { useImmer } from 'use-immer';

interface UseChatWebSocketOptions {
  chatId: string;
  userId: number;
}

export function useChatWebSocket({ chatId, userId }: UseChatWebSocketOptions) {
  const [messages, setMessages] = useImmer<MessageProps[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const isMyTurn = currentTurn === userId;

  function sendMessage(text: string) {
    if (!text.trim()) return;

    setMessages((draft) => [
      ...draft,
      { role: 'user', content: text.trim(), sender: userId },
    ]);

    wsRef.current?.send(text.trim());
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://192.168.1.6:8000/ws/${chatId}/${userId.toString()}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          setMessages((draft) => [
            ...draft,
            { role: data.role, content: data.message, sender: data.sender },
          ]);
          break;

        case 'turn':
          setCurrentTurn(data.current_turn);
          break;

        case 'participants':
          setParticipantCount(data.count);
          break;

        case 'join':
          setNotification(`${data.user} entrou na sala`);
          break;

        case 'leave':
          setNotification(`${data.user} saiu da sala`);
          break;

        default:
          console.warn('Tipo de mensagem desconhecido:', data.type);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
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
    currentTurn,
    isMyTurn,
    sendMessage,
    participantCount,
    notification,
    disconnect,
  };
}
