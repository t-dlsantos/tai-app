import { useEffect, useRef, useState } from 'react';

import { Share } from 'react-native';

import { router } from 'expo-router';

import chat from '~/services/chat';

import { useUserId } from '~/hooks/useUserId';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useCreateRoom() {
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const userId = useUserId();

  async function createRoomRequest(theme_title: string) {
    try {
      setError(null);
      const { id } = await chat.createChat(theme_title);
      setCreatedRoomId(id);
      setWaitingForOthers(true);
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      setError('Erro ao criar sala. Tente novamente.');
    }
  }

  async function shareRoomCode() {
    if (!createdRoomId) return;
    try {
      await Share.share({
        message: `Código da sala: ${createdRoomId}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar código:', error);
    }
  }
  
  useEffect(() => {
    if (!waitingForOthers || !createdRoomId) return;

    const protocol = API_URL?.includes('localhost') ? 'ws' : 'wss';
    const ws = new WebSocket(`${protocol}://${API_URL}/ws/group/${createdRoomId}/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (event.code !== 1000) {
        setError('Conexão perdida. Tentando reconectar...');
      }
    };

    ws.onerror = (error) => {
      console.error('Erro na conexão:', error);
      setError('Erro de conexão');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'waiting':
            setWaitingForOthers(true);
            break;
          
          case 'ready_to_start':
            ws.close();
            router.replace({
              pathname: '/chat/[chat]',
              params: { chat: createdRoomId, mode: 'group' },
            });
            setWaitingForOthers(false);
            break;

          case 'join':
            if (data.participants) {
              setParticipants(data.participants);
            }
            break;

          case 'error':
            setError(data.message || 'Erro desconhecido');
            break;

          default:
            console.log('Mensagem recebida:', data);
        }
      } catch (e) {
        console.error('Erro ao interpretar mensagem:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [waitingForOthers, createdRoomId]);

  function cancelRoom() {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setCreatedRoomId(null);
    setWaitingForOthers(false);
    setIsConnected(false);
    setParticipants([]);
    setError(null);
  }

  return {
    createdRoomId,
    waitingForOthers,
    isConnected,
    participants,
    error,
    createRoomRequest,
    shareRoomCode,
    cancelRoom,
  };
}
