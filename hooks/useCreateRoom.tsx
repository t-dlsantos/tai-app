import { useEffect, useRef, useState } from 'react';

import { Share } from 'react-native';

import { router } from 'expo-router';

import chat from '~/services/chat';

import { useUserId } from '~/hooks/useUserId';


export function useCreateRoom() {
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const userId = useUserId();

  async function createRoomRequest(theme_title: string) {
    try {
      const { id } = await chat.createChat(theme_title);
      setCreatedRoomId(id);
      setWaitingForOthers(true);
    } catch (error) {
      console.error('Erro ao criar sala:', error);
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

    const ws = new WebSocket(`ws://192.168.1.6:8000/ws/lobby/${createdRoomId}/${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ready_to_start') {
          ws.close();
          setWaitingForOthers(false);
          router.replace({
            pathname: '/chat/[chat]',
            params: { chat: createdRoomId, mode: 'group' },
          });
        }
      } catch (e) {
        console.error('Erro ao interpretar mensagem:', e);
      }
    };

    return () => ws.close();
  }, [waitingForOthers, createdRoomId]);

  return {
    createdRoomId,
    waitingForOthers,
    createRoomRequest,
    shareRoomCode,
  };
}
