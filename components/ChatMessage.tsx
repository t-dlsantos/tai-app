import { View, Text } from 'react-native';

export interface MessageProps {
  id: string;
  role: 'user' | 'assistant' | 'other_user';
  content: string;
  error?: boolean;
}

export function ChatMessage({ message }: { message: MessageProps }) {
  const isUser = message.role === 'user';

  return (
    <View
      className={`
            max-w-60 rounded-xl px-4 py-2
            ${isUser ? 'self-end bg-zinc-200' : 'self-start'}
        `}>
      <Text className="text-lg text-black">{message.content}</Text>
    </View>
  );
}
