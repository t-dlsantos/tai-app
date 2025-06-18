import EventSource from 'react-native-sse';
import 'react-native-url-polyfill/auto';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ChatResponse {
  message: string;
}

interface SendMessageOptions {
  onChunk?: (chunk: string) => void;
}

async function createChat(theme_title: string) {
  const res = await fetch("https://" + API_URL + '/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme_title: theme_title})
  });

  const data = await res.json();

  if (!res.ok) {
    return Promise.reject({ status: res.status, data });
  }

  return data;
}

async function checkChatExists(chatId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${API_URL}/chats/${chatId}`, {
      method: 'HEAD',
    });
    
    return res.ok;
  } catch (error) {
    console.error('Erro ao verificar chat:', error);
    return false;
  }
}

export default {
  createChat,
  checkChatExists
};