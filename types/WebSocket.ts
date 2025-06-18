export interface UseChatWebSocketOptions {
  chatId: string;
  userId: number | string;
  mode: 'solo' | 'group';
}

export interface ChatState {
  isConnected: boolean;
  isWaiting: boolean;
  isReady: boolean;
  participants: string[];
  currentTurn: string | null;
  isThinking: boolean;
  error: string | null;
}

export interface WebSocketMessage {
  type: 'message' | 'stream' | 'done' | 'turn' | 'join' | 'thinking' | 'leave' | 'participants' | 'error' | 'ready_to_start' | 'waiting';
  message?: string;
  content?: string;
  role?: 'user' | 'assistant';
  sender?: string | number;
  chunk?: string;
  current_turn?: string | number;
  user?: string;
  count?: number;
  value?: boolean;
  participants?: string[];
}