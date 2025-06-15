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
    const ws = new WebSocket(`ws://192.168.1.6:8000/ws/${chatId}/${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

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
      console.error('WebSocket error:', event);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [chatId, userId]);

  return {
    messages,
    currentTurn,
    isMyTurn,
    sendMessage,
  };
}
