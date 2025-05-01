export interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  error?: boolean;
}