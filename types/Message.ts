export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  error?: boolean;
  sender: string;
}