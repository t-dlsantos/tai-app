import { useEffect, useRef, useState } from "react";

import { useImmer } from "use-immer";

import { MessageProps } from "~/components/ChatMessage";

import { UseChatWebSocketOptions, ChatState, WebSocketMessage } from "~/types/WebSocket";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useChatWebSocket({ chatId, userId, mode }: UseChatWebSocketOptions) {
  const [messages, setMessages] = useImmer<MessageProps[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    isConnected: false,
    isWaiting: false,
    isReady: false,
    participants: [],
    currentTurn: null,
    isThinking: false,
    error: null,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const isCurrentUserTurn = mode === 'solo' || chatState.currentTurn === String(userId);

  // Determina a URL correta baseada no modo
  const getWebSocketUrl = () => {
    const protocol = API_URL?.includes('localhost') ? 'ws' : 'wss';
    const endpoint = mode === 'solo' ? 'solo' : 'group';
    return `${protocol}://${API_URL}/ws/${endpoint}/${chatId}/${userId}`;
  };

  function sendMessage(text: string) {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({ 
      type: 'message', 
      message: text.trim() 
    }));
  }

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setChatState(prev => ({ ...prev, isConnected: true, error: null }));
      reconnectAttempts.current = 0;
    };

    ws.onclose = (event) => {
      console.log(`WebSocket desconectado: ${event.code} - ${event.reason}`);
      setChatState(prev => ({ ...prev, isConnected: false }));
      
      // Tentativa de reconexão automática
      if (reconnectAttempts.current < maxReconnectAttempts && event.code !== 1000) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      setChatState(prev => ({ ...prev, error: 'Erro de conexão' }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (e) {
        console.error('Erro ao interpretar mensagem:', e);
      }
    };
  };

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'message':
        setMessages((draft) => [...draft, {
          id: String(Date.now()),
          role: data.role || 'user',
          content: data.message || data.content || '',
          sender: typeof data.sender === 'number' ? data.sender : Number(data.sender || 0)
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
              content: data.chunk || '',
              sender: typeof data.sender === 'number' ? data.sender : Number(data.sender || 0),
            });
          }
        });
        break;

      case 'turn':
        const turnValue = data.current_turn ? String(data.current_turn) : null;
        setChatState(prev => ({ ...prev, currentTurn: turnValue }));
        break;

      case 'join':
        setNotification(`${data.user} entrou na sala`);
        if (data.participants) {
          setChatState(prev => ({ ...prev, participants: data.participants || [] }));
        }
        break;
      
      case 'thinking':
        setChatState(prev => ({ ...prev, isThinking: data.value || false }));
        break;

      case 'leave':
        setNotification(`${data.user} saiu da sala`);
        if (data.participants) {
          setChatState(prev => ({ ...prev, participants: data.participants || [] }));
        }
        break;

      case 'participants':
        setNotification(`Participantes: ${data.count}`);
        break;

      case 'error':
        setNotification(`Erro: ${data.message}`);
        setChatState(prev => ({ ...prev, error: data.message || 'Erro desconhecido' }));
        break;

      case 'ready_to_start':
        setChatState(prev => ({ 
          ...prev, 
          isReady: true, 
          isWaiting: false,
          participants: data.participants || prev.participants
        }));
        setNotification(data.message || 'Prática iniciada!');
        break;

      case 'waiting':
        setChatState(prev => ({ 
          ...prev, 
          isWaiting: true, 
          isReady: false 
        }));
        setNotification(data.message || 'Aguardando participantes...');
        break;

      default:
        console.warn('Tipo de mensagem desconhecido:', data.type);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [chatId, userId, mode]);

  function disconnect() {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
  }

  function reconnect() {
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(connect, 1000);
  }

  return {
    messages,
    sendMessage,
    disconnect,
    reconnect,
    notification,
    chatState,
    isCurrentUserTurn,
    isThinking: chatState.isThinking,
    isConnected: chatState.isConnected,
    isWaiting: chatState.isWaiting,
    isReady: chatState.isReady,
    participants: chatState.participants,
    currentTurn: chatState.currentTurn,
    error: chatState.error,
  };
}
