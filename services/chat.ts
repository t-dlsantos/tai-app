import EventSource from 'react-native-sse';
import 'react-native-url-polyfill/auto';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ChatResponse {
  message: string;
}

interface SendMessageOptions {
  onChunk?: (chunk: string) => void;
}

async function createChat() {
  const res = await fetch(API_URL + '/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  const data = await res.json();

  if (!res.ok) {
    return Promise.reject({ status: res.status, data });
  }

  return data;
}

async function sendMessage(
  chatId: string, 
  input: string, 
  options?: SendMessageOptions
): Promise<ChatResponse> {
  return new Promise((resolve, reject) => {
    let fullMessage = '';

    const es = new EventSource(API_URL + `/chats/${chatId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ message: input }),
    });

    es.addEventListener('open', (event) => {
      console.log('Open SSE connection.');
    });

    es.addEventListener('message', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data?.finish_reason === 'stop') {
          es.close();
          resolve({ message: fullMessage });
          return;
        }

        const chunk = data.message;
        fullMessage += chunk;
        options?.onChunk?.(chunk);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    });

    es.addEventListener('error', (event) => {
      if (event.type === 'error') {
        console.error('Connection error:', event.message);
        reject(new Error('Connection error: ' + event.message));
      } else if (event.type === 'exception') {
        console.error('Error:', event.message, event.error);
        reject(new Error('Exception: ' + event.message));
      }
    });

    es.addEventListener('close', (event) => {
      console.log('Close SSE connection.');
    });
  });
}
export default {
  createChat,
  sendMessage
};
