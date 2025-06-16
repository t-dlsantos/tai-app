import { useEffect, useRef, useState } from "react";

import { useImmer } from "use-immer";

import { MessageProps } from "~/components/ChatMessage";

import { UseChatWebSocketOptions } from "~/types/WebSocket";

export function useChatWebSocket({ chatId, userId, mode }: UseChatWebSocketOptions) {
  const [messages, setMessages] = useImmer<MessageProps[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number | string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const isCurrentUserTurn = currentTurn === userId;

  const wsUrl = `ws://192.168.1.6:8000/ws/lobby/${chatId}/${userId}?mode=${mode}`;

  function sendMessage(text: string) {
    if (!text.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: 'message', message: text.trim() }));
  }

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          setMessages((draft) => [...draft, {
            role: data.role,
            content: data.message,
            sender: data.sender
          }]);
          break;

        case 'stream':
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
          break;

        case 'turn':
          const parsed = Number(data.current_turn);
          setCurrentTurn(isNaN(parsed) ? data.current_turn : parsed);
          break;

        case 'join':
          setNotification(`${data.user} entrou na sala`);
          break;
        
        case 'thinking':
          setIsThinking(data.value);
          break;

        case 'leave':
          setNotification(`${data.user} saiu da sala`);
          break;

        case 'participants':
          setNotification(`Participantes: ${data.count}`);
          break;

        case 'error':
          setNotification(`Erro: ${data.message}`);
          break;

        case 'ready_to_start':
          setNotification(data.message);
          break;

        default:
          console.warn('Tipo de mensagem desconhecido:', data.type);
      }
    };

    return () => ws.close();
  }, [wsUrl]);

  function disconnect() {
    wsRef.current?.close();
  }

  return {
    messages,
    sendMessage,
    disconnect,
    notification,
    currentTurn,
    isCurrentUserTurn,
    isThinking
  };
}
